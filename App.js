import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import ListScreen from './screens/ListScreen';
import DetailScreen from './screens/DetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Lista"
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#1C1C1E',
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Lista"
          component={ListScreen}
          options={{ title: 'To Do Dev' }}
        />
        <Stack.Screen
          name="Detalhe"
          component={DetailScreen}
          options={{ title: 'Detalhes da Tarefa' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
