import React, { useState } from "react";
import { colors } from "../theme";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";

const CURRENCIES = [
  { code: "CAD", name: "Canadian Dollar" },
  { code: "USD", name: "US Dollar" },
  { code: "GBP", name: "British Pound" },
  { code: "EUR", name: "Euro" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "TWD", name: "New Taiwan Dollar" },
];

export default function PreferencesSetupScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState("CAD");
  const [budget, setBudget] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showCurrencies, setShowCurrencies] = useState(false);

  const selectedCurrency = CURRENCIES.find((item) => item.code === currency);

  function handleBack() {
    setShowCurrencies(false);

    if (step > 1) {
      setStep(step - 1);
    }
  }

  function handleNext() {
    setShowCurrencies(false);

    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete?.({
        defaultCurrency: currency,
        monthlyBudget: Number(budget) || 0,
        notificationsEnabled,
      });
    }
  }

  function handleSkip() {
    if (step === 1) setCurrency("CAD");
    if (step === 2) setBudget("");
    if (step === 3) setNotificationsEnabled(false);

    handleNext();
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            {/* Header */}
            <View style={styles.header}>
              {step === 1 ? (
                <View style={styles.headerSide} />
              ) : (
                <TouchableOpacity
                  style={styles.headerSide}
                  onPress={handleBack}
                >
                  <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.stepText}>Step {step} of 3</Text>

              <TouchableOpacity
                style={[styles.headerSide, styles.skipArea]}
                onPress={handleSkip}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>

            {/* Introduction */}
            <View style={styles.introduction}>
              <Text style={styles.title}>Make it yours.</Text>
              <Text style={styles.description}>
                Set up your spending preferences to get started.
              </Text>
            </View>

            {/* Step 1: Default Currency */}
            {step === 1 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Default Currency</Text>

                <Text style={styles.cardDescription}>
                  Choose your preferred currency for tracking expenses.
                </Text>

                <TouchableOpacity
                  style={styles.currencySelector}
                  onPress={() => setShowCurrencies(!showCurrencies)}
                >
                  <Text style={styles.currencyText}>
                    {selectedCurrency.code} — {selectedCurrency.name}
                  </Text>
                  <Text style={styles.dropdownArrow}>⌄</Text>
                </TouchableOpacity>

                {showCurrencies && (
                  <View style={styles.dropdown}>
                    {CURRENCIES.map((item) => (
                      <TouchableOpacity
                        key={item.code}
                        style={styles.currencyOption}
                        onPress={() => {
                          setCurrency(item.code);
                          setShowCurrencies(false);
                        }}
                      >
                        <Text style={styles.currencyText}>
                          {item.code} — {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Step 2: Monthly Budget */}
            {step === 2 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Monthly Budget</Text>

                <Text style={styles.cardDescription}>
                  How much would you like to spend each month?
                </Text>

                <View style={styles.budgetRow}>
                  <Text style={styles.budgetCurrency}>{currency}</Text>

                  <TextInput
                    style={styles.budgetInput}
                    placeholder="500"
                    placeholderTextColor="#777777"
                    keyboardType="decimal-pad"
                    value={budget}
                    onChangeText={setBudget}
                  />
                </View>
              </View>
            )}

            {/* Step 3: Budget Notifications */}
            {step === 3 && (
              <View style={styles.card}>
                <View style={styles.notificationRow}>
                  <View style={styles.notificationText}>
                    <Text style={styles.cardTitle}>Budget Notifications</Text>

                    <Text style={styles.cardDescription}>
                      Get notified when you're below, near, or over your monthly
                      budget.
                    </Text>
                  </View>

                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{
                      false: "#ADADAD",
                      true: colors.secondary,
                    }}
                    thumbColor={colors.white}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Bottom */}
          <View style={styles.bottom}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleNext}
            >
              <Text style={styles.continueText}>Save & Continue</Text>
            </TouchableOpacity>

            {/* Logo will be added later */}
            <View style={styles.footer}>
              <Text style={styles.slogan}>Spend smart. Enjoy more.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 42,
    paddingBottom: 18,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 48,
  },
  headerSide: {
    width: 65,
  },
  backArrow: {
    fontSize: 30,
    color: colors.primary,
  },
  stepText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  skipArea: {
    alignItems: "flex-end",
  },
  skipText: {
    fontSize: 16,
    color: colors.secondary,
  },

  // Introduction
  introduction: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: colors.primary,
    lineHeight: 21,
  },

  // Cards
  card: {
    backgroundColor: colors.sage,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 25,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.primary,
    lineHeight: 19,
    marginBottom: 14,
  },

  // Currency
  currencySelector: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 18,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currencyText: {
    fontSize: 15,
    color: colors.primary,
  },
  dropdownArrow: {
    fontSize: 23,
    color: colors.primary,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginTop: 8,
    overflow: "hidden",
  },
  currencyOption: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.sage,
  },

  // Budget
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  budgetCurrency: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  budgetInput: {
    flex: 1,
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 18,
    fontSize: 17,
    color: colors.primary,
  },

  // Notifications
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationText: {
    flex: 1,
    paddingRight: 12,
  },

  // Footer
  bottom: {
    paddingTop: 40,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  continueText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  footer: {
    alignItems: "center",
    marginTop: 52,
  },
  slogan: {
    fontSize: 13,
    color: colors.primary,
  },
});
