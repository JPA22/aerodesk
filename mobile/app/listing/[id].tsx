import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Linking, Alert,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { getDemoListing, CATEGORY_LABELS, type DemoListing } from "@/constants/demoData";
import { useSaved } from "@/context/SavedContext";

const { width } = Dimensions.get("window");

function formatPrice(amount: number | null, currency: string): string {
  if (!amount) return "Preço sob consulta";
  const sym = currency === "BRL" ? "R$" : currency === "EUR" ? "€" : "$";
  return `${sym}${amount.toLocaleString("en-US")}`;
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { isSaved, toggleSaved } = useSaved();
  const [listing, setListing] = useState<DemoListing | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => { if (id) setListing(getDemoListing(id) ?? null); }, [id]);
  useEffect(() => { if (listing) navigation.setOptions({ title: listing.title }); }, [listing]);

  const saved = id ? isSaved(id) : false;

  function handleWhatsApp() {
    if (!listing?.seller_whatsapp) { Alert.alert("Contato", "WhatsApp não disponível."); return; }
    const phone = listing.seller_whatsapp.replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá! Vi o anúncio da aeronave "${listing.title}" no AeroDesk e gostaria de mais informações.`);
    Linking.openURL(`https://wa.me/${phone}?text=${msg}`);
  }

  if (!listing) return <View style={styles.centered}><Text style={styles.notFound}>Anúncio não encontrado.</Text></View>;

  const images = listing.images ?? [];
  const location = [listing.location_city, listing.location_state, listing.location_country].filter(Boolean).join(", ");
  const catLabel = CATEGORY_LABELS[listing.category] || listing.category;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {images.length > 0 ? (
          <View>
            <Image source={{ uri: images[imageIndex] }} style={styles.mainImage} resizeMode="cover" />
            {images.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
                {images.map((uri, i) => (
                  <TouchableOpacity key={i} onPress={() => setImageIndex(i)}>
                    <Image source={{ uri }} style={[styles.thumb, i === imageIndex && styles.thumbActive]} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.imgPlaceholder}><Ionicons name="airplane" size={64} color={Colors.textMuted} /></View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{listing.title}</Text>
            <TouchableOpacity onPress={() => toggleSaved(listing.id)} style={styles.saveBtn}>
              <Ionicons name={saved ? "heart" : "heart-outline"} size={24} color={saved ? Colors.error : Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.price}>{formatPrice(listing.price, listing.currency)}</Text>
          {location ? <View style={styles.locRow}><Ionicons name="location-sharp" size={14} color={Colors.textMuted} /><Text style={styles.locText}>{location}</Text></View> : null}

          <View style={styles.quickSpecs}>
            <View style={styles.qsItem}><Text style={styles.qsVal}>{listing.range_nm.toLocaleString()}</Text><Text style={styles.qsLbl}>nm range</Text></View>
            <View style={styles.qsDivider} />
            <View style={styles.qsItem}><Text style={styles.qsVal}>{listing.max_speed_kts}</Text><Text style={styles.qsLbl}>kts</Text></View>
            <View style={styles.qsDivider} />
            <View style={styles.qsItem}><Text style={styles.qsVal}>{listing.seats}</Text><Text style={styles.qsLbl}>seats</Text></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Especificações</Text>
            {listing.year && <SpecRow label="Ano" value={String(listing.year)} />}
            {listing.manufacturer && <SpecRow label="Fabricante" value={listing.manufacturer} />}
            {listing.model && <SpecRow label="Modelo" value={listing.model} />}
            <SpecRow label="Horas Totais" value={`${listing.total_time_hours.toLocaleString()} h`} />
            {listing.engine_time_smoh != null && <SpecRow label="Motor (SMOH)" value={`${listing.engine_time_smoh.toLocaleString()} h`} />}
            <SpecRow label="Categoria" value={catLabel} />
          </View>

          {listing.description && (
            <View style={styles.card}><Text style={styles.cardTitle}>Descrição</Text><Text style={styles.desc}>{listing.description}</Text></View>
          )}

          {listing.seller_name && (
            <View style={[styles.card, { marginBottom: 100 }]}>
              <Text style={styles.cardTitle}>Vendedor</Text>
              <View style={styles.sellerRow}>
                <View style={styles.sellerAvatar}><Text style={styles.sellerInit}>{listing.seller_name.charAt(0)}</Text></View>
                <View>
                  <Text style={styles.sellerName}>{listing.seller_name}</Text>
                  <View style={styles.verRow}><Ionicons name="checkmark-circle" size={14} color={Colors.success} /><Text style={styles.verText}>Verificado</Text></View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.waBtn} onPress={handleWhatsApp}>
          <Ionicons name="chatbubble-ellipses" size={18} color={Colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.waBtnText}>Contatar via WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  notFound: { fontSize: 16, color: Colors.textMuted },
  mainImage: { width, height: 280 },
  imgPlaceholder: { width, height: 240, backgroundColor: Colors.border, justifyContent: "center", alignItems: "center" },
  thumbRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  thumb: { width: 68, height: 50, borderRadius: 8, borderWidth: 2, borderColor: "transparent" },
  thumbActive: { borderColor: Colors.accent },
  body: { padding: 16 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: "800", color: Colors.text, flex: 1 },
  saveBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  price: { fontSize: 24, fontWeight: "800", color: Colors.accent, marginBottom: 4 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16 },
  locText: { fontSize: 13, color: Colors.textMuted },
  quickSpecs: { flexDirection: "row", backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, marginBottom: 16 },
  qsItem: { flex: 1, alignItems: "center" },
  qsVal: { color: Colors.white, fontSize: 18, fontWeight: "800" },
  qsLbl: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  qsDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  card: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 12 },
  specRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  specLabel: { fontSize: 13, color: Colors.textMuted },
  specValue: { fontSize: 13, fontWeight: "600", color: Colors.text },
  desc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accentSoft, justifyContent: "center", alignItems: "center" },
  sellerInit: { color: Colors.accent, fontSize: 18, fontWeight: "700" },
  sellerName: { fontSize: 15, fontWeight: "600", color: Colors.text },
  verRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  verText: { fontSize: 12, color: Colors.success, fontWeight: "500" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border, padding: 16, paddingBottom: 32 },
  waBtn: { backgroundColor: "#25D366", borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center" },
  waBtnText: { color: Colors.white, fontSize: 16, fontWeight: "700" },
});
