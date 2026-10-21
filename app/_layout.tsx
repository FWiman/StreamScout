import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="title/[type]/[id]"
          options={isWide ? { header: () => <TopNav /> } : { title: "" }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
