import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Colors } from "@/constants/colors";

export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => { setSession(s); });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleAuth() {
    if (!email || !password) { Alert.alert("Atenção", "Preencha email e senha."); return; }
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

  async function handleForgotPassword() {
    if (!email) {
      Alert.alert("Email necessário", "Digite seu email acima e toque novamente em 'Esqueceu sua senha?'");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      Alert.alert("Email enviado", `Enviamos um link de redefinição de senha para ${email}. Verifique sua caixa de entrada.`);
    }
  }

  async function handleLogout() {
    Alert.alert("Sair", "Deseja encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => { await supabase.auth.signOut(); setSession(null); } },
    ]);
  }

  function comingSoon(feature: string) {
    Alert.alert("Em breve", `${feature} estará disponível em breve!`);
  }

  if (loading) return <View style={styles.centered}><ActivityIndicator color={Colors.accent} /></View>;

  if (!session) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.authContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.authHeader}>
            <Text style={styles.authLogo}>
              <Text style={{ color: Colors.text }}>Aero</Text>
              <Text style={{ color: Colors.accent }}>Desk</Text>
            </Text>
          </View>
          <Text style={styles.authTitle}>{isRegister ? "Criar conta" : "Bem-vindo de volta"}</Text>
          <Text style={styles.authSub}>
            {isRegister ? "Cadastre-se para anunciar e salvar aeronaves" : "Entre para acessar sua conta AeroDesk"}
          </Text>

          {isRegister && (
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.authInput} placeholder="Seu nome" placeholderTextColor={Colors.textMuted}
                value={name} onChangeText={setName} autoCapitalize="words" />
            </View>
          )}
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.authInput} placeholder="Email" placeholderTextColor={Colors.textMuted}
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.authInput} placeholder="Senha" placeholderTextColor={Colors.textMuted}
              value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          {/* Forgot password - only show on login */}
          {!isRegister && (
            <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.authBtn} onPress={handleAuth} disabled={authLoading}>
            {authLoading ? <ActivityIndicator color={Colors.white} /> :
              <Text style={styles.authBtnText}>{isRegister ? "Criar conta" : "Entrar"}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsRegister(!isRegister)}>
            <Text style={styles.toggleText}>
              {isRegister ? "Já tem conta? " : "Não tem conta? "}
              <Text style={styles.toggleLink}>{isRegister ? "Entrar" : "Criar"}</Text>
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
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text></View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
      </View>
      <View style={styles.menuCard}>
        <MenuItem icon="airplane-outline" label="Meus Anúncios" onPress={() => router.push("/search")} />
        <MenuItem icon="add-circle-outline" label="Novo Anúncio" onPress={() => comingSoon("Novo Anúncio")} />
        <MenuItem icon="chatbubble-outline" label="Meus Contatos" onPress={() => comingSoon("Meus Contatos")} />
        <MenuItem icon="analytics-outline" label="Avaliações" onPress={() => router.push("/(tabs)/valuation")} />
        <MenuItem icon="settings-outline" label="Configurações" onPress={() => comingSoon("Configurações")} last />
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color={Colors.error} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress, last }: { icon: any; label: string; onPress?: () => void; last?: boolean }) {
  return (
    <TouchableOpacity style={[styles.menuItem, !last && styles.menuItemBorder]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={Colors.accent} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  authContainer: { flexGrow: 1, justifyContent: "center", padding: 28, backgroundColor: Colors.background },
  authHeader: { alignItems: "center", marginBottom: 32 },
  authLogo: { fontSize: 28, fontWeight: "800" },
  authTitle: { fontSize: 24, fontWeight: "800", color: Colors.text, marginBottom: 6 },
  authSub: { fontSize: 14, color: Colors.textMuted, marginBottom: 28, lineHeight: 20 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 12, paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  authInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.text },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 8, marginTop: -4 },
  forgotText: { fontSize: 13, color: Colors.accent, fontWeight: "500" },
  authBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8, marginBottom: 16 },
  authBtnText: { color: Colors.white, fontSize: 16, fontWeight: "700" },
  toggleBtn: { alignItems: "center" },
  toggleText: { fontSize: 14, color: Colors.textMuted },
  toggleLink: { color: Colors.accent, fontWeight: "600" },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  avatarWrap: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.accent, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: "700" },
  userName: { fontSize: 20, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  userEmail: { fontSize: 13, color: Colors.textMuted },
  menuCard: { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: "hidden", marginBottom: 20 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16, gap: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: "500" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: Colors.error, borderRadius: 14, paddingVertical: 14 },
  logoutText: { color: Colors.error, fontWeight: "600", fontSize: 15 },
});
