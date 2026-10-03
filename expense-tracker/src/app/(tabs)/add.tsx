import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { supabase, createClerkSupabaseClient } from '../../lib/supabase';
import { useUser, useAuth } from '@clerk/expo';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AddScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAddExpense = async () => {
    if (!amount || !category) {
      Alert.alert('Required Fields', 'Please fill in both the amount and category.');
      return;
    }
    
    setLoading(true);
    
    const token = await getToken({ template: 'supabase' });
    const authClient = token ? createClerkSupabaseClient(token) : supabase;

    const { error } = await authClient.from('expenses').insert({
      user_id: user?.id,
      amount: parseFloat(amount),
      category,
      note,
      date: new Date().toISOString(),
      is_imported: false,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setAmount('');
      setCategory('');
      setNote('');
      router.back();
    }
  };

  const handleImportExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setUploading(true);
      
      const response = await fetch(file.uri);
      const blob = await response.blob();
      const fileName = `${user?.id}/${Date.now()}-${file.name}`;
      
      const token = await getToken({ template: 'supabase' });
      const authClient = token ? createClerkSupabaseClient(token) : supabase;
      
      const { error } = await authClient.storage
        .from('excel_imports')
        .upload(fileName, blob, {
          contentType: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

      setUploading(false);

      if (error) {
        Alert.alert('Upload Error', error.message);
      } else {
        Alert.alert('Success', 'File uploaded! The backend will process it shortly.');
      }
    } catch (err: any) {
      setUploading(false);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>New Expense</Text>
          <Text style={styles.subtitle}>Enter the details of your transaction</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#C7C7CC"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          
          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="pricetag-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., Food, Transport"
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <Text style={styles.inputLabel}>Note (Optional)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="document-text-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="What was this for?"
              value={note}
              onChangeText={setNote}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleAddExpense} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Save Expense</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR BULK IMPORT</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.importCard} onPress={handleImportExcel} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color="#007AFF" size="large" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={40} color="#007AFF" />
              <Text style={styles.importTitle}>Upload Spreadsheet</Text>
              <Text style={styles.importSubtitle}>Supports Excel (.xlsx) and CSV</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 72,
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    paddingHorizontal: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D1D6',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#8E8E93',
    fontWeight: '700',
    fontSize: 12,
  },
  importCard: {
    backgroundColor: '#E6F4FE',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 12,
  },
  importSubtitle: {
    fontSize: 13,
    color: '#007AFF',
    opacity: 0.8,
    marginTop: 4,
  },
});
