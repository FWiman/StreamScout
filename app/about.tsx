import { Image } from "expo-image";
import { Stack } from "expo-router";
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
      <Stack.Screen options={{ title: "Om StreamWatch" }} />

      <View style={[styles.page, { marginHorizontal: gutter }]}>
        <Logo size={28} />
        <Text style={styles.lead}>
          StreamWatch hjälper dig att hitta filmer och serier och se var de går att streama, hyra eller köpa i
          Sverige – på webben och i mobilen.
        </Text>

        <Section title="Källor">
          <Pressable
            onPress={() => WebBrowser.openBrowserAsync("https://www.themoviedb.org")}
            accessibilityRole="link"
            accessibilityLabel="The Movie Database (TMDB)"
          >
            <Image source={tmdbLogo} style={styles.tmdbLogo} contentFit="contain" />
          </Pressable>
          <Text style={styles.text}>
            Titlar, beskrivningar, bilder, betyg och trailers kommer från{" "}
            <ExternalLink url="https://www.themoviedb.org">The Movie Database (TMDB)</ExternalLink>.
          </Text>
          <Text style={[styles.text, styles.notice]}>{TMDB_NOTICE}</Text>
          <Text style={styles.text}>
            Information om vilka tjänster en titel finns på kommer från{" "}
            <ExternalLink url="https://www.justwatch.com/se">JustWatch</ExternalLink> via TMDB. Utbudet ändras ofta,
            så kontrollera alltid hos tjänsten.
          </Text>
        </Section>

        <Section title="Integritet">
          <Text style={styles.text}>
            StreamWatch har inga konton och samlar inte in några personuppgifter. Dina sökningar skickas till TMDB för
            att hämta resultat. Trailers öppnas hos YouTube, som har egna villkor.
          </Text>
        </Section>

        <Section title="Öppen källkod">
          <Text style={styles.text}>
            Appen är byggd med <ExternalLink url="https://expo.dev">Expo</ExternalLink>,{" "}
            <ExternalLink url="https://reactnative.dev">React Native</ExternalLink> och{" "}
            <ExternalLink url="https://tanstack.com/query">TanStack Query</ExternalLink>, som alla är licensierade
            under MIT-licensen. Ikoner från <ExternalLink url="https://ionic.io/ionicons">Ionicons</ExternalLink> (MIT).
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
