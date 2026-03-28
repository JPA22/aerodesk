import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { CATEGORIES, getManufacturersForCategory, MODELS_BY_MANUFACTURER } from "@/constants/demoData";

const YEARS = Array.from({ length: 30 }, (_, i) => 2026 - i);
const CONDITIONS = [
  { value: 1, label: "Project" }, { value: 3, label: "Fair" },
  { value: 5, label: "Good" }, { value: 7, label: "Very Good" },
  { value: 9, label: "Excellent" }, { value: 10, label: "Like New" },
];

interface ValuationResult { low: number; mid: number; high: number; confidence: number; }

function generateValuation(manufacturer: string, _model: string, year: number, condition: number): ValuationResult {
  const basePrices: Record<string, number> = {
    Gulfstream: 22000000, Bombardier: 16000000, Dassault: 18000000,
    Embraer: 8000000, Cessna: 5000000, Pilatus: 4500000,
    Beechcraft: 3500000, Piper: 2000000, Daher: 3500000,
    Cirrus: 800000, Diamond: 900000, Robinson: 600000,
    Bell: 3000000, "Airbus Helicopters": 4000000, Leonardo: 5000000, Sikorsky: 8000000,
  };
  const base = basePrices[manufacturer] || 2000000;
  const age = 2026 - year;
  const depreciation = Math.pow(0.92, age);
  const conditionFactor = 0.5 + (condition / 10) * 0.6;
  const mid = Math.round((base * depreciation * conditionFactor) / 10000) * 10000;
  const low = Math.round(mid * 0.85 / 10000) * 10000;
  const high = Math.round(mid * 1.15 / 10000) * 10000;
  const confidence = Math.min(95, 70 + condition * 2 + (age < 5 ? 5 : 0));
  return { low, mid, high, confidence };
}

function formatUSD(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  return `$${(amount / 1000).toFixed(0)}K`;
}

