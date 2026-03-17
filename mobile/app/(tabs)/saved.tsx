import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import ListingCard, { type Listing } from "@/components/ListingCard";
import { Colors } from "@/constants/colors";

export default function SavedScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchSaved(data.session.user.id);
      else setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) fetchSaved(s.user.id);
      else {
        setListings([]);
        setLoading(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchSaved(userId: string) {
    setLoading(true);
    const { data } = await supabase
      .from("saved_listings")
      .select("aircraft_listings(id, title, price, currency, location_city, location_state, year, total_time_hours, images, category, manufacturer, model)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const items = (data ?? [])
      .map((row: any) => row.aircraft_listings)
      .filter(Boolean) as Listing[];
    setListings(items);
    setLoading(false);
  }

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.title}>Faça login para ver seus salvos</Text>
        <Text style={styles.sub}>
          Salve aeronaves enquanto navega e acesse aqui quando estiver pronto.
        </Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/profile")}>
          <Text style={styles.loginBtnText}>Entrar / Cadastrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  return (
    <FlatList
      data={listings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <ListingCard listing={item} horizontal />}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>💙</Text>
          <Text style={styles.emptyTitle}>Nenhuma aeronave salva</Text>
          <Text style={styles.emptySub}>
            Toque no ♥ em qualquer anúncio para salvar.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => router.push("/search")}
          >
            <Text style={styles.browseBtnText}>Explorar aeronaves</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: Colors.background,
  },
  lockIcon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: Colors.text, textAlign: "center", marginBottom: 8 },
  sub: { fontSize: 14, color: Colors.textMuted, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  loginBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 32,
  },
  loginBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
  list: { padding: 12, flexGrow: 1, backgroundColor: Colors.background },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: Colors.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: "center", marginBottom: 20, lineHeight: 18 },
  browseBtn: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 24,
  },
  browseBtnText: { color: Colors.accent, fontWeight: "600", fontSize: 14 },
});
