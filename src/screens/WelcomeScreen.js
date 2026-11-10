import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

import { colors } from "../theme";

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Main heading */}
        <View style={styles.introduction}>
          <Text style={styles.title}>
            Track{"\n"}Your Leisure{"\n"}Spending
          </Text>

          <Text style={styles.subtitle}>Travel, Shop, Explore, Enjoy</Text>
        </View>

        {/* Bottom section */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          {/* Footer slogan */}
          <View style={styles.footer}>
            <Text style={styles.slogan}>Spend smart. Enjoy more.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 125,
    paddingBottom: 18,
  },

  introduction: {
    alignItems: "flex-start",
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.primary,
    lineHeight: 40,
  },

  subtitle: {
    fontSize: 18,
    color: colors.primary,
    marginTop: 26,
  },

  bottom: {
    width: "100%",
  },

  button: {
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  signUpButton: {
    backgroundColor: colors.primary,
  },

  loginButton: {
    backgroundColor: colors.sage,
  },

  signUpButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.white,
  },

  loginButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.primary,
  },

  footer: {
    alignItems: "center",
    marginTop: 65,
  },

  slogan: {
    fontSize: 16,
    color: colors.primary,
  },
});
