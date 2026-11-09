import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme";

const ui = {
  text: colors.primary,
  muted: "#73796B",
  expenseBackground: "#EAF0DE",
  ringBackground: "#CEDDB5",
};

function CircularProgress({ percentage }) {
  const size = 132;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(percentage, 100));

  return (
    <View
      style={styles.ring}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Monthly budget spent"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: progress,
        text: `${percentage.toFixed(0)} percent spent`,
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ui.ringBackground}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {progress > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.secondary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - progress / 100)}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        )}
      </Svg>

      <View style={styles.ringLabel}>
        <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
      </View>
    </View>
  );
}

function HomeContent({ navigation, expenses = [] }) {
  // Temporary data for UI development
  const monthlyBudget = 500;
  const totalSpent = 360;
  const remaining = monthlyBudget - totalSpent;
  const spendingPercentage =
    monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;

  const progress = Math.max(0, Math.min(spendingPercentage, 100));

  const recentExpenses = expenses.slice(0, 3);

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

  function openMonthPicker() {
    Alert.alert("Select month", "This is a placeholder for your month picker.");
  }

  const budgetMessage =
    remaining < 0
      ? "You've exceeded your monthly budget limit. Keep an eye on your spending!"
      : remaining === 0
        ? "You've reached your monthly budget limit. Keep an eye on your spending!"
        : "You're approaching your monthly budget limit. Keep an eye on your spending!";

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Good Evening!</Text>

          <Pressable
            onPress={openMonthPicker}
            style={styles.monthButton}
            accessibilityRole="button"
            accessibilityLabel="Select month, October 2026"
            hitSlop={8}
          >
            <Text style={styles.month}>October 2026</Text>
            <Ionicons name="chevron-down" size={19} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.budgetCard}>
          <View style={styles.budgetTop}>
            <View style={styles.budgetDetails}>
              <Text style={styles.cardLabel}>Monthly Budget</Text>

              <Text style={styles.budgetAmount}>
                ${monthlyBudget.toFixed(0)}
                <Text style={styles.budgetCurrency}> CAD</Text>
              </Text>
            </View>

            <CircularProgress percentage={spendingPercentage} />
          </View>

          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.budgetRow}>
            <Text style={styles.budgetCaption}>
              ${totalSpent.toFixed(0)} spent
            </Text>

            <Text style={styles.budgetCaption}>
              ${Math.abs(remaining).toFixed(0)}{" "}
              {remaining < 0 ? "over" : "left"}
            </Text>
          </View>

          {spendingPercentage >= 70 && (
            <View style={styles.warningRow}>
              <Ionicons
                name="notifications-outline"
                size={29}
                color={colors.primary}
              />
              <Text style={styles.warningText}>{budgetMessage}</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>

          <Pressable
            onPress={() => openScreen("Expenses")}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        {/* placeholder button for temporary preview */}
        {__DEV__ && (
          <Pressable
            style={styles.expenseCard}
            onPress={() =>
              navigation.navigate("ExpenseDetails", { preview: true })
            }
            accessibilityRole="button"
          >
            <Text style={styles.expenseName}>Preview Expense Details</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </Pressable>
        )}

        {recentExpenses.length === 0 ? (
          <Text style={styles.expenseDate}>No expenses yet.</Text>
        ) : (
          recentExpenses.map((expense) => (
            <Pressable
              key={expense.id}
              style={styles.expenseCard}
              onPress={() =>
                navigation.navigate("ExpenseDetails", {
                  expenseId: expense.id,
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`View expense: ${expense.name}`}
            >
              <View style={styles.expenseIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={26}
                  color={colors.primary}
                />
              </View>

              <View style={styles.expenseDetails}>
                <Text style={styles.expenseName}>{expense.name}</Text>
                <Text style={styles.expenseDate}>{expense.date}</Text>
              </View>

              <View style={styles.expenseAmounts}>
                <Text style={styles.expenseAmount}>
                  {expense.amount.toFixed(2)} {expense.currency}
                </Text>

                {expense.currency !== "CAD" &&
                  Number.isFinite(expense.amountCad) && (
                    <Text style={styles.convertedAmount}>
                      ≈ {expense.amountCad.toFixed(2)} CAD
                    </Text>
                  )}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function HomeScreen(props) {
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
  monthButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 10,
    minHeight: 32,
  },
  month: {
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
  ring: {
    width: 132,
    height: 132,
    position: "relative",
    flexShrink: 0,
  },
  ringLabel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  percentage: {
    color: ui.text,
    fontSize: 29,
    fontWeight: "800",
  },
  progressBackground: {
    height: 12,
    backgroundColor: colors.white,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.secondary,
    borderRadius: 6,
  },
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
});
