// import React from "react";
import React, { useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Keyboard,
  Image,
  KeyboardAvoidingView,
  Text,
  View,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme";
// import { signInWithEmailAndPassword } from "firebase/auth";

// import { auth } from "../firebaseConfig";
import { auth, db } from "../firebaseConfig";
// I am unsure which one to import? assuming it is the one with db

const ui = {
  text: colors.primary,
  muted: "#73796B",
  expenseBackground: "#EAF0DE",
  ringBackground: "#CEDDB5",
};

const currencies = ["CAD", "USD", "GBP", "EUR", "HKD", "TWD"];

function HomeContent({ navigation, expenses = [] }) {
  // Temporary data for UI development
  const [monthlyBudget, setMonthlyBudget] = useState(500);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("CAD");
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  // Route names are placeholders: match these to your navigator.
  function openScreen(route) {
    if (navigation?.navigate) {
      navigation.navigate(route);
      return;
    }

    Alert.alert(
      "Navigation placeholder",
      `Connect this button to your ${route} screen.`,
    );
  }

  function changeBudget() {
    Alert.alert("Input budget", "budget placeholder");
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Profile</Text>

          {/* change budget button */}
          {/* Amount and currency */}

          <Text style={styles.sectionHeader}>Budget Settings</Text>

          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="Monthly Budget"
              placeholderTextColor={colors.primary}
              value={monthlyBudget}
              onChangeText={setMonthlyBudget}
              keyboardType="decimal-pad"
              returnKeyType="done"
              accessibilityLabel="Monthly amount"
              maxLength={12}
            />
            {/* Currency selection */}
            <Modal
              visible={showCurrencyPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowCurrencyPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <Pressable
                  style={StyleSheet.absoluteFillObject}
                  onPress={() => setShowCurrencyPicker(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close currency picker"
                />

                <View style={styles.modalCard} accessibilityViewIsModal>
                  <Text style={styles.modalTitle}>Currency</Text>

                  {currencies.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setCurrency(option);
                        setShowCurrencyPicker(false);
                      }}
                      style={styles.currencyOption}
                      accessibilityRole="button"
                      accessibilityState={{ selected: currency === option }}
                    >
                      <Text style={styles.inputText}>{option}</Text>

                      {currency === option && (
                        <Ionicons
                          name="checkmark"
                          size={23}
                          color={colors.secondary}
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            </Modal>

            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                setShowCurrencyPicker(true);
              }}
              style={styles.currencyButton}
              accessibilityRole="button"
              accessibilityLabel={`Select currency, currently ${currency}`}
            >
              <Text style={styles.inputText}>{currency}</Text>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.primary}
              />
            </Pressable>
          </View>
          {/* section header */}
          <View style={styles.budgetCard}>
            <Text style={styles.sectionTitle}>Monthly Budget</Text>

            <Pressable
              onPress={() => openScreen("Expenses")}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={styles.seeAll}>${monthlyBudget}</Text>
            </Pressable>
          </View>

          <View style={styles.budgetCard}>
            <Text style={styles.sectionTitle}>
              Notifications
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.primary}
              />
            </Text>

            <Pressable
              onPress={() => openScreen("Expenses")}
              accessibilityRole="button"
              hitSlop={8}
            >
              {/* <Text style={styles.seeAll}>${monthlyBudget}</Text> */}
            </Pressable>
          </View>
        </View>

        <View style={styles.budgetCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <Pressable
            onPress={() => openScreen("Expenses")}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        <View style={styles.budgetCard}>
          <Text style={styles.sectionTitle}>Log Out</Text>

          <Pressable
            onPress={() => firebase_auth.signOut()}
            title="Sign Out"
            accessibilityRole="button"
            hitSlop={8}
          ></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ProfileScreen(props) {
  return (
    <SafeAreaProvider>
      <HomeContent {...props} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 38,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 28,
  },
  greeting: {
    color: ui.text,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  budgetButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 10,
    minHeight: 32,
  },
  budget: {
    color: ui.text,
    fontSize: 19,
    marginRight: 10,
  },
  budgetCard: {
    backgroundColor: colors.sage,
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
  },
  budgetTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 27,
  },
  budgetDetails: {
    flex: 1,
    paddingTop: 6,
    paddingRight: 8,
  },
  cardLabel: {
    color: ui.text,
    fontSize: 17,
    fontWeight: "700",
  },
  budgetAmount: {
    color: ui.text,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 12,
    letterSpacing: -0.8,
  },
  budgetCurrency: {
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: 0,
  },
  // ring: {
  //   width: 132,
  //   height: 132,
  //   position: "relative",
  //   flexShrink: 0,
  // },
  // ringLabel: {
  //   position: "absolute",
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  // percentage: {
  //   color: ui.text,
  //   fontSize: 29,
  //   fontWeight: "800",
  // },
  progressBackground: {
    height: 12,
    backgroundColor: colors.white,
    borderRadius: 6,
    overflow: "hidden",
  },
  // progressFill: {
  //   height: "100%",
  //   backgroundColor: colors.secondary,
  //   borderRadius: 6,
  // },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 12,
  },
  budgetCaption: {
    color: ui.text,
    fontSize: 16,
    fontWeight: "600",
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    paddingHorizontal: 2,
  },
  warningText: {
    flex: 1,
    color: ui.text,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
    marginLeft: 17,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
    color: ui.text,
    fontSize: 21,
    fontWeight: "800",
    marginRight: 12,
    letterSpacing: -0.5,
  },
  seeAll: {
    color: ui.text,
    fontSize: 17,
    fontWeight: "600",
  },
  expenseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ui.expenseBackground,
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 15,
    marginBottom: 12,
  },
  expenseIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  expenseDetails: {
    flex: 1,
    marginRight: 8,
  },
  expenseName: {
    color: ui.text,
    fontSize: 16,
    fontWeight: "700",
  },
  expenseDate: {
    color: ui.muted,
    fontSize: 13,
    marginTop: 4,
  },
  expenseAmounts: {
    alignItems: "flex-end",
    flexShrink: 1,
  },
  expenseAmount: {
    color: ui.text,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
  },
  convertedAmount: {
    color: ui.muted,
    fontSize: 13,
    marginTop: 4,
    textAlign: "right",
  },

  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 38,
    paddingBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: -0.8,
    marginBottom: 24,
  },
  receiptRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 24,
  },
  uploadCard: {
    flex: 1.2,
    minHeight: 142,
    backgroundColor: colors.sage,
    borderRadius: 18,
    padding: 18,
    justifyContent: "center",
  },
  uploadText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 12,
  },
  receiptPreview: {
    flex: 1,
    minHeight: 142,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.primary,
    position: "relative",
  },
  receiptImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  removePhoto: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyReceipt: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  previewText: {
    color: ui.muted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  twoColumns: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  label: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 9,
  },
  input: {
    flexWrap: "wrap",
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.sage,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "500",
    width: "100%",
  },
  inputText: {
    flexWrap: "wrap",
    color: colors.primary,
    fontSize: 17,
    fontWeight: "500",
    margin: 20,
    // width: "100%",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  categoryCard: {
    width: "30%",
    flexGrow: 1,
    minHeight: 92,
    borderRadius: 17,
    paddingHorizontal: 4,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.sage,
  },
  categoryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 9,
  },
  selectedCategoryText: {
    color: colors.white,
  },
  amountRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    width: "100%",
  },
  amountInput: {
    flex: 1,
    flexWrap: "wrap",
    width: "100%",
  },
  currencyButton: {
    minWidth: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: colors.sage,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  dateRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  dateValue: {
    flex: 1,
    justifyContent: "center",
  },

  datePickerContainer: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: colors.primary,
    overflow: "hidden",
  },
  datePicker: {
    width: "100%",
  },
  doneButton: {
    padding: 14,
    alignItems: "flex-end",
  },
  doneText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  noteInput: {
    minHeight: 64,
    color: colors.primary,
    fontSize: 15,
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 12,
    marginBottom: 14,
  },
  saveButton: {
    minHeight: 56,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.65,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
  },
  currencyOption: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
});
