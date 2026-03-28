import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Colors } from "@/constants/colors";
import { useSaved } from "@/context/SavedContext";
import { DEMO_LISTINGS } from "@/constants/demoData";
import ListingCard from "@/components/ListingCard";

export default function SavedScreen() {
  const router = useRouter();
  const { savedIds } = useSaved();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => { setSession(s); });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <View style={styles.centered} />;

  if (!session) {
    return (
      <View style={styles.centered}>
        <View style={styles.iconWrap}><Ionicons name="heart" size={40} color={Colors.accent} /></View>
        <Text style={styles.title}>Faça login para ver seus salvos</Text>
        <Text style={styles.sub}>Salve aeronaves enquanto navega e acesse aqui quando estiver pronto.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/profile")}>
          <Text style={styles.primaryBtnText}>Entrar / Cadastrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push("/search")}>
          <Text style={styles.secondaryBtnText}>Explorar aeronaves →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const savedListings = DEMO_LISTINGS.filter((l) => savedIds.has(l.id));

  if (savedListings.length === 0) {
    return (
      <View style={styles.centered}>
        <View style={styles.iconWrap}><Ionicons name="heart-outline" size={40} color={Colors.accent} /></View>
        <Text style={styles.title}>Nenhuma aeronave salva</Text>
        <Text style={styles.sub}>Toque no coração em qualquer anúncio para salvar aqui.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/search")}>
          <Text style={styles.primaryBtnText}>Explorar aeronaves</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={savedListings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <ListingCard listing={item} variant="horizontal" />}
      ListHeaderComponent={
        <Text style={styles.count}>{savedListings.length} aeronave{savedListings.length !== 1 ? "s" : ""} salva{savedListings.length !== 1 ? "s" : ""}</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, backgroundColor: Colors.background },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.accentSoft, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 19, fontWeight: "700", color: Colors.text, textAlign: "center", marginBottom: 8 },
  sub: { fontSize: 14, color: Colors.textMuted, textAlign: "center", marginBottom: 28, lineHeight: 20, paddingHorizontal: 16 },
  primaryBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 36, marginBottom: 12 },
  primaryBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
  secondaryBtn: { paddingVertical: 10 },
  secondaryBtnText: { color: Colors.accent, fontWeight: "600", fontSize: 14 },
  list: { padding: 12, flexGrow: 1, backgroundColor: Colors.background },
  count: { fontSize: 13, color: Colors.textMuted, fontWeight: "500", marginBottom: 8 },
});
