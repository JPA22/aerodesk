import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { useSaved } from "@/context/SavedContext";
import type { DemoListing } from "@/constants/demoData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function formatPrice(amount: number | null, currency: string): string {
  if (!amount) return "Price on request";
  if (amount >= 1000000) {
    const sym = currency === "BRL" ? "R$" : currency === "EUR" ? "€" : "$";
    const m = amount / 1000000;
    return `${sym}${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  const sym = currency === "BRL" ? "R$" : currency === "EUR" ? "€" : "$";
  return `${sym}${amount.toLocaleString("en-US")}`;
}

function formatPriceFull(amount: number | null, currency: string): string {
  if (!amount) return "Preço sob consulta";
  const sym = currency === "BRL" ? "R$" : currency === "EUR" ? "€" : "$";
  return `${sym}${amount.toLocaleString("en-US")}`;
}

export function FeaturedCard({ listing }: { listing: DemoListing }) {
  const router = useRouter();
  const imageUri = listing.images?.[0];
  const location = `${listing.location_city}, ${listing.location_country}`;

  return (
    <TouchableOpacity style={styles.featuredCard} onPress={() => router.push(`/listing/${listing.id}`)} activeOpacity={0.9}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.featuredImage} resizeMode="cover" />
      ) : (
        <View style={[styles.featuredImage, styles.imagePlaceholder]}><Ionicons name="airplane" size={48} color={Colors.textMuted} /></View>
      )}
      <View style={styles.featuredOverlay} />
      {listing.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={10} color={Colors.primary} style={{ marginRight: 3 }} />
          <Text style={styles.featuredBadgeText}>Featured</Text>
        </View>
      )}
      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle} numberOfLines={1}>{listing.title}</Text>
        <View style={styles.specsRow}>
          <View style={styles.specItem}><Text style={styles.specValue}>{listing.range_nm.toLocaleString()}</Text><Text style={styles.specLabel}>nm</Text></View>
          <View style={styles.specDot} />
          <View style={styles.specItem}><Text style={styles.specValue}>{listing.max_speed_kts}</Text><Text style={styles.specLabel}>kts</Text></View>
          <View style={styles.specDot} />
          <View style={styles.specItem}><Text style={styles.specValue}>{listing.seats}</Text><Text style={styles.specLabel}>seats</Text></View>
        </View>
        <View style={styles.featuredBottom}>
          <Text style={styles.featuredPrice}>{formatPriceFull(listing.price, listing.currency)}</Text>
          <Text style={styles.featuredLocation}>{location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ListingCard({ listing, variant = "grid" }: { listing: DemoListing; variant?: "grid" | "horizontal" }) {
  const router = useRouter();
  const { isSaved, toggleSaved } = useSaved();
  const imageUri = listing.images?.[0];
  const location = [listing.location_city, listing.location_state].filter(Boolean).join(", ");
  const saved = isSaved(listing.id);

  if (variant === "horizontal") {
    return (
      <TouchableOpacity style={styles.hCard} onPress={() => router.push(`/listing/${listing.id}`)} activeOpacity={0.9}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.hImage} resizeMode="cover" />
        ) : (
          <View style={[styles.hImage, styles.imagePlaceholder]}><Ionicons name="airplane" size={28} color={Colors.textMuted} /></View>
        )}
        <View style={styles.hInfo}>
          <View style={styles.hTitleRow}>
            <Text style={styles.hTitle} numberOfLines={2}>{listing.title}</Text>
            <TouchableOpacity onPress={() => toggleSaved(listing.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={saved ? "heart" : "heart-outline"} size={20} color={saved ? Colors.error : Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.hSpecsRow}>
            <Text style={styles.hSpec}>{listing.year}</Text>
            <Text style={styles.hSpecSep}>·</Text>
            <Text style={styles.hSpec}>{listing.total_time_hours.toLocaleString()}h</Text>
            <Text style={styles.hSpecSep}>·</Text>
            <Text style={styles.hSpec}>{listing.seats} seats</Text>
          </View>
          <Text style={styles.hPrice}>{formatPriceFull(listing.price, listing.currency)}</Text>
          {location ? (
            <View style={styles.hLocationRow}>
              <Ionicons name="location-sharp" size={11} color={Colors.textMuted} />
              <Text style={styles.hLocation}>{location}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.gridCard} onPress={() => router.push(`/listing/${listing.id}`)} activeOpacity={0.9}>
      <View>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.gridImage} resizeMode="cover" />
        ) : (
          <View style={[styles.gridImage, styles.imagePlaceholder]}><Ionicons name="airplane" size={32} color={Colors.textMuted} /></View>
        )}
        <TouchableOpacity style={styles.gridSaveBtn} onPress={() => toggleSaved(listing.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={saved ? "heart" : "heart-outline"} size={18} color={saved ? Colors.error : Colors.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.gridInfo}>
        <Text style={styles.gridTitle} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.gridYear}>{listing.year}</Text>
        <Text style={styles.gridPrice}>{formatPrice(listing.price, listing.currency)}</Text>
        {location ? (
          <View style={styles.gridLocationRow}><Ionicons name="location-sharp" size={10} color={Colors.textMuted} /><Text style={styles.gridLocation}>{location}</Text></View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  featuredCard: { width: SCREEN_WIDTH * 0.78, height: 260, borderRadius: 16, overflow: "hidden", marginRight: 14, backgroundColor: Colors.primary },
  featuredImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  featuredOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10, 22, 40, 0.55)" },
  featuredBadge: { position: "absolute", top: 12, left: 12, backgroundColor: Colors.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, zIndex: 2, flexDirection: "row", alignItems: "center" },
  featuredBadgeText: { color: Colors.primary, fontSize: 11, fontWeight: "700" },
  featuredContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, zIndex: 2 },
  featuredTitle: { color: Colors.white, fontSize: 17, fontWeight: "700", marginBottom: 8 },
  specsRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  specItem: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  specValue: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  specLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  specDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.4)", marginHorizontal: 10 },
  featuredBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  featuredPrice: { color: Colors.accentLight, fontSize: 16, fontWeight: "800" },
  featuredLocation: { color: "rgba(255,255,255,0.65)", fontSize: 11 },
  hCard: { flexDirection: "row", backgroundColor: Colors.white, borderRadius: 14, overflow: "hidden", marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  hImage: { width: 120, height: 110, backgroundColor: Colors.border },
  hInfo: { flex: 1, padding: 12, justifyContent: "center" },
  hTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  hTitle: { fontSize: 14, fontWeight: "700", color: Colors.text, marginBottom: 4, flex: 1 },
  hSpecsRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  hSpec: { fontSize: 12, color: Colors.textMuted },
  hSpecSep: { fontSize: 12, color: Colors.textMuted, marginHorizontal: 4 },
  hPrice: { fontSize: 15, fontWeight: "800", color: Colors.accent, marginBottom: 2 },
  hLocationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  hLocation: { fontSize: 11, color: Colors.textMuted },
  gridCard: { backgroundColor: Colors.white, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: Colors.border, flex: 1, marginBottom: 12 },
  gridImage: { width: "100%", height: 130, backgroundColor: Colors.border },
  gridSaveBtn: { position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center" },
  gridInfo: { padding: 10 },
  gridTitle: { fontSize: 13, fontWeight: "700", color: Colors.text, marginBottom: 2 },
  gridYear: { fontSize: 11, color: Colors.textMuted, marginBottom: 4 },
  gridPrice: { fontSize: 14, fontWeight: "800", color: Colors.accent, marginBottom: 2 },
  gridLocationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  gridLocation: { fontSize: 10, color: Colors.textMuted },
  imagePlaceholder: { justifyContent: "center", alignItems: "center", backgroundColor: Colors.borderLight },
});
