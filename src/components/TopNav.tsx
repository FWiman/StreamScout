import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, router, useGlobalSearchParams, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, MAX_CONTENT_WIDTH, spacing } from "@/theme";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/", label: "Hem" },
  { href: "/movies", label: "Filmer" },
  { href: "/series", label: "Serier" },
] as const;

/** Toppmeny för datorlayouten: logga, sektioner och sökfält. */
export function TopNav() {
  const pathname = usePathname();
  const { q } = useGlobalSearchParams<{ q?: string }>();
  const onSearchPage = pathname === "/search";
  const [query, setQuery] = useState(onSearchPage ? q ?? "" : "");

  // Lämnar man söksidan töms fältet.
  useEffect(() => {
    if (!onSearchPage) setQuery("");
  }, [onSearchPage]);

  const onChange = (text: string) => {
    setQuery(text);
    // Står man redan på söksidan uppdateras resultaten medan man skriver.
    if (onSearchPage) router.setParams({ q: text });
  };

  const onSubmit = () => {
    if (!onSearchPage) router.push({ pathname: "/search", params: { q: query } });
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

        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={onChange}
            onSubmitEditing={onSubmit}
            placeholder="Sök filmer och serier"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => onChange("")} accessibilityLabel="Rensa sökningen">
              <Ionicons name="close" size={18} color={colors.textMuted} />
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
    width: 300,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    height: "100%",
  },
});
