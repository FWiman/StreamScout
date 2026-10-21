import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";
import { Logo } from "@/components/Logo";
import { TopNav } from "@/components/TopNav";
import { useIsWide } from "@/hooks/useIsWide";
import { colors } from "@/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(name: IconName) {
  // Flikmenyn skickar en ColorValue; vi sätter alltid strängfärger i screenOptions nedan.
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color as string} size={size} />
  );
}

/**
 * Telefon: flikmeny längst ner.
 * Dator (bred webb): toppmeny med logga, länkar och sökfält – flikmenyn döljs.
 */
export default function TabLayout() {
  const isWide = useIsWide();

  return (
    <Tabs
      screenOptions={{
        header: isWide ? () => <TopNav /> : undefined,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        tabBarStyle: isWide
          ? { display: "none" }
          : { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Hem", headerTitle: () => <Logo size={20} />, tabBarIcon: tabIcon("home") }}
      />
      <Tabs.Screen name="movies" options={{ title: "Filmer", tabBarIcon: tabIcon("film") }} />
      <Tabs.Screen name="series" options={{ title: "Serier", tabBarIcon: tabIcon("tv") }} />
      <Tabs.Screen name="search" options={{ title: "Sök", tabBarIcon: tabIcon("search") }} />
    </Tabs>
  );
}
