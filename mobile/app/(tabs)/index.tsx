import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FeaturedCard } from "@/components/ListingCard";
import { Colors } from "@/constants/colors";
import { getDemoListings, CATEGORIES } from "@/constants/demoData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const featured = getDemoListings({ featured: true });

  function handleSearch() {
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search)}`);
    else router.push("/search");
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.logo}>
              <Text style={styles.logoWhite}>Aero</Text>
              <Text style={styles.logoBlue}>Desk</Text>
            </Text>
            <Text style={styles.tagline}>O marketplace moderno de aeronaves</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Brasil</Text>
          </View>
        </View>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.45)" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por fabricante, modelo..."
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Buscar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Stats */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}><Text style={styles.statNumber}>2,500+</Text><Text style={styles.statLabel}>aeronaves</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statNumber}>500+</Text><Text style={styles.statLabel}>dealers</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statNumber}>12</Text><Text style={styles.statLabel}>países</Text></View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>EXPLORE A FROTA</Text>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.key} style={styles.categoryCard} onPress={() => router.push(`/search?category=${cat.key}`)} activeOpacity={0.85}>
                <View style={[styles.categoryGradient, { backgroundColor: cat.gradient[0] }]}>
                  <Ionicons name={cat.icon as any} size={28} color={Colors.white} style={{ marginBottom: 4 }} />
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                  <Text style={styles.categorySubtitle}>{cat.subtitle}</Text>
                  <View style={styles.categoryCountRow}>
                    <Text style={styles.categoryCount}>{cat.count} anúncios</Text>
                    <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.7)" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>SELECIONADOS PARA VOCÊ</Text>
              <Text style={styles.sectionTitle}>Destaques</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/search")}>
              <Text style={styles.viewAll}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
            {featured.map((listing) => (<FeaturedCard key={listing.id} listing={listing} />))}
          </ScrollView>
        </View>

        {/* Why AeroDesk */}
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>FEITO PARA AVIAÇÃO</Text>
          <Text style={styles.sectionTitle}>Por que AeroDesk</Text>
          <FeatureRow icon="analytics" title="Avaliação com IA" desc="Estimativas instantâneas baseadas em machine learning e milhares de transações." />
          <FeatureRow icon="shield-checkmark" title="Dealers Verificados" desc="Todos os dealers são verificados manualmente. Sem fraudes, sem surpresas." />
          <FeatureRow icon="link" title="Transações Integradas" desc="Do primeiro contato ao fechamento — PPI, documentação e escrow integrados." />
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Quer anunciar sua aeronave?</Text>
          <Text style={styles.ctaSub}>Junte-se a 500+ dealers no AeroDesk e alcance compradores qualificados em toda a América Latina.</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/profile")}>
            <Text style={styles.ctaBtnText}>Comece Grátis</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

function FeatureRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconWrap}>
        <Ionicons name={icon as any} size={22} color={Colors.accent} />
      </View>
      <View style={styles.featureTextWrap}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  hero: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  logo: { fontSize: 30, fontWeight: "800" },
  logoWhite: { color: Colors.white },
  logoBlue: { color: Colors.accent },
  tagline: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  liveBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginTop: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success, marginRight: 6 },
  liveText: { color: Colors.success, fontSize: 11, fontWeight: "600" },
  searchRow: { flexDirection: "row", gap: 8 },
  searchInputWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", paddingHorizontal: 12 },
  searchInput: { flex: 1, color: Colors.white, fontSize: 14, paddingVertical: 12 },
  searchBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingHorizontal: 18, justifyContent: "center" },
  searchBtnText: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  scroll: { flex: 1, backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  scrollContent: { paddingBottom: 40 },
  statsBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: Colors.white, marginHorizontal: 16, marginTop: -1, paddingVertical: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, borderWidth: 1, borderTopWidth: 0, borderColor: Colors.border },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "800", color: Colors.accent },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.border },
  section: { marginTop: 28, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 },
  sectionEyebrow: { fontSize: 11, fontWeight: "600", color: Colors.accent, letterSpacing: 1, marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: Colors.text, marginBottom: 14 },
  viewAll: { fontSize: 13, fontWeight: "600", color: Colors.accent, marginBottom: 16 },
  categoriesRow: { paddingRight: 16, gap: 10 },
  categoryCard: { width: SCREEN_WIDTH * 0.38, borderRadius: 14, overflow: "hidden" },
  categoryGradient: { padding: 14, height: 140, justifyContent: "space-between", borderRadius: 14 },
  categoryLabel: { color: Colors.white, fontSize: 15, fontWeight: "700" },
  categorySubtitle: { color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: 2 },
  categoryCountRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  categoryCount: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "500" },
  featuredRow: { paddingRight: 16 },
  featureCard: { flexDirection: "row", backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, alignItems: "flex-start" },
  featureIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accentSoft, justifyContent: "center", alignItems: "center", marginRight: 14 },
  featureTextWrap: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  featureDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  ctaSection: { marginTop: 28, marginHorizontal: 16, backgroundColor: Colors.primary, borderRadius: 18, padding: 24, alignItems: "center" },
  ctaTitle: { fontSize: 18, fontWeight: "800", color: Colors.white, textAlign: "center", marginBottom: 8 },
  ctaSub: { fontSize: 13, color: Colors.textMuted, textAlign: "center", lineHeight: 19, marginBottom: 18 },
  ctaBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  ctaBtnText: { color: Colors.white, fontSize: 15, fontWeight: "700" },
});
