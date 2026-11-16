import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { formatarLembrete } from '../utils/formatarData';

// Seletor de data/hora do lembrete. `valor` é um Date ou null.
export default function CampoLembrete({ valor, onChange }) {
  const [iosAberto, setIosAberto] = useState(false);

  const abrir = () => {
    const base = valor ?? new Date(Date.now() + 60 * 60 * 1000);

    if (Platform.OS === 'android') {
      // Android: primeiro a data, depois a hora.
      DateTimePickerAndroid.open({
        value: base,
        mode: 'date',
        minimumDate: new Date(),
        onChange: (e, dataEscolhida) => {
          if (e.type !== 'set' || !dataEscolhida) return;
          DateTimePickerAndroid.open({
            value: dataEscolhida,
            mode: 'time',
            is24Hour: true,
            onChange: (e2, horaEscolhida) => {
              if (e2.type !== 'set' || !horaEscolhida) return;
              const final = new Date(dataEscolhida);
              final.setHours(horaEscolhida.getHours(), horaEscolhida.getMinutes(), 0, 0);
              onChange(final);
            },
          });
        },
      });
    } else {
      if (!valor) onChange(base);
      setIosAberto(true);
    }
  };

  return (
    <View>
      <View style={styles.linha}>
        <TouchableOpacity style={styles.botao} onPress={abrir}>
          <Ionicons name="alarm-outline" size={20} color="#5B6CF9" />
          <Text style={styles.botaoTexto}>
            {valor ? formatarLembrete(valor.toISOString()) : 'Definir lembrete'}
          </Text>
        </TouchableOpacity>
        {valor ? (
          <TouchableOpacity
            style={styles.remover}
            onPress={() => {
              onChange(null);
              setIosAberto(false);
            }}
            accessibilityLabel="Remover lembrete"
          >
            <Ionicons name="close-circle" size={24} color="#8E8E93" />
          </TouchableOpacity>
        ) : null}
      </View>

      {Platform.OS === 'ios' && iosAberto && valor ? (
        <DateTimePicker
          value={valor}
          mode="datetime"
          display="spinner"
          minimumDate={new Date()}
          onChange={(_, d) => d && onChange(d)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  botao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  botaoTexto: { marginLeft: 8, fontSize: 15, color: '#1C1C1E' },
  remover: { marginLeft: 10 },
});
