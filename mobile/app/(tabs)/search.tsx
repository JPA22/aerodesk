import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Modal, ScrollView,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ListingCard from "@/components/ListingCard";
import { Colors } from "@/constants/colors";
import {
  getDemoListings, CATEGORIES, ALL_MANUFACTURERS, MODELS_BY_MANUFACTURER,
  getManufacturersForCategory, type DemoListing,
} from "@/constants/demoData";

const YEAR_OPTIONS = [
  { label: "Qualquer ano", min: 0, max: 0 },
  { label: "2020+", min: 2020, max: 2026 },
  { label: "2015–2019", min: 2015, max: 2019 },
  { label: "2010–2014", min: 2010, max: 2014 },
  { label: "Antes de 2010", min: 1990, max: 2009 },
];

const HOURS_OPTIONS = [
  { label: "Qualquer", max: 0 },
  { label: "Até 500h", max: 500 },
  { label: "Até 1.000h", max: 1000 },
  { label: "Até 2.500h", max: 2500 },
  { label: "Até 5.000h", max: 5000 },
];

const PRICE_RANGES = [
  { label: "Qualquer preço", min: 0, max: 0 },
  { label: "Até $1M", min: 0, max: 1000000 },
  { label: "$1M – $5M", min: 1000000, max: 5000000 },
  { label: "$5M – $10M", min: 5000000, max: 10000000 },
  { label: "Acima de $10M", min: 10000000, max: 0 },
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [category, setCategory] = useState(params.category ?? "");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [priceRange, setPriceRange] = useState(0);
  const [yearRange, setYearRange] = useState(0);
  const [hoursRange, setHoursRange] = useState(0);
  const [listings, setListings] = useState<DemoListing[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // For cascading manufacturer picker inside filters
  const [showMfgPicker, setShowMfgPicker] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const fetchListings = useCallback(() => {
    const price = PRICE_RANGES[priceRange];
    const year = YEAR_OPTIONS[yearRange];
    const hours = HOURS_OPTIONS[hoursRange];
    const results = getDemoListings({
      category: category || undefined,
      manufacturer: manufacturer || undefined,
      query: query.trim() || undefined,
      minPrice: price.min > 0 ? price.min : undefined,
      maxPrice: price.max > 0 ? price.max : undefined,
      minYear: year.min > 0 ? year.min : undefined,
      maxYear: year.max > 0 ? year.max : undefined,
      maxHours: hours.max > 0 ? hours.max : undefined,
    });
    setListings(results);
  }, [query, category, manufacturer, priceRange, yearRange, hoursRange]);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => {
    if (params.q) setQuery(params.q);
    if (params.category) setCategory(params.category);
  }, [params.q, params.category]);

  const activeFilters = (manufacturer ? 1 : 0) + (model ? 1 : 0) + (priceRange > 0 ? 1 : 0) + (yearRange > 0 ? 1 : 0) + (hoursRange > 0 ? 1 : 0);
  const availableManufacturers = category ? getManufacturersForCategory(category) : ALL_MANUFACTURERS;
  const availableModels = manufacturer ? (MODELS_BY_MANUFACTURER[manufacturer] || []) : [];

  function clearFilters() {
    setManufacturer(""); setModel(""); setPriceRange(0); setYearRange(0); setHoursRange(0);
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={16} color={Colors.textMuted} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.input} placeholder="Fabricante, modelo..."
            placeholderTextColor={Colors.textMuted} value={query}
            onChangeText={setQuery} onSubmitEditing={fetchListings} returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]}
          onPress={() => setFiltersOpen(true)}
        >
          <Ionicons name="options" size={16} color={Colors.white} style={{ marginRight: 4 }} />
          <Text style={styles.filterBtnText}>
            Filtros{activeFilters > 0 ? ` (${activeFilters})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fixed-height category chips */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <TouchableOpacity style={[styles.chip, category === "" && styles.chipActive]} onPress={() => setCategory("")}>
            <Text style={[styles.chipText, category === "" && styles.chipTextActive]}>Todos</Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.chip, category === cat.key && styles.chipActive]}
              onPress={() => { setCategory(category === cat.key ? "" : cat.key); setManufacturer(""); setModel(""); }}
            >
              <Ionicons name={cat.icon as any} size={14} color={category === cat.key ? Colors.white : Colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.chipText, category === cat.key && styles.chipTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      {listings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={40} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhuma aeronave encontrada</Text>
          <Text style={styles.emptySub}>Tente ajustar seus filtros ou buscar por outro termo.</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ListingCard listing={item} variant="horizontal" />
          )}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={styles.count}>{listings.length} aeronave{listings.length !== 1 ? "s" : ""}</Text>
              {activeFilters > 0 && (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={styles.clearInline}>Limpar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Filters modal */}
      <Modal visible={filtersOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={() => setFiltersOpen(false)}>
              <Ionicons name="close" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Fabricante */}
            <Text style={styles.filterLabel}>Fabricante</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => { setShowMfgPicker(!showMfgPicker); setShowModelPicker(false); }}>
              <Text style={[styles.dropdownText, !manufacturer && styles.dropdownPlaceholder]}>
                {manufacturer || "Todos os fabricantes"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            {showMfgPicker && (
              <View style={styles.pickerList}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  <TouchableOpacity style={[styles.pickerItem, !manufacturer && styles.pickerItemActive]}
                    onPress={() => { setManufacturer(""); setModel(""); setShowMfgPicker(false); }}>
                    <Text style={[styles.pickerItemText, !manufacturer && styles.pickerItemTextActive]}>Todos</Text>
                  </TouchableOpacity>
                  {availableManufacturers.map((mfg) => (
                    <TouchableOpacity key={mfg} style={[styles.pickerItem, manufacturer === mfg && styles.pickerItemActive]}
                      onPress={() => { setManufacturer(mfg); setModel(""); setShowMfgPicker(false); }}>
                      <Text style={[styles.pickerItemText, manufacturer === mfg && styles.pickerItemTextActive]}>{mfg}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Modelo */}
            <Text style={[styles.filterLabel, { marginTop: 20 }]}>Modelo</Text>
            <TouchableOpacity
              style={[styles.dropdown, !manufacturer && styles.dropdownDisabled]}
              onPress={() => { if (manufacturer) { setShowModelPicker(!showModelPicker); setShowMfgPicker(false); } }}
            >
              <Text style={[styles.dropdownText, !model && styles.dropdownPlaceholder]}>
                {model || (manufacturer ? "Todos os modelos" : "Selecione fabricante primeiro")}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            {showModelPicker && availableModels.length > 0 && (
              <View style={styles.pickerList}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  <TouchableOpacity style={[styles.pickerItem, !model && styles.pickerItemActive]}
                    onPress={() => { setModel(""); setShowModelPicker(false); }}>
                    <Text style={[styles.pickerItemText, !model && styles.pickerItemTextActive]}>Todos</Text>
                  </TouchableOpacity>
                  {availableModels.map((m) => (
                    <TouchableOpacity key={m} style={[styles.pickerItem, model === m && styles.pickerItemActive]}
                      onPress={() => { setModel(m); setShowModelPicker(false); }}>
                      <Text style={[styles.pickerItemText, model === m && styles.pickerItemTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Faixa de Preço */}
            <Text style={[styles.filterLabel, { marginTop: 20 }]}>Faixa de Preço</Text>
            {PRICE_RANGES.map((r, i) => (
              <TouchableOpacity key={i} style={[styles.filterOption, priceRange === i && styles.filterOptionActive]} onPress={() => setPriceRange(i)}>
                <View style={styles.radioOuter}>{priceRange === i && <View style={styles.radioInner} />}</View>
                <Text style={[styles.filterOptionText, priceRange === i && styles.filterOptionTextActive]}>{r.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Ano */}
            <Text style={[styles.filterLabel, { marginTop: 20 }]}>Ano de Fabricação</Text>
            {YEAR_OPTIONS.map((r, i) => (
              <TouchableOpacity key={i} style={[styles.filterOption, yearRange === i && styles.filterOptionActive]} onPress={() => setYearRange(i)}>
                <View style={styles.radioOuter}>{yearRange === i && <View style={styles.radioInner} />}</View>
                <Text style={[styles.filterOptionText, yearRange === i && styles.filterOptionTextActive]}>{r.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Horas */}
            <Text style={[styles.filterLabel, { marginTop: 20 }]}>Horas Totais</Text>
            {HOURS_OPTIONS.map((r, i) => (
              <TouchableOpacity key={i} style={[styles.filterOption, hoursRange === i && styles.filterOptionActive]} onPress={() => setHoursRange(i)}>
                <View style={styles.radioOuter}>{hoursRange === i && <View style={styles.radioInner} />}</View>
                <Text style={[styles.filterOptionText, hoursRange === i && styles.filterOptionTextActive]}>{r.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Text style={styles.clearBtnText}>Limpar todos os filtros</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} onPress={() => { setShowMfgPicker(false); setShowModelPicker(false); setFiltersOpen(false); fetchListings(); }}>
            <Text style={styles.applyBtnText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: { flexDirection: "row", padding: 12, gap: 8, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: Colors.border },
  input: { flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.text },
  filterBtn: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 12, justifyContent: "center" },
  filterBtnActive: { backgroundColor: Colors.accent },
  filterBtnText: { color: Colors.white, fontSize: 13, fontWeight: "600" },

  // Fixed-height chips container
  chipsContainer: {
    height: 56,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    justifyContent: "center",
  },
  chips: { paddingHorizontal: 12, gap: 8, flexDirection: "row", alignItems: "center" },
  chip: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingHorizontal: 14, height: 36, borderRadius: 18,
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: "500" },
  chipTextActive: { color: Colors.white, fontWeight: "600" },

  list: { padding: 12, flexGrow: 1 },
  resultsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  count: { fontSize: 13, color: Colors.textMuted, fontWeight: "500" },
  clearInline: { fontSize: 13, color: Colors.error, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: Colors.text, marginTop: 12, marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: "center", lineHeight: 18 },

  // Modal
  modal: { flex: 1, padding: 20, backgroundColor: Colors.background },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingTop: 8 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: Colors.text },
  filterLabel: { fontSize: 14, fontWeight: "700", color: Colors.text, marginBottom: 10 },

  dropdown: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Colors.white, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: Colors.border },
  dropdownDisabled: { opacity: 0.5 },
  dropdownText: { fontSize: 14, color: Colors.text },
  dropdownPlaceholder: { color: Colors.textMuted },

  pickerList: { backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, marginTop: 4, overflow: "hidden" },
  pickerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  pickerItemActive: { backgroundColor: Colors.accentSoft },
  pickerItemText: { fontSize: 14, color: Colors.text },
  pickerItemTextActive: { color: Colors.accent, fontWeight: "600" },

  filterOption: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, marginBottom: 6 },
  filterOptionActive: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, marginRight: 12, justifyContent: "center", alignItems: "center" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  filterOptionText: { fontSize: 14, color: Colors.text },
  filterOptionTextActive: { color: Colors.accent, fontWeight: "600" },

  clearBtn: { alignItems: "center", padding: 14, marginTop: 12, borderWidth: 1, borderColor: Colors.error, borderRadius: 10 },
  clearBtnText: { color: Colors.error, fontSize: 14, fontWeight: "600" },
  applyBtn: { backgroundColor: Colors.accent, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 12 },
  applyBtnText: { color: Colors.white, fontSize: 15, fontWeight: "700" },
});
