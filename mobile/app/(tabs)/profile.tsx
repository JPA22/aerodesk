import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Colors } from "@/constants/colors";

interface Stats {
  listings: number;
  leads: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ listings: 0, leads: 0 });

  // Auth form state
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchStats(data.session.user.id);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) fetchStats(s.user.id);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchStats(userId: string) {
    const [{ count: lCount }, { count: leadCount }] = await Promise.all([
      supabase.from("aircraft_listings").select("*", { count: "exact", head: true }).eq("seller_id", userId),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("seller_id", userId),
    ]);
    setStats({ listings: lCount ?? 0, leads: leadCount ?? 0 });
  }

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert("Atenção", "Preencha email e senha.");
      return;
    }
    setAuthLoading(true);
    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) Alert.alert("Erro", error.message);
      else Alert.alert("Verifique seu email", "Enviamos um link de confirmação.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert("Erro", error.message);
    }
    setAuthLoading(false);
  }

  async function handleLogout() {
    Alert.alert("Sair", "Deseja encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          setSession(null);
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  if (!session) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.authTitle}>{isRegister ? "Criar conta" : "Entrar"}</Text>
          <Text style={styles.authSub}>
            {isRegister ? "Cadastre-se para anunciar aeronaves" : "Acesse sua conta AeroDesk"}
          </Text>

          {isRegister && (
            <TextInput
              style={styles.authInput}
              placeholder="Seu nome"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}
          <TextInput
            style={styles.authInput}
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.authInput}
            placeholder="Senha"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.authBtn} onPress={handleAuth} disabled={authLoading}>
            {authLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.authBtnText}>{isRegister ? "Criar conta" : "Entrar"}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setIsRegister(!isRegister)}
          >
            <Text style={styles.toggleText}>
              {isRegister ? "Já tem conta? Entrar" : "Não tem conta? Criar"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  const userEmail = session.user.email ?? "";
  const userName = (session.user.user_metadata?.full_name as string) ?? userEmail.split("@")[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.userName}>{userName}</Text>
      <Text style={styles.userEmail}>{userEmail}</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.listings}</Text>
          <Text style={styles.statLabel}>Anúncios</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.leads}</Text>
          <Text style={styles.statLabel}>Contatos</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => router.push("/search")}
        >
          <Text style={styles.actionIcon}>✈️</Text>
          <Text style={styles.actionText}>Meus Anúncios</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionText}>Novo Anúncio</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Meus Contatos</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={styles.actionText}>Configurações</Text>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  authContainer: { flexGrow: 1, justifyContent: "center", padding: 24, backgroundColor: Colors.background },
  authTitle: { fontSize: 26, fontWeight: "800", color: Colors.text, marginBottom: 6 },
  authSub: { fontSize: 14, color: Colors.textMuted, marginBottom: 28 },
  authInput: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  authBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  authBtnText: { color: Colors.white, fontSize: 16, fontWeight: "700" },
  toggleBtn: { alignItems: "center" },
  toggleText: { color: Colors.accent, fontSize: 14, fontWeight: "500" },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, alignItems: "center" },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: "700" },
  userName: { fontSize: 20, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  userEmail: { fontSize: 13, color: Colors.textMuted, marginBottom: 24 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    width: "100%",
    marginBottom: 24,
  },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 12 },
  statNumber: { fontSize: 24, fontWeight: "800", color: Colors.accent },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  actions: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionIcon: { fontSize: 18, marginRight: 12 },
  actionText: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: "500" },
  actionArrow: { fontSize: 20, color: Colors.textMuted },
  logoutBtn: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: Colors.error, fontWeight: "600", fontSize: 15 },
});
