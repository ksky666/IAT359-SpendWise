import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./src/screens/HomeScreen";
import AddExpenseScreen from "./src/screens/AddExpenseScreen";
import StatisticsScreen from "./src/screens/StatisticsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

import ExpenseDetailsScreen from "./src/screens/ExpenseDetailsScreen";

const Tab = createBottomTabNavigator();

const HomeStack = createNativeStackNavigator();

function HomeStackScreen({ expenses, onDelete }) {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeOverview">
        {(props) => <HomeScreen {...props} expenses={expenses} />}
      </HomeStack.Screen>

      <HomeStack.Screen name="ExpenseDetails">
        {(props) => (
          <ExpenseDetailsScreen
            {...props}
            expenses={expenses}
            onDelete={onDelete}
          />
        )}
      </HomeStack.Screen>
    </HomeStack.Navigator>
  );
}

export default function App() {
  const [expenses, setExpenses] = useState([]);

  function saveExpense(expense) {
    const record = {
      ...expense,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };

    setExpenses((current) => [record, ...current]);
  }

  function deleteExpense(expenseId) {
    setExpenses((current) =>
      current.filter((expense) => expense.id !== expenseId),
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#333333",
          tabBarInactiveTintColor: "#999999",
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Home: "home-outline",
              Add: "add-circle-outline",
              Stats: "bar-chart-outline",
              Profile: "person-outline",
            };

            return (
              <Ionicons name={icons[route.name]} size={size} color={color} />
            );
          },
        })}
      >
        <Tab.Screen name="Home">
          {() => (
            <HomeStackScreen expenses={expenses} onDelete={deleteExpense} />
          )}
        </Tab.Screen>

        <Tab.Screen name="Add">
          {(props) => <AddExpenseScreen {...props} onSave={saveExpense} />}
        </Tab.Screen>

        <Tab.Screen name="Stats" component={StatisticsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
