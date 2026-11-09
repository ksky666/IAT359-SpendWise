import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../theme";

const categories = [
  { name: "Shopping", icon: "bag-handle-outline" },
  { name: "Travel", icon: "airplane-outline" },
  { name: "Entertainment", icon: "musical-notes-outline" },
  { name: "Food & Drinks", icon: "restaurant-outline" },
  { name: "Hobby", icon: "game-controller-outline" },
  { name: "Other", icon: "ellipsis-horizontal" },
];

const currencies = ["CAD", "USD", "GBP", "EUR", "HKD", "TWD"];

const fieldBackground = "#EAF0DE";
const muted = "#73796B";

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Keep the selected calendar date without UTC timezone conversion.
function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// changing currency
async function convertToCad(amount, currency, expenseDate) {
  if (currency === "CAD") {
    return {
      amountCad: amount,
      exchangeRate: 1,
      exchangeRateDate: null,
    };
  }

  const url =
    `https://api.frankfurter.dev/v2/rate/${currency}/CAD` +
    `?date=${expenseDate}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Exchange rate unavailable");
  }

  const { rate, date } = await response.json();

  if (!Number.isFinite(rate) || rate <= 0 || typeof date !== "string") {
    throw new Error("Invalid exchange rate");
  }

  return {
    amountCad: Number((amount * rate).toFixed(2)),
    exchangeRate: rate,
    exchangeRateDate: date,
  };
}

function AddExpenseContent({ onSave }) {
  // Temporary values matching the mockup.
  const [itemName, setItemName] = useState("");
  const [store, setStore] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  // const [date, setDate] = useState(new Date(2026, 9, 9));
  const [date, setDate] = useState(null);
  const [note, setNote] = useState("");
  const [receiptUri, setReceiptUri] = useState(null);

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const savingRef = useRef(false);

  async function chooseReceipt(source) {
    try {
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Camera permission required",
            "Please allow camera access in your device settings.",
          );
          return;
        }
      }

      const options = {
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      };

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets?.[0]?.uri) {
        setReceiptUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert(
        "Unable to open photos",
        "Please try again. To take a photo, use a device with a camera.",
      );
    }
  }

  function openReceiptOptions() {
    Keyboard.dismiss();

    Alert.alert("Add receipt", "Choose a photo source.", [
      {
        text: "Take photo",
        onPress: () => chooseReceipt("camera"),
      },
      {
        text: "Choose from gallery",
        onPress: () => chooseReceipt("gallery"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function handleDateChange(event, selectedDate) {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type !== "dismissed" && selectedDate) {
      setDate(selectedDate);
    }
  }

  async function handleSave() {
    if (savingRef.current) return;

    Keyboard.dismiss();

    const normalizedAmount = amount.trim().replace(",", ".");
    const numericAmount = Number(normalizedAmount);

    if (!itemName.trim()) {
      Alert.alert("Missing item name", "Please enter an item name.");
      return;
    }

    if (!category) {
      Alert.alert("Missing category", "Please select a category.");
      return;
    }

    if (
      !/^\d+(?:\.\d{1,2})?$/.test(normalizedAmount) ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      Alert.alert(
        "Invalid amount",
        "Enter a positive amount with up to two decimal places.",
      );
      return;
    }

    if (!currencies.includes(currency)) {
      Alert.alert("Missing currency", "Please select a currency.");
      return;
    }

    if (!date) {
      Alert.alert("Missing date", "Please select a date.");
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const expenseDate = toDateString(date);

      let conversion;
      try {
        conversion = await convertToCad(numericAmount, currency, expenseDate);
      } catch {
        Alert.alert(
          "Exchange rate unavailable",
          "Check your connection or try another date. Your entries are still here.",
        );
        return;
      }

      const expense = {
        name: itemName.trim(),
        store: store.trim(),
        category,
        amount: numericAmount,
        currency,
        date: expenseDate,
        note: note.trim(),
        receiptUri,
        ...conversion,
      };

      if (typeof onSave !== "function") {
        const original = `${expense.amount.toFixed(2)} ${expense.currency}`;
        const converted = `${expense.amountCad.toFixed(2)} CAD`;

        Alert.alert(
          "Form checked",
          `${expense.name}\n${
            currency === "CAD" ? converted : `${original} ≈ ${converted}`
          }\n\nDemo only. This expense has not been saved.`,
        );
        return;
      }

      await onSave(expense);
      Alert.alert("Saved", "Your expense has been saved.");
    } catch {
      Alert.alert(
        "Unable to save",
        "Please try again. Your entries are still here.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.title}>Add Expense</Text>

          {/* Receipt upload and preview */}
          <View style={styles.receiptRow}>
            <Pressable
              onPress={openReceiptOptions}
              style={({ pressed }) => [
                styles.uploadCard,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Take a photo or choose a receipt from gallery"
            >
              <Ionicons
                name="camera-outline"
                size={33}
                color={colors.primary}
              />

              <Text style={styles.uploadText}>
                Take a photo or{"\n"}choose from gallery
              </Text>
            </Pressable>

            <View style={styles.receiptPreview}>
              {receiptUri ? (
                <>
                  <Image
                    source={{ uri: receiptUri }}
                    style={styles.receiptImage}
                    resizeMode="cover"
                    accessibilityLabel="Selected receipt"
                  />

                  <Pressable
                    onPress={() => setReceiptUri(null)}
                    style={styles.removePhoto}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Remove receipt photo"
                  >
                    <Ionicons name="close" size={20} color={colors.primary} />
                  </Pressable>
                </>
              ) : (
                <Pressable
                  onPress={openReceiptOptions}
                  style={styles.emptyReceipt}
                  accessibilityRole="button"
                  accessibilityLabel="Add receipt photo"
                >
                  <Ionicons name="receipt-outline" size={36} color={muted} />
                  <Text style={styles.previewText}>Receipt preview</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Item name and store */}
          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <Text style={styles.label}>Item name</Text>
              <TextInput
                style={styles.input}
                value={itemName}
                onChangeText={setItemName}
                placeholder=""
                placeholderTextColor={muted}
                accessibilityLabel="Item name"
                maxLength={80}
              />
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Where to buy</Text>
              <TextInput
                style={styles.input}
                value={store}
                onChangeText={setStore}
                placeholder=""
                placeholderTextColor={muted}
                accessibilityLabel="Where to buy"
                maxLength={100}
              />
            </View>
          </View>

          {/* Categories */}
          <Text style={styles.label}>Categories</Text>

          <View style={styles.categoryGrid}>
            {categories.map((item) => {
              const selected = category === item.name;

              return (
                <Pressable
                  key={item.name}
                  onPress={() => setCategory(item.name)}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    selected && styles.selectedCategory,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  accessibilityState={{ selected }}
                >
                  <Ionicons
                    name={item.icon}
                    size={30}
                    color={selected ? colors.white : colors.primary}
                  />

                  <Text
                    style={[
                      styles.categoryText,
                      selected && styles.selectedCategoryText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Amount and currency */}
          <Text style={styles.label}>Amount</Text>

          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, styles.amountInput]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={muted}
              accessibilityLabel="Expense amount"
              maxLength={12}
            />

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
              <Ionicons name="chevron-down" size={18} color={colors.primary} />
            </Pressable>
          </View>

          {/* Date */}
          <Text style={styles.label}>Date</Text>

          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setShowDatePicker(true);
            }}
            style={styles.dateRow}
            accessibilityRole="button"
            // accessibilityLabel={`Select date, ${formatDate(date)}`}
            accessibilityLabel={
              date ? `Select date, ${formatDate(date)}` : "Select date"
            }
          >
            <View style={[styles.input, styles.dateValue]}>
              {/* <Text style={styles.inputText}>{formatDate(date)}</Text> */}
              <Text style={styles.inputText}>
                {date ? formatDate(date) : "Select date"}
              </Text>
            </View>

            <View style={styles.calendarButton}>
              <Ionicons
                name="calendar-outline"
                size={27}
                color={colors.primary}
              />
            </View>
          </Pressable>

          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                // value={date}
                value={date ?? new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                themeVariant="light"
                textColor={colors.primary}
                style={styles.datePicker}
              />

              {Platform.OS === "ios" && (
                <Pressable
                  // onPress={() => setShowDatePicker(false)}
                  onPress={() => {
                    setDate((selectedDate) => selectedDate ?? new Date());
                    setShowDatePicker(false);
                  }}
                  style={styles.doneButton}
                  accessibilityRole="button"
                >
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Note */}
          <Text style={styles.label}>Note</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note (optional)"
            placeholderTextColor={muted}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Note"
            maxLength={500}
          />

          {/* Save */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveButton,
              (pressed || saving) && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: saving }}
          >
            {saving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

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
    </SafeAreaView>
  );
}

export default function AddExpenseScreen(props) {
  return (
    <SafeAreaProvider>
      <AddExpenseContent {...props} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: fieldBackground,
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
    color: muted,
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
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: fieldBackground,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "500",
  },
  inputText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "500",
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
    backgroundColor: fieldBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCategory: {
    backgroundColor: colors.secondary,
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
  },
  amountInput: {
    flex: 1,
  },
  currencyButton: {
    minWidth: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: fieldBackground,
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
  calendarButton: {
    width: 48,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: fieldBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  datePickerContainer: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: fieldBackground,
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
