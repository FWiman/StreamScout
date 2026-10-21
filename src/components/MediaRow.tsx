import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useMediaList, type ListKind } from "@/api/queries";
import type { MediaItem, MediaType } from "@/api/types";
import { colors, spacing } from "@/theme";
import { MediaCard } from "./MediaCard";

interface Props {
  title: string;
  kind: ListKind;
  type: MediaType;
}

const CARD_WIDTH = 130;
const POSTER_HEIGHT = CARD_WIDTH * 1.5;
const ARROW_SIZE = 40;

/**
 * En horisontell rad med affischer som hämtar fler titlar när man närmar sig slutet.
 * På bredare webbskärmar visas pilar, eftersom mushjulet bara scrollar i höjdled.
 */
export function MediaRow({ title, kind, type }: Props) {
  const { items, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useMediaList(kind, type);

  const listRef = useRef<FlatList<MediaItem>>(null);
  const [offset, setOffset] = useState(0);
  const [viewWidth, setViewWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  const { width: windowWidth } = useWindowDimensions();
  const showArrows = Platform.OS === "web" && windowWidth >= 768;
  const canGoBack = offset > 4;
  const canGoForward = offset + viewWidth < contentWidth - 4 || hasNextPage;

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const scrollBy = (direction: 1 | -1) => {
    const next = Math.max(0, offset + direction * viewWidth * 0.8);
    listRef.current?.scrollToOffset({ offset: next, animated: true });
    // Om pilen tar oss nära slutet, hämta nästa sida direkt.
    if (direction === 1 && next + viewWidth * 2 > contentWidth) loadMore();
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (showArrows) setOffset(e.nativeEvent.contentOffset.x);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {isPending ? (
        <ActivityIndicator color={colors.textMuted} style={styles.status} />
      ) : isError ? (
        <Text style={[styles.status, styles.error]}>Kunde inte hämta listan.</Text>
      ) : (
        <View onLayout={(e) => setViewWidth(e.nativeEvent.layout.width)}>
          <FlatList
            ref={listRef}
            horizontal
            data={items}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) => <MediaCard item={item} width={CARD_WIDTH} />}
            contentContainerStyle={styles.list}
            showsHorizontalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={2}
            onScroll={onScroll}
            scrollEventThrottle={64}
            onContentSizeChange={(w) => setContentWidth(w)}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.footer}>
                  <ActivityIndicator color={colors.textMuted} />
                </View>
              ) : null
            }
          />

          {showArrows && canGoBack && (
            <Arrow direction="back" onPress={() => scrollBy(-1)} />
          )}
          {showArrows && canGoForward && (
            <Arrow direction="forward" onPress={() => scrollBy(1)} />
          )}
        </View>
      )}
    </View>
  );
}

function Arrow({ direction, onPress }: { direction: "back" | "forward"; onPress: () => void }) {
  const isBack = direction === "back";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isBack ? "Scrolla bakåt" : "Scrolla framåt"}
      style={[styles.arrow, isBack ? styles.arrowBack : styles.arrowForward]}
    >
      <Ionicons name={isBack ? "chevron-back" : "chevron-forward"} size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  heading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: spacing.md,
  },
  list: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  footer: {
    width: CARD_WIDTH / 2,
    height: POSTER_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  status: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignSelf: "flex-start",
  },
  error: {
    color: colors.textMuted,
  },
  arrow: {
    position: "absolute",
    top: POSTER_HEIGHT / 2 - ARROW_SIZE / 2,
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    borderRadius: ARROW_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: colors.border,
  },
  arrowBack: {
    left: spacing.xs,
  },
  arrowForward: {
    right: spacing.xs,
  },
});
