import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import ListingCard, { type Listing } from "@/components/ListingCard";
import { Colors } from "@/constants/colors";

const CATEGORIES = [
  { label: "Monomotor", value: "single_engine_piston" },
  { label: "Multimotor", value: "multi_engine_piston" },
  { label: "Turbohélice", value: "turboprop" },
  { label: "Jato", value: "jet" },
  { label: "Helicóptero", value: "helicopter" },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    const { data } = await supabase
      .from("aircraft_listings")
      .select("id, title, price, currency, location_city, location_state, year, total_time_hours, images, category, manufacturer, model")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(6);
    setListings(data ?? []);
    setLoading(false);
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedCategory) params.set("category", selectedCategory);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Hero header */}
      <View style={styles.hero}>
        <Text style={styles.logo}>
          <Text style={styles.logoWhite}>Aero</Text>
          <Text style={styles.logoBlue}>Desk</Text>
        </Text>
        <Text style={styles.tagline}>O marketplace moderno de aeronaves</Text>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar aeronaves..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.chip,
                selectedCategory === cat.value && styles.chipActive,
              ]}
              onPress={() =>
                setSelectedCategory(
                  selectedCategory === cat.value ? null : cat.value
                )
              }
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === cat.value && styles.chipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent listings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anúncios Recentes</Text>

          {loading ? (
            <ActivityIndicator color={Colors.accent} style={{ marginTop: 32 }} />
          ) : listings.length === 0 ? (
            <Text style={styles.empty}>Nenhum anúncio encontrado.</Text>
          ) : (
            <View style={styles.grid}>
              {listings.map((item) => (
                <View key={item.id} style={styles.gridItem}>
                  <ListingCard listing={item} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  hero: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },
  logoWhite: {
    color: Colors.white,
  },
  logoBlue: {
    color: Colors.accent,
  },
  tagline: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  searchBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: {
    fontSize: 18,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  categories: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500",
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "47.5%",
  },
  empty: {
    textAlign: "center",
    color: Colors.textMuted,
    marginTop: 32,
    fontSize: 14,
  },
});
