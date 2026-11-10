import React from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme";

function formatExpenseDate(date) {
  const [year, month, day] = date.split("-").map(Number);

  // Parse YYYY-MM-DD as a local date so the displayed day stays the same.
  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function ExpenseDetailsScreen({
  navigation,
  route,
  expenses,
  onDelete,
}) {
  // const expenseId = route.params?.expenseId;
  // const expense = expenses.find((item) => item.id === expenseId);

  // placeholder button for temporary preview
  const expenseId = route.params?.expenseId;
  const isPreview = __DEV__ && route.params?.preview === true;

  const expense = isPreview
    ? {
        name: "Coffee",
        category: "Food & Drinks",
        amount: 4.75,
        currency: "CAD",
        date: "2026-10-09",
        store: "Starbucks",
        note: "Iced latte",
      }
    : expenses.find((item) => item.id === expenseId);

  function confirmDelete() {
    Alert.alert("Delete expense?", `Delete "${expense.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          onDelete(expense.id);
          navigation.goBack();
        },
      },
    ]);
  }

  const receiptUri = expense?.receiptUrl || expense?.receiptUri;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={26} color={colors.primary} />
        </Pressable>

        <Text style={styles.title}>Expense Details</Text>

        {expense ? (
          <>
            {receiptUri ? (
              <Image
                source={{ uri: receiptUri }}
                style={styles.receipt}
                resizeMode="cover"
                accessible
                accessibilityLabel="Expense receipt"
              />
            ) : null}

            <View style={styles.nameRow}>
              <Text style={styles.name}>{expense.name}</Text>

              {expense.id && (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    style={styles.deleteButton}
                    accessibilityRole="button"
                    onPress={() =>
                      navigation.navigate("EditExpense", {
                        expenseId: expense.id,
                      })
                    }
                  >
                    <Text style={styles.deleteText}>Edit</Text>
                  </Pressable>

                  {typeof onDelete === "function" && (
                    <Pressable
                      style={styles.deleteButton}
                      accessibilityRole="button"
                      onPress={confirmDelete}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={17}
                        color={colors.primary}
                      />
                      <Text style={styles.deleteText}>Delete</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>

            <View style={styles.detailsCard}>
              <DetailRow label="Category" value={expense.category} />
              <DetailRow
                label="Amount"
                value={`${expense.amount.toFixed(2)} ${expense.currency}`}
              />

              {expense.currency !== "CAD" &&
                Number.isFinite(expense.amountCad) && (
                  <DetailRow
                    label="In CAD"
                    value={`≈ ${expense.amountCad.toFixed(2)} CAD`}
                  />
                )}

              <DetailRow label="Date" value={formatExpenseDate(expense.date)} />

              {expense.store ? (
                <DetailRow label="Where to buy" value={expense.store} />
              ) : null}

              {expense.note ? (
                <DetailRow label="Note" value={expense.note} />
              ) : null}
            </View>
          </>
        ) : (
          <Text style={styles.detailLabel}>Expense unavailable.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 22,
  },
  receipt: {
    width: "100%",
    aspectRatio: 1.8,
    borderRadius: 18,
    backgroundColor: colors.sage,
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  name: {
    flex: 1,
    color: colors.primary,
    fontSize: 25,
    fontWeight: "800",
  },
  deleteButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.sage,
  },
  deleteText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  detailsCard: {
    backgroundColor: "#EAF0DE",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
  },
  detailLabel: {
    flex: 2,
    color: "#596457",
    fontSize: 15,
  },
  detailValue: {
    flex: 3,
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
});
