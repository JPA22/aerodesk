import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SavedProvider } from "@/context/SavedContext";

export default function RootLayout() {
  return (
    <SavedProvider>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="listing/[id]"
          options={{
            title: "Detalhes",
            headerStyle: { backgroundColor: "#0A1628" },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: { fontWeight: "600" },
            headerBackTitle: "Voltar",
          }}
        />
      </Stack>
    </SavedProvider>
  );
}
