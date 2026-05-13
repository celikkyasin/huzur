import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows } from "@/theme";
import type { IconName } from "@/types";

type TabIconProps = {
  focused: boolean;
  color: string;
  icon: IconName;
};

function TabIcon({ focused, color, icon }: TabIconProps) {
  return <Ionicons name={focused ? icon : (`${icon}-outline` as IconName)} size={22} color={color} />;
}

export function BottomTabs() {
  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.emerald,
        tabBarInactiveTintColor: "rgba(7,94,71,0.68)",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "900"
        },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 28,
          height: 82,
          borderRadius: radii.lg,
          borderTopWidth: 0,
          backgroundColor: colors.paper,
          paddingTop: 10,
          paddingBottom: 14,
          ...shadows.soft
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Ana Sayfa", tabBarIcon: (props) => <TabIcon {...props} icon="home" /> }} />
      <Tabs.Screen name="quran" options={{ title: "Kur'an", tabBarIcon: (props) => <TabIcon {...props} icon="book" /> }} />
      <Tabs.Screen name="qibla" options={{ title: "Kıble", tabBarIcon: (props) => <TabIcon {...props} icon="compass" /> }} />
      <Tabs.Screen name="duas" options={{ title: "Dualar", tabBarIcon: (props) => <TabIcon {...props} icon="leaf" /> }} />
      <Tabs.Screen name="more" options={{ title: "Daha Fazla", tabBarIcon: (props) => <TabIcon {...props} icon="ellipsis-horizontal" /> }} />
    </Tabs>
  );
}
