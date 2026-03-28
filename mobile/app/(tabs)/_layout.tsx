import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({ name, color }: { name: IoniconName; color: string }) {
  return <Ionicons name={name} size={21} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          paddingBottom: 4,
          paddingTop: 4,
          height: 58,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.2,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 17,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Buscar",
          headerTitle: "Buscar Aeronaves",
          tabBarIcon: ({ color }) => <TabIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="valuation"
        options={{
          title: "Avaliação",
          headerTitle: "Avaliação de Aeronave",
          tabBarIcon: ({ color }) => (
            <TabIcon name="analytics" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Salvos",
          headerTitle: "Aeronaves Salvas",
          tabBarIcon: ({ color }) => <TabIcon name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerTitle: "Meu Perfil",
          tabBarIcon: ({ color }) => <TabIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
