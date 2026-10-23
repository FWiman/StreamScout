import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { useGutter } from "@/hooks/useGutter";
import { colors, spacing } from "@/theme";

/** Who to contact about personal data. */
const CONTACT_EMAIL = "streamscout.application@gmail.com";
const LAST_UPDATED = "23 October 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: ReactNode }) {
  return <Text style={styles.text}>{children}</Text>;
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bullet}>
      <Text style={styles.text}>•</Text>
      <Text style={[styles.text, styles.bulletText]}>{children}</Text>
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

/** Privacy policy – required by GDPR and the app stores since users can create accounts. */
export default function PrivacyScreen() {
  const gutter = useGutter();
  return (
    <Screen>
      <Stack.Screen options={{ title: "Privacy policy" }} />

      <View style={[styles.page, { marginHorizontal: gutter }]}>
        <Text style={styles.title}>Privacy policy</Text>
        <Text style={styles.updated}>Last updated {LAST_UPDATED}</Text>

        <P>
          StreamScout is a hobby project run by a private individual in Sweden, who is responsible for the personal
          data described here. Questions? Email{" "}
          <ExternalLink url={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</ExternalLink>.
        </P>

        <Section title="Without an account">
          <P>
            You can browse and search StreamScout without an account. We don&apos;t use analytics, advertising or
            tracking cookies, and we don&apos;t build profiles of visitors. Searches and page views are sent through
            our server to The Movie Database (TMDB) to fetch titles – without any information about who you are.
          </P>
        </Section>

        <Section title="What we store if you create an account">
          <Bullet>Your email address, and your password stored securely as a hash (we can never see it).</Bullet>
          <Bullet>
            If you sign in with Google or Apple: the email address, and name if provided, that they share with us.
          </Bullet>
          <Bullet>
            The titles you save to My List, the streaming services you pick under My services, and the titles you mark
            as seen, like, dislike or not interested.
          </Bullet>
          <Bullet>
            Technical data needed to run the service, such as when you signed in and your IP address in server logs,
            which are kept for a short time.
          </Bullet>
          <P>
            We use this only to give you an account and keep My List in sync between your devices. The legal basis is
            that it&apos;s needed to provide the service you sign up for (GDPR article 6.1 b). We never sell your data
            or use it for advertising.
          </P>
        </Section>

        <Section title="On your device">
          <P>
            To keep you signed in, a sign-in token is stored in your browser&apos;s local storage (or in the app on your
            phone). It&apos;s strictly necessary for the account to work and is removed when you sign out.
          </P>
        </Section>

        <Section title="Services we use">
          <Bullet>
            <ExternalLink url="https://supabase.com/privacy">Supabase</ExternalLink> stores accounts and My List in the EU
            (Stockholm, Sweden) and sends sign-in emails.
          </Bullet>
          <Bullet>
            <ExternalLink url="https://policies.google.com/privacy">Google</ExternalLink> and{" "}
            <ExternalLink url="https://www.apple.com/legal/privacy/">Apple</ExternalLink> handle sign-in if you choose
            them.
          </Bullet>
          <Bullet>
            <ExternalLink url="https://www.cloudflare.com/privacypolicy/">Cloudflare</ExternalLink> hosts the website
            and handles the streamscout.com domain, which means your IP address passes through their servers when you
            visit.
          </Bullet>
          <Bullet>
            Trailers open on YouTube, and streaming links open the service&apos;s own site or app. Their own privacy
            policies apply there.
          </Bullet>
          <P>
            Some of these companies are based in the USA. Transfers outside the EU are covered by the EU–US Data
            Privacy Framework or the EU&apos;s standard contractual clauses.
          </P>
        </Section>

        <Section title="How long we keep it">
          <P>
            As long as you have an account. You can delete your account at any time under Account → Delete account –
            your account and My List are then deleted immediately and permanently.
          </P>
        </Section>

        <Section title="Your rights">
          <P>
            You have the right to access, correct, export and delete your personal data, and to object to how it&apos;s
            used. Email us and we&apos;ll help. If you think we handle your data incorrectly, you can complain to the
            Swedish Authority for Privacy Protection,{" "}
            <ExternalLink url="https://www.imy.se/en/">IMY</ExternalLink>.
          </P>
        </Section>

        <Section title="Changes">
          <P>If this policy changes, we&apos;ll update it here and change the date at the top.</P>
        </Section>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    maxWidth: 720,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  updated: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: -spacing.md,
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
  bullet: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  bulletText: {
    flex: 1,
  },
  link: {
    color: colors.text,
    textDecorationLine: "underline",
  },
});
