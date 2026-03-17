import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");

interface ListingDetail {
  id: string;
  title: string;
  price: number | null;
  currency: string;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  year: number | null;
  total_time_hours: number | null;
  engine_time_smoh: number | null;
  category: string | null;
  manufacturer: string | null;
  model: string | null;
  description: string | null;
  images: string[] | null;
  seller_whatsapp: string | null;
  seller_name: string | null;
  status: string;
}

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
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (id) fetchListing(id);
  }, [id]);

  useEffect(() => {
    if (listing) {
      navigation.setOptions({ title: listing.title });
    }
  }, [listing]);

  async function fetchListing(listingId: string) {
    const { data } = await supabase
      .from("aircraft_listings")
      .select("*")
      .eq("id", listingId)
      .single();
    setListing(data as ListingDetail | null);
    setLoading(false);
  }

  function handleWhatsApp() {
    if (!listing?.seller_whatsapp) {
      Alert.alert("Contato", "Número de WhatsApp não disponível.");
      return;
    }
    const phone = listing.seller_whatsapp.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá! Vi o anúncio da aeronave "${listing.title}" no AeroDesk e gostaria de mais informações.`
    );
    Linking.openURL(`https://wa.me/${phone}?text=${message}`);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Anúncio não encontrado.</Text>
      </View>
    );
  }

  const images = listing.images ?? [];
  const location = [listing.location_city, listing.location_state, listing.location_country]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image gallery */}
        {images.length > 0 ? (
          <View>
            <Image
              source={{ uri: images[imageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            {images.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbRow}
              >
                {images.map((uri, i) => (
                  <TouchableOpacity key={i} onPress={() => setImageIndex(i)}>
                    <Image
                      source={{ uri }}
                      style={[styles.thumb, i === imageIndex && styles.thumbActive]}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 64 }}>✈</Text>
          </View>
        )}

        <View style={styles.body}>
          {/* Title & price */}
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>{formatPrice(listing.price, listing.currency)}</Text>
          {location ? <Text style={styles.location}>📍 {location}</Text> : null}

          {/* Specs */}
          <View style={styles.specsCard}>
            <Text style={styles.specsTitle}>Especificações</Text>
            {listing.year && <SpecRow label="Ano" value={String(listing.year)} />}
            {listing.manufacturer && <SpecRow label="Fabricante" value={listing.manufacturer} />}
            {listing.model && <SpecRow label="Modelo" value={listing.model} />}
            {listing.total_time_hours != null && (
              <SpecRow label="Horas Totais" value={`${listing.total_time_hours.toLocaleString("en-US")} h`} />
            )}
            {listing.engine_time_smoh != null && (
              <SpecRow label="Motor (SMOH)" value={`${listing.engine_time_smoh.toLocaleString("en-US")} h`} />
            )}
            {listing.category && <SpecRow label="Categoria" value={listing.category} />}
          </View>

          {/* Description */}
          {listing.description && (
            <View style={styles.descCard}>
              <Text style={styles.specsTitle}>Descrição</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          )}

          {/* Seller */}
          {listing.seller_name && (
            <View style={styles.sellerCard}>
              <Text style={styles.specsTitle}>Vendedor</Text>
              <Text style={styles.sellerName}>{listing.seller_name}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp}>
          <Text style={styles.whatsappBtnText}>💬 Contatar via WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  mainImage: { width, height: 260 },
  imagePlaceholder: {
    width,
    height: 220,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  thumb: { width: 64, height: 48, borderRadius: 6, borderWidth: 2, borderColor: "transparent" },
  thumbActive: { borderColor: Colors.accent },
  body: { padding: 16 },
  title: { fontSize: 20, fontWeight: "700", color: Colors.text, marginBottom: 6 },
  price: { fontSize: 22, fontWeight: "800", color: Colors.accent, marginBottom: 4 },
  location: { fontSize: 13, color: Colors.textMuted, marginBottom: 16 },
  specsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  specsTitle: { fontSize: 15, fontWeight: "700", color: Colors.text, marginBottom: 12 },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  specLabel: { fontSize: 13, color: Colors.textMuted },
  specValue: { fontSize: 13, fontWeight: "600", color: Colors.text },
  descCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  description: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  sellerCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 80,
  },
  sellerName: { fontSize: 15, fontWeight: "600", color: Colors.text },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
    paddingBottom: 28,
  },
  whatsappBtn: {
    backgroundColor: "#25D366",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  whatsappBtnText: { color: Colors.white, fontSize: 16, fontWeight: "700" },
  notFoundText: { fontSize: 16, color: Colors.textMuted },
});
