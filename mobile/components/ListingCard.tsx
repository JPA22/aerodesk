import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";

export interface Listing {
  id: string;
  title: string;
  price: number | null;
  currency: string;
  location_city: string | null;
  location_state: string | null;
  year: number | null;
  total_time_hours: number | null;
  images: string[] | null;
  category: string | null;
  manufacturer: string | null;
  model: string | null;
}

function formatPrice(amount: number | null, currency: string): string {
  if (!amount) return "Preço sob consulta";
  const sym = currency === "BRL" ? "R$" : currency === "EUR" ? "€" : "$";
  return `${sym}${amount.toLocaleString("en-US")}`;
}

interface Props {
  listing: Listing;
  horizontal?: boolean;
}

export default function ListingCard({ listing, horizontal = false }: Props) {
  const router = useRouter();
  const imageUri = listing.images?.[0];
  const location = [listing.location_city, listing.location_state]
    .filter(Boolean)
    .join(", ");

  return (
    <TouchableOpacity
      style={[styles.card, horizontal && styles.cardHorizontal]}
      onPress={() => router.push(`/listing/${listing.id}`)}
      activeOpacity={0.85}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={horizontal ? styles.imageHorizontal : styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[horizontal ? styles.imageHorizontal : styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>✈</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>

        {listing.year && (
          <Text style={styles.year}>{listing.year}</Text>
        )}

        <Text style={styles.price}>
          {formatPrice(listing.price, listing.currency)}
        </Text>

        {location ? (
          <View style={styles.locationRow}>
            <Text style={styles.locationText}>📍 {location}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    marginBottom: 12,
  },
  cardHorizontal: {
    flexDirection: "row",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.border,
  },
  imageHorizontal: {
    width: 110,
    height: 90,
    backgroundColor: Colors.border,
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 32,
  },
  info: {
    padding: 12,
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  year: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.accent,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
