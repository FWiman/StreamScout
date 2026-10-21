import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AuthProvider } from "@/auth/AuthProvider";
import { TopNav } from "@/components/TopNav";
import { useIsWide } from "@/hooks/useIsWide";
import { colors } from "@/theme";

export default function RootLayout() {
  const isWide = useIsWide();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 60 * 1000, // TMDB-listor ändras sällan, cacha i 10 min
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        {/* Dator: en gemensam toppmeny för alla sidor. Telefon: varje navigator har sin egen rubrik. */}
        {isWide && <TopNav />}
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="title/[type]/[id]" options={{ title: "", headerShown: !isWide }} />
          <Stack.Screen name="about" options={{ title: "Om StreamWatch", headerShown: !isWide }} />
        </Stack>
      </View>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
