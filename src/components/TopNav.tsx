import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, router, useGlobalSearchParams, usePathname } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, MAX_CONTENT_WIDTH, spacing } from "@/theme";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/", label: "Hem" },
  { href: "/movies", label: "Filmer" },
  { href: "/series", label: "Serier" },
] as const;

/**
 * Toppmeny för datorlayouten: logga, sektioner och sökfält.
 * Den ligger i rotlayouten och finns kvar mellan sidbyten, så sökfältet tappar
 * inte fokus när man skickas vidare till söksidan medan man skriver.
 */
export function TopNav() {
  const pathname = usePathname();
  const { q } = useGlobalSearchParams<{ q?: string }>();
  const onSearchPage = pathname === "/search";
  const [query, setQuery] = useState(onSearchPage ? q ?? "" : "");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Lämnar man söksidan töms fältet. Kommer man dit via en länk med ?q= fylls det i.
  useEffect(() => {
    if (!onSearchPage) setQuery("");
    else if (q && !query) setQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSearchPage]);

  const onChange = (text: string) => {
    setQuery(text);
    if (onSearchPage) {
      router.setParams({ q: text });
    } else if (text.trim().length > 0) {
      // Börja visa resultat direkt när man skriver – ingen Enter behövs.
      router.push({ pathname: "/search", params: { q: text } });
    }
  };

  const clear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Link href="/" accessibilityLabel="Till startsidan">
          <Logo />
        </Link>

        <View style={styles.links}>
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={[styles.link, active && styles.linkActive]}>
                {link.label}
              </Link>
            );
          })}
        </View>

        <View style={[styles.search, focused && styles.searchFocused]}>
          <Ionicons name="search" size={18} color={focused ? colors.text : colors.textMuted} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === "Escape") clear();
            }}
            placeholder="Sök filmer och serier"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={clear} accessibilityLabel="Rensa sökningen" hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  inner: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    height: 64,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
  },
  links: {
    flexDirection: "row",
    gap: spacing.lg,
    flex: 1,
  },
  link: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: spacing.sm,
  },
  linkActive: {
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: 320,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceRaised,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    height: "100%",
    // Ta bort webbläsarens egen fokusram – fältets kant visar fokus i stället.
    ...Platform.select({ web: { outlineWidth: 0 }, default: {} }),
  },
});
