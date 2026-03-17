import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import ListingCard, { type Listing } from "@/components/ListingCard";
import { Colors } from "@/constants/colors";

const CATEGORIES = [
  { label: "Todos", value: "" },
  { label: "Monomotor", value: "single_engine_piston" },
  { label: "Multimotor", value: "multi_engine_piston" },
  { label: "Turbohélice", value: "turboprop" },
  { label: "Jato", value: "jet" },
  { label: "Helicóptero", value: "helicopter" },
];

const PRICE_RANGES = [
  { label: "Qualquer preço", min: 0, max: 0 },
  { label: "Até $500k", min: 0, max: 500000 },
  { label: "$500k – $1M", min: 500000, max: 1000000 },
  { label: "$1M – $3M", min: 1000000, max: 3000000 },
  { label: "Acima de $3M", min: 3000000, max: 0 },
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [category, setCategory] = useState(params.category ?? "");
  const [priceRange, setPriceRange] = useState(0);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [category, priceRange]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("aircraft_listings")
      .select("id, title, price, currency, location_city, location_state, year, total_time_hours, images, category, manufacturer, model")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50);

    if (query.trim()) {
      q = q.ilike("title", `%${query.trim()}%`);
    }
    if (category) {
      q = q.eq("category", category);
    }
    const range = PRICE_RANGES[priceRange];
    if (range.min > 0) q = q.gte("price", range.min);
    if (range.max > 0) q = q.lte("price", range.max);

    const { data } = await q;
    setListings(data ?? []);
    setLoading(false);
  }, [query, category, priceRange]);

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Fabricante, modelo..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={fetchListings}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFiltersOpen(true)}
        >
          <Text style={styles.filterBtnText}>⚙ Filtros</Text>
        </TouchableOpacity>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.chip, category === cat.value && styles.chipActive]}
            onPress={() => setCategory(cat.value)}
          >
            <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      {loading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ListingCard listing={item} horizontal />}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhuma aeronave encontrada.</Text>
          }
          ListHeaderComponent={
            <Text style={styles.count}>{listings.length} aeronaves</Text>
          }
        />
      )}

      {/* Filters modal */}
      <Modal visible={filtersOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={() => setFiltersOpen(false)}>
              <Text style={styles.modalClose}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.filterLabel}>Faixa de Preço</Text>
          {PRICE_RANGES.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.filterOption, priceRange === i && styles.filterOptionActive]}
              onPress={() => setPriceRange(i)}
            >
              <Text style={[styles.filterOptionText, priceRange === i && styles.filterOptionTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => {
              setFiltersOpen(false);
              fetchListings();
            }}
          >
            <Text style={styles.applyBtnText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  filterBtnText: { color: Colors.white, fontSize: 13, fontWeight: "600" },
  chips: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize: 12, color: Colors.text, fontWeight: "500" },
  chipTextActive: { color: Colors.white, fontWeight: "600" },
  list: { padding: 12 },
  count: { fontSize: 12, color: Colors.textMuted, marginBottom: 8 },
  empty: { textAlign: "center", color: Colors.textMuted, marginTop: 40, fontSize: 14 },
  modal: { flex: 1, padding: 20 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: Colors.text },
  modalClose: { fontSize: 15, color: Colors.accent },
  filterLabel: { fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 12 },
  filterOption: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  filterOptionActive: { borderColor: Colors.accent, backgroundColor: "#EFF6FF" },
  filterOptionText: { fontSize: 14, color: Colors.text },
  filterOptionTextActive: { color: Colors.accent, fontWeight: "600" },
  applyBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  applyBtnText: { color: Colors.white, fontSize: 15, fontWeight: "700" },
});
