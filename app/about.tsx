import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TMDB_NOTICE } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Screen } from "@/components/Screen";
import { useGutter } from "@/hooks/useGutter";
import { colors, spacing } from "@/theme";

const tmdbLogo = require("../assets/tmdb-logo.svg");

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {children}
    </View>
  );
}

function ExternalLink({ url, children }: { url: string; children: string }) {
  return (
    <Text style={styles.link} onPress={() => WebBrowser.openBrowserAsync(url)} accessibilityRole="link">
      {children}
    </Text>
  );
}

export default function AboutScreen() {
  const gutter = useGutter();
  return (
    <Screen>
      <Stack.Screen options={{ title: "About StreamWatch" }} />

      <View style={[styles.page, { marginHorizontal: gutter }]}>
        <Logo size={28} />
        <Text style={styles.lead}>
          StreamWatch helps you find movies and TV shows and see where you can stream, rent or buy them in
          Sweden – on the web and on your phone.
        </Text>

        <Section title="Sources">
          <Pressable
            onPress={() => WebBrowser.openBrowserAsync("https://www.themoviedb.org")}
            accessibilityRole="link"
            accessibilityLabel="The Movie Database (TMDB)"
          >
            <Image source={tmdbLogo} style={styles.tmdbLogo} contentFit="contain" />
          </Pressable>
          <Text style={styles.text}>
            Titles, descriptions, images, ratings and trailers come from{" "}
            <ExternalLink url="https://www.themoviedb.org">The Movie Database (TMDB)</ExternalLink>.
          </Text>
          <Text style={[styles.text, styles.notice]}>{TMDB_NOTICE}</Text>
          <Text style={styles.text}>
            Information about which services carry a title comes from{" "}
            <ExternalLink url="https://www.justwatch.com/se">JustWatch</ExternalLink> via TMDB. Catalogs change often,
            so always check with the service.
          </Text>
        </Section>

        <Section title="Privacy">
          <Text style={styles.text}>
            You can browse StreamWatch without an account. If you create one, we store your email address and the
            titles in My List – nothing else – with{" "}
            <ExternalLink url="https://supabase.com">Supabase</ExternalLink> in the EU (Stockholm). Your searches are
            sent to TMDB to fetch results. Trailers open on YouTube, which has its own terms.
          </Text>
          <Link href="/privacy" style={styles.link}>
            Read the full privacy policy
          </Link>
        </Section>

        <Section title="Open source">
          <Text style={styles.text}>
            The app is built with <ExternalLink url="https://expo.dev">Expo</ExternalLink>,{" "}
            <ExternalLink url="https://reactnative.dev">React Native</ExternalLink>,{" "}
            <ExternalLink url="https://tanstack.com/query">TanStack Query</ExternalLink> and{" "}
            <ExternalLink url="https://github.com/supabase/supabase-js">supabase-js</ExternalLink>, all licensed under
            the MIT license. Icons from <ExternalLink url="https://ionic.io/ionicons">Ionicons</ExternalLink> (MIT).
          </Text>
        </Section>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    maxWidth: 720,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  lead: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 28,
  },
  section: {
    gap: spacing.sm,
  },
  heading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  text: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  notice: {
    color: colors.text,
  },
  link: {
    color: colors.text,
    textDecorationLine: "underline",
  },
  tmdbLogo: {
    width: 150,
    height: 20,
    marginBottom: spacing.xs,
  },
});
