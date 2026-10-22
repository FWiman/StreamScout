import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";
import { Logo } from "@/components/Logo";
import { useIsWide } from "@/hooks/useIsWide";
import { colors } from "@/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(name: IconName) {
  // The tab bar passes a ColorValue; we always set string colors in screenOptions below.
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color as string} size={size} />
  );
}

/**
 * Phone: tab bar at the bottom.
 * Desktop (wide web): top nav with logo, links and search – the tab bar is hidden.
 */
export default function TabLayout() {
  const isWide = useIsWide();

  return (
    <Tabs
      screenOptions={{
        // On desktop the top nav lives in the root layout instead.
        headerShown: !isWide,
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
        options={{ title: "Home", headerTitle: () => <Logo size={20} />, tabBarIcon: tabIcon("home") }}
      />
      <Tabs.Screen name="movies" options={{ title: "Movies", tabBarIcon: tabIcon("film") }} />
      <Tabs.Screen name="series" options={{ title: "TV Shows", tabBarIcon: tabIcon("tv") }} />
      <Tabs.Screen name="search" options={{ title: "Search", tabBarIcon: tabIcon("search") }} />
      <Tabs.Screen name="account" options={{ title: "My List", tabBarIcon: tabIcon("bookmark-outline") }} />
    </Tabs>
  );
}
