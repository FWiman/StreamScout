import { Image } from "expo-image";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useGutter } from "@/hooks/useGutter";
import { useIsWide } from "@/hooks/useIsWide";
import { colors, spacing } from "@/theme";
import { Logo } from "./Logo";

const tmdbLogo = require("../../assets/tmdb-logo.svg");

const LINKS = [
  { href: "/", label: "Hem" },
  { href: "/movies", label: "Filmer" },
  { href: "/series", label: "Serier" },
  { href: "/about", label: "Om StreamWatch" },
] as const;

/** Text som TMDB:s användarvillkor kräver, ordagrant på engelska. */
export const TMDB_NOTICE = "This product uses the TMDB API but is not endorsed or certified by TMDB.";

/**
 * Sidfot med länkar och de källhänvisningar som TMDB och JustWatch kräver.
 * TMDB-loggan måste vara mindre framträdande än vår egen logga.
 */
export function Footer() {
  const isWide = useIsWide();
  const gutter = useGutter();
  const year = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      <View style={[styles.inner, isWide && styles.innerWide, { paddingHorizontal: gutter }]}>
        <View style={styles.brand}>
          <Logo size={18} />
          <Text style={styles.tagline}>Hitta filmer och serier – och se var de streamas i Sverige.</Text>
        </View>

        <View style={[styles.links, isWide && styles.linksWide]}>
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={styles.link}>
              {link.label}
            </Link>
          ))}
        </View>

        <View style={styles.credits}>
          <Pressable
            onPress={() => WebBrowser.openBrowserAsync("https://www.themoviedb.org")}
            accessibilityRole="link"
            accessibilityLabel="The Movie Database (TMDB)"
          >
            <Image source={tmdbLogo} style={styles.tmdbLogo} contentFit="contain" />
          </Pressable>
          <Text style={styles.small}>{TMDB_NOTICE}</Text>
          <Text style={styles.small}>Streaminginformation från JustWatch.</Text>
        </View>
      </View>

      <Text style={styles.copyright}>© {year} StreamWatch</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
    gap: spacing.lg,
  },
  inner: {
    width: "100%",
    gap: spacing.lg,
  },
  innerWide: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brand: {
    gap: spacing.sm,
    maxWidth: 300,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  linksWide: {
    flexDirection: "column",
    gap: spacing.sm,
  },
  link: {
    color: colors.textMuted,
    fontSize: 14,
  },
  credits: {
    gap: spacing.sm,
    maxWidth: 320,
  },
  tmdbLogo: {
    width: 120,
    height: 16,
  },
  small: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  copyright: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