export default function ValuationScreen() {
  const [category, setCategory] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [condition, setCondition] = useState(7);
  const [engineProgram, setEngineProgram] = useState("enrolled");
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [showPicker, setShowPicker] = useState<"manufacturer" | "model" | "year" | null>(null);

  const availableManufacturers = getManufacturersForCategory(category);
  const availableModels = manufacturer ? (MODELS_BY_MANUFACTURER[manufacturer] || []) : [];

  function handleCategoryChange(key: string) {
    setCategory(key);
    // Reset downstream selections
    if (manufacturer && !getManufacturersForCategory(key).includes(manufacturer)) {
      setManufacturer("");
      setModel("");
    }
  }

  function handleValuation() {
    if (!manufacturer || !model || !year) {
      Alert.alert("Campos obrigatórios", "Preencha fabricante, modelo e ano.");
      return;
    }
    setResult(generateValuation(manufacturer, model, year, condition));
  }

  function handleReset() {
    setCategory(""); setManufacturer(""); setModel("");
    setYear(null); setCondition(7); setEngineProgram("enrolled"); setResult(null);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <Ionicons name="analytics" size={32} color={Colors.accent} />
        <Text style={styles.headerTitle}>Avaliação com IA</Text>
        <Text style={styles.headerSub}>Estimativa instantânea baseada em milhares de transações. Gratuita e sem compromisso.</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Detalhes da Aeronave</Text>

        {/* Category */}
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.key}
              style={[styles.selectChip, category === cat.key && styles.selectChipActive]}
              onPress={() => handleCategoryChange(cat.key)}
            >
              <Ionicons name={cat.icon as any} size={14} color={category === cat.key ? Colors.accent : Colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.selectChipText, category === cat.key && styles.selectChipTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Manufacturer */}
        <Text style={styles.label}>Fabricante</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowPicker("manufacturer")}>
          <Text style={[styles.dropdownText, !manufacturer && styles.dropdownPlaceholder]}>{manufacturer || "Selecione o fabricante"}</Text>
          <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
        {showPicker === "manufacturer" && (
          <View style={styles.pickerList}>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
              {availableManufacturers.map((mfg) => (
                <TouchableOpacity key={mfg} style={[styles.pickerItem, manufacturer === mfg && styles.pickerItemActive]}
                  onPress={() => { setManufacturer(mfg); setModel(""); setShowPicker(null); }}>
                  <Text style={[styles.pickerItemText, manufacturer === mfg && styles.pickerItemTextActive]}>{mfg}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Model */}
        <Text style={styles.label}>Modelo</Text>
        <TouchableOpacity style={[styles.dropdown, !manufacturer && styles.dropdownDisabled]} onPress={() => manufacturer && setShowPicker("model")}>
          <Text style={[styles.dropdownText, !model && styles.dropdownPlaceholder]}>{model || (manufacturer ? "Selecione o modelo" : "Selecione fabricante primeiro")}</Text>
          <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
        {showPicker === "model" && (
          <View style={styles.pickerList}>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
              {availableModels.map((m) => (
                <TouchableOpacity key={m} style={[styles.pickerItem, model === m && styles.pickerItemActive]}
                  onPress={() => { setModel(m); setShowPicker(null); }}>
                  <Text style={[styles.pickerItemText, model === m && styles.pickerItemTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Year */}
        <Text style={styles.label}>Ano</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowPicker("year")}>
          <Text style={[styles.dropdownText, !year && styles.dropdownPlaceholder]}>{year ? String(year) : "Selecione o ano"}</Text>
          <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
        {showPicker === "year" && (
          <View style={styles.pickerList}>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
              {YEARS.map((y) => (
                <TouchableOpacity key={y} style={[styles.pickerItem, year === y && styles.pickerItemActive]}
                  onPress={() => { setYear(y); setShowPicker(null); }}>
                  <Text style={[styles.pickerItemText, year === y && styles.pickerItemTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Condition */}
        <Text style={styles.label}>Condição: {condition}/10</Text>
        <View style={styles.chipRow}>
          {CONDITIONS.map((c) => (
            <TouchableOpacity key={c.value} style={[styles.condChip, condition === c.value && styles.condChipActive]} onPress={() => setCondition(c.value)}>
              <Text style={[styles.condText, condition === c.value && styles.condTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Engine */}
        <Text style={styles.label}>Programa de Motor</Text>
        <View style={styles.engineRow}>
          {[{ key: "enrolled", label: "Inscrito" }, { key: "not_enrolled", label: "Não inscrito" }, { key: "na", label: "N/A" }].map((opt) => (
            <TouchableOpacity key={opt.key} style={[styles.engineChip, engineProgram === opt.key && styles.engineChipActive]} onPress={() => setEngineProgram(opt.key)}>
              <Text style={[styles.engineText, engineProgram === opt.key && styles.engineTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.valuationBtn} onPress={handleValuation}>
          <Text style={styles.valuationBtnText}>Obter Avaliação</Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Estimativa de Mercado</Text>
            <View style={styles.confidenceBadge}><Text style={styles.confidenceText}>{result.confidence}% confiança</Text></View>
          </View>
          <Text style={styles.resultAircraft}>{year} {manufacturer} {model}</Text>
          <View style={styles.rangeBar}>
            <View style={styles.rangeSection}><Text style={styles.rangeLabel}>Mínimo</Text><Text style={styles.rangeLow}>{formatUSD(result.low)}</Text></View>
            <View style={[styles.rangeSection, styles.rangeMid]}><Text style={styles.rangeMidLabel}>Estimativa</Text><Text style={styles.rangeMidValue}>{formatUSD(result.mid)}</Text></View>
            <View style={styles.rangeSection}><Text style={styles.rangeLabel}>Máximo</Text><Text style={styles.rangeHigh}>{formatUSD(result.high)}</Text></View>
          </View>
          <Text style={styles.disclaimer}>* Estimativa baseada em dados de mercado e IA. Valores reais podem variar.</Text>
          <TouchableOpacity style={styles.resetBtnResult} onPress={handleReset}><Text style={styles.resetBtnResultText}>Nova Avaliação</Text></TouchableOpacity>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  headerCard: { backgroundColor: Colors.primary, borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: Colors.white, marginTop: 8, marginBottom: 6 },
  headerSub: { fontSize: 13, color: Colors.textMuted, textAlign: "center", lineHeight: 18 },
  formCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.border },
  formTitle: { fontSize: 17, fontWeight: "700", color: Colors.text, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 8, marginTop: 16 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  selectChipActive: { backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
  selectChipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: "500" },
  selectChipTextActive: { color: Colors.accent, fontWeight: "700" },
  dropdown: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Colors.background, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: Colors.border },
  dropdownDisabled: { opacity: 0.5 },
  dropdownText: { fontSize: 14, color: Colors.text },
  dropdownPlaceholder: { color: Colors.textMuted },
  pickerList: { backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, marginTop: 4, overflow: "hidden" },
  pickerItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  pickerItemActive: { backgroundColor: Colors.accentSoft },
  pickerItemText: { fontSize: 14, color: Colors.text },
  pickerItemTextActive: { color: Colors.accent, fontWeight: "600" },
  condChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  condChipActive: { backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
  condText: { fontSize: 11, color: Colors.textSecondary, fontWeight: "500" },
  condTextActive: { color: Colors.accent, fontWeight: "700" },
  engineRow: { flexDirection: "row", gap: 8 },
  engineChip: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  engineChipActive: { backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
  engineText: { fontSize: 12, color: Colors.textSecondary, fontWeight: "500" },
  engineTextActive: { color: Colors.accent, fontWeight: "700" },
  valuationBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  valuationBtnText: { color: Colors.white, fontSize: 16, fontWeight: "700" },
  resultCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.border, marginTop: 16 },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  resultTitle: { fontSize: 17, fontWeight: "700", color: Colors.text },
  confidenceBadge: { backgroundColor: "rgba(16,185,129,0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  confidenceText: { color: Colors.success, fontSize: 11, fontWeight: "600" },
  resultAircraft: { fontSize: 14, color: Colors.textMuted, marginBottom: 20 },
  rangeBar: { flexDirection: "row", marginBottom: 16 },
  rangeSection: { flex: 1, alignItems: "center" },
  rangeMid: { backgroundColor: Colors.accentSoft, borderRadius: 12, padding: 12, marginHorizontal: 4 },
  rangeLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 4 },
  rangeMidLabel: { fontSize: 11, color: Colors.accent, fontWeight: "600", marginBottom: 4 },
  rangeLow: { fontSize: 16, fontWeight: "700", color: Colors.textSecondary },
  rangeMidValue: { fontSize: 20, fontWeight: "800", color: Colors.accent },
  rangeHigh: { fontSize: 16, fontWeight: "700", color: Colors.textSecondary },
  disclaimer: { fontSize: 11, color: Colors.textMuted, lineHeight: 16, fontStyle: "italic", marginBottom: 12 },
  resetBtnResult: { borderWidth: 1, borderColor: Colors.accent, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  resetBtnResultText: { color: Colors.accent, fontSize: 14, fontWeight: "600" },
});
