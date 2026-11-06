import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={22} name="message-text-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={22} name="timeline-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="build"
        options={{
          title: "Build",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={22} name="hammer-wrench" color={color} />,
        }}
      />
      <Tabs.Screen
        name="model"
        options={{
          title: "Models",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons size={22} name="brain" color={color} />,
        }}
      />
    </Tabs>
  );
}
