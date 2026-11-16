import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import ListScreen from './screens/ListScreen';
import DetailScreen from './screens/DetailScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import { configurarCanal } from './services/notificacoes';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    configurarCanal().catch((e) => console.warn('Canal de notificação:', e));
  }, []);

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
        <Stack.Screen
          name="Adicionar"
          component={AddTaskScreen}
          options={{ title: 'Nova Tarefa', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
