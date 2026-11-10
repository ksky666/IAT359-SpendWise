import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/firebaseConfig";

import { Alert } from "react-native";

import { createExpense, subscribeToExpenses } from "./src/expenseService";

import HomeScreen from "./src/screens/HomeScreen";
import AddExpenseScreen from "./src/screens/AddExpenseScreen";
import StatisticsScreen from "./src/screens/StatisticsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ExpenseDetailsScreen from "./src/screens/ExpenseDetailsScreen";

// New authentication screens
import LoginScreen from "./src/screens/LoginScreen";
import SignUpScreen from "./src/screens/SignUpScreen";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

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

// New: Login and Sign Up navigation
function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [expenseFeed, setExpenseFeed] = useState(null);

  const userId = user?.uid ?? null;
  const expenses = expenseFeed?.userId === userId ? expenseFeed.items : [];

  // Track login and logout.
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
  }, []);

  // Load expenses for the signed-in account.
  useEffect(() => {
    setExpenseFeed(null);

    if (!userId) return;

    return subscribeToExpenses(
      userId,
      (items) => {
        setExpenseFeed({ userId, items });
      },
      (error) => {
        console.warn("Unable to load expenses:", error.code);
        Alert.alert(
          "Unable to load expenses",
          "Please check your connection and try again.",
        );
      },
    );
  }, [userId]);

  async function saveExpense(expense) {
    await createExpense(expense);
  }

  // New: Wait for Firebase to check login status
  if (authLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#333333" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
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
            {() => <HomeStackScreen expenses={expenses} />}
          </Tab.Screen>

          <Tab.Screen name="Add">
            {(props) => <AddExpenseScreen {...props} onSave={saveExpense} />}
          </Tab.Screen>

          <Tab.Screen name="Stats" component={StatisticsScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      ) : (
        <AuthStackScreen />
      )}
    </NavigationContainer>
  );
}
