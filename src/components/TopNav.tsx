import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, router, useGlobalSearchParams, usePathname } from "expo-router";
import { useEffect, useRef, useState, type ComponentRef } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSearch } from "@/api/queries";
import { useAuth } from "@/auth/AuthProvider";
import type { MediaItem } from "@/api/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGutter } from "@/hooks/useGutter";
import { colors, noFocusOutline, spacing } from "@/theme";
import { Logo } from "./Logo";
import { SearchResultRow } from "./SearchResultRow";

const LINKS = [
  { href: "/", label: "Hem" },
  { href: "/movies", label: "Filmer" },
  { href: "/series", label: "Serier" },
] as const;

/** Antal träffar i rullgardinen. */
const DROPDOWN_LIMIT = 6;

/**
 * Toppmeny för datorlayouten: logga, sektioner och sökfält.
 * Medan man skriver fälls en lista med de bästa träffarna ut under fältet.
 * Piltangenterna väljer, Enter öppnar, Esc stänger.
 */
export function TopNav() {
  const pathname = usePathname();
  const gutter = useGutter();
  const { q } = useGlobalSearchParams<{ q?: string }>();
  const onSearchPage = pathname === "/search";

  const [query, setQuery] = useState(onSearchPage ? q ?? "" : "");
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  // ComponentRef ger rätt instanstyp för fältet (ändrades i React Native 0.87).
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const debounced = useDebouncedValue(query, 200).trim();
  const search = useSearch(debounced, "all");
  const results = search.items.slice(0, DROPDOWN_LIMIT);

  // På söksidan visas resultaten redan stort – då behövs ingen rullgardin.
  const showDropdown = open && !onSearchPage && debounced.length > 1;

  // Fältet töms när man lämnar söksidan; kommer man dit via en länk med ?q= fylls det i.
  useEffect(() => {
    if (onSearchPage) {
      if (q && !query) setQuery(q);
    } else {
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSearchPage]);

  // Ny söktext → ingen rad markerad.
  useEffect(() => setActive(-1), [debounced]);

  const onChange = (text: string) => {
    setQuery(text);
    setOpen(true);
    if (onSearchPage) router.setParams({ q: text });
  };

  const openTitle = (item: MediaItem) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(`/title/${item.type}/${item.id}`);
  };

  const showAll = () => {
    setOpen(false);
    if (query.trim().length > 1) router.push({ pathname: "/search", params: { q: query.trim() } });
  };

  const onSubmit = () => {
    if (showDropdown && active >= 0 && results[active]) openTitle(results[active]);
    else showAll();
  };

  const onKeyPress = (key: string) => {
    if (key === "Escape") {
      if (open && query) setOpen(false);
      else onChange("");
    } else if (key === "ArrowDown" && showDropdown) {
      // Sista "raden" är länken "Visa alla resultat".
      setActive((i) => Math.min(i + 1, results.length));
    } else if (key === "ArrowUp" && showDropdown) {
      setActive((i) => Math.max(i - 1, -1));
    }
  };

  return (
    <View style={styles.bar}>
      <View style={[styles.inner, { paddingHorizontal: gutter }]}>
        <Link href="/" accessibilityLabel="Till startsidan">
          <Logo />
        </Link>

        <View style={styles.links}>
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={[styles.link, isActive && styles.linkActive]}>
                {link.label}
              </Link>
            );
          })}
        </View>

        <View style={styles.searchArea}>
          <View style={[styles.search, focused && styles.searchFocused]}>
            <Ionicons name="search" size={18} color={focused ? colors.text : colors.textMuted} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={onChange}
              onSubmitEditing={onSubmit}
              onFocus={() => {
                clearTimeout(blurTimer.current);
                setFocused(true);
                setOpen(true);
              }}
              onBlur={() => {
                setFocused(false);
                // Vänta lite så att ett klick i listan hinner registreras innan den stängs.
                blurTimer.current = setTimeout(() => setOpen(false), 150);
              }}
              onKeyPress={(e) => onKeyPress(e.nativeEvent.key)}
              placeholder="Sök filmer och serier"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, noFocusOutline]}
              returnKeyType="search"
              autoCorrect={false}
            />
            {search.isFetching && debounced.length > 1 ? (
              <ActivityIndicator size="small" color={colors.textMuted} />
            ) : query.length > 0 ? (
              <Pressable
                onPress={() => {
                  onChange("");
                  inputRef.current?.focus();
                }}
                accessibilityLabel="Rensa sökningen"
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          {showDropdown && (
            <View style={styles.dropdown}>
              {results.map((item, i) => (
                <SearchResultRow
                  key={`${item.type}-${item.id}`}
                  item={item}
                  compact
                  active={i === active}
                  onPress={() => openTitle(item)}
                />
              ))}

              {!search.isPending && results.length === 0 && (
                <Text style={styles.empty}>Inga träffar för "{debounced}"</Text>
              )}

              {results.length > 0 && (
                <Pressable
                  onPress={showAll}
                  style={[styles.showAll, active === results.length && styles.showAllActive]}
                  accessibilityRole="link"
                >
                  <Text style={styles.showAllText}>Visa alla resultat för "{debounced}"</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.accent} />
                </Pressable>
              )}
            </View>
          )}
        </View>

        <AccountButton active={pathname === "/account"} />
      </View>
    </View>
  );
}

/** "Logga in" för utloggade, en rund bokstavsikon för inloggade. Leder till kontosidan. */
function AccountButton({ active }: { active: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <View style={styles.avatar} />;

  if (!user) {
    return (
      <Link href="/account" style={[styles.signIn, active && styles.signInActive]}>
        Logga in
      </Link>
    );
  }

  const initial = (user.email ?? "?").charAt(0).toUpperCase();
  return (
    <Link href="/account" accessibilityLabel="Mitt konto">
      <View style={[styles.avatar, styles.avatarSignedIn, active && styles.avatarActive]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
    // Rullgardinen ska ligga ovanpå sidans innehåll.
    zIndex: 10,
  },
  inner: {
    width: "100%",
    height: 64,
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
  signIn: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.accent,
  },
  signInActive: {
    opacity: 0.85,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarSignedIn: {
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarActive: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  avatarText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  searchArea: {
    width: 360,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
  },
  dropdown: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 420,
    padding: spacing.sm,
    gap: 2,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  empty: {
    color: colors.textMuted,
    padding: spacing.md,
  },
  showAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    borderRadius: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  showAllActive: {
    backgroundColor: colors.highlight,
  },
  showAllText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
});
