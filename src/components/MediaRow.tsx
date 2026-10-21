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
import { useIsWide } from "@/hooks/useIsWide";
import { colors, spacing } from "@/theme";
import { MediaCard } from "./MediaCard";

interface Props {
  title: string;
  kind: ListKind;
  type: MediaType;
}

const CARD_WIDTH = 130;
const CARD_WIDTH_WIDE = 170;
const ARROW_SIZE = 44;
/** Luft ovanför och under korten så att hover-zoomen inte klipps av. */
const ZOOM_ROOM = spacing.sm;

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
  const isWide = useIsWide();
  const cardWidth = isWide ? CARD_WIDTH_WIDE : CARD_WIDTH;
  const posterHeight = cardWidth * 1.5;
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
            renderItem={({ item }) => <MediaCard item={item} width={cardWidth} />}
            contentContainerStyle={styles.list}
            showsHorizontalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={2}
            onScroll={onScroll}
            scrollEventThrottle={64}
            onContentSizeChange={(w) => setContentWidth(w)}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={[styles.footer, { width: cardWidth / 2, height: posterHeight }]}>
                  <ActivityIndicator color={colors.textMuted} />
                </View>
              ) : undefined
            }
          />

          {showArrows && canGoBack && (
            <Arrow direction="back" top={ZOOM_ROOM + posterHeight / 2} onPress={() => scrollBy(-1)} />
          )}
          {showArrows && canGoForward && (
            <Arrow direction="forward" top={ZOOM_ROOM + posterHeight / 2} onPress={() => scrollBy(1)} />
          )}
        </View>
      )}
    </View>
  );
}

interface ArrowProps {
  direction: "back" | "forward";
  /** Pilens mittpunkt i höjdled, i linje med affischernas mitt. */
  top: number;
  onPress: () => void;
}

function Arrow({ direction, top, onPress }: ArrowProps) {
  const isBack = direction === "back";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isBack ? "Scrolla bakåt" : "Scrolla framåt"}
      style={[styles.arrow, { top: top - ARROW_SIZE / 2 }, isBack ? styles.arrowBack : styles.arrowForward]}
    >
      <Ionicons name={isBack ? "chevron-back" : "chevron-forward"} size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
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
    paddingVertical: ZOOM_ROOM,
  },
  footer: {
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
