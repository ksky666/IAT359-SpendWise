import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function HomeScreen() {
  // Temporary data for UI development
  const monthlyBudget = 500;
  const totalSpent = 360;
  const remaining = monthlyBudget - totalSpent;
  const spendingPercentage = (totalSpent / monthlyBudget) * 100;

  const recentExpenses = [
    { id: "1", name: "Clothing", amount: 204, date: "Oct 10, 2026" },
    { id: "2", name: "Travel", amount: 109, date: "Oct 8, 2026" },
    { id: "3", name: "Food & Drinks", amount: 45, date: "Oct 2, 2026" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Good Evening!</Text>
      <Text style={styles.month}>October 2026</Text>

      <View style={styles.budgetCard}>
        <Text style={styles.cardLabel}>Monthly Budget</Text>
        <Text style={styles.budgetAmount}>${monthlyBudget.toFixed(2)} CAD</Text>

        <Text style={styles.percentage}>{spendingPercentage.toFixed(0)}%</Text>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(spendingPercentage, 100)}%` },
            ]}
          />
        </View>

        <View style={styles.budgetRow}>
          <Text>${totalSpent.toFixed(2)} spent</Text>
          <Text>${remaining.toFixed(2)} left</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Expenses</Text>

      {recentExpenses.map((expense) => (
        <View key={expense.id} style={styles.expenseCard}>
          <View>
            <Text style={styles.expenseName}>{expense.name}</Text>
            <Text style={styles.expenseDate}>{expense.date}</Text>
          </View>
          <Text style={styles.expenseAmount}>
            ${expense.amount.toFixed(2)} CAD
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 24,
    paddingTop: 70,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "bold",
  },
  month: {
    fontSize: 15,
    color: "#666666",
    marginTop: 5,
    marginBottom: 25,
  },
  budgetCard: {
    backgroundColor: "#E5E5E5",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  budgetAmount: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 8,
  },
  percentage: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  progressBackground: {
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#666666",
    borderRadius: 10,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  expenseCard: {
    backgroundColor: "#EEEEEE",
    padding: 18,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expenseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  expenseDate: {
    fontSize: 12,
    color: "#777777",
    marginTop: 4,
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
});
