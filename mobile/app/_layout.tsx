import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="listing/[id]"
          options={{
            title: "Aircraft Detail",
            headerStyle: { backgroundColor: "#0A1628" },
            headerTintColor: "#FFFFFF",
            headerTitleStyle: { fontWeight: "600" },
          }}
        />
      </Stack>
    </>
  );
}
