import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!email.trim() || !password) {
      Alert.alert("Missing information", "Enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      await setDoc(doc(db, "users", result.user.uid), {
        email: result.user.email,
        monthlyBudget: 0,
        defaultCurrency: "CAD",
        notificationsEnabled: false,
        setupCompleted: false,
      });

      Alert.alert("Success", "Account created!");
    } catch (error) {
      Alert.alert("Sign up failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={styles.button}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text>{loading ? "Creating..." : "Create Account"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    padding: 16,
    backgroundColor: "#EEEEEE",
    borderRadius: 8,
    alignItems: "center",
  },
});
