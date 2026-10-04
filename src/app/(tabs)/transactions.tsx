import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useUser, useAuth } from '@clerk/expo';
import { supabase, createClerkSupabaseClient } from '../../lib/supabase';
import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionsScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    
    const token = await getToken({ template: 'supabase' });
    const authClient = token ? createClerkSupabaseClient(token) : supabase;

    const { data, error: _error } = await authClient
      .from('expenses')
      .select('*')
      .eq('user_id', user?.id)
      .order('date', { ascending: false });
    
    if (data) {
      setExpenses(data);
    }
    setLoading(false);
  }, [getToken, user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchExpenses();
    }
  }, [user, fetchExpenses]);

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('food') || cat.includes('restaurant')) return 'fast-food';
    if (cat.includes('transport') || cat.includes('gas') || cat.includes('uber')) return 'car';
    if (cat.includes('shop') || cat.includes('grocery')) return 'cart';
    if (cat.includes('entertainment') || cat.includes('movie')) return 'film';
    if (cat.includes('bill') || cat.includes('utilit')) return 'document-text';
    return 'cash';
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name={getCategoryIcon(item.category) as any} size={24} color="#007AFF" />
      </View>
      <View style={styles.itemLeft}>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemDate}>{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
        {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemAmount}>${Number(item.amount).toFixed(2)}</Text>
        {item.is_imported && (
          <View style={styles.importedBadge}>
            <Text style={styles.importedBadgeText}>Imported</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#C7C7CC" />
              <Text style={styles.emptyText}>No transactions yet.</Text>
              <Text style={styles.emptySubtext}>Add an expense to get started.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F4FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemLeft: {
    flex: 1,
  },
  itemCategory: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  itemDate: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  itemNote: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 6,
    fontStyle: 'italic',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  importedBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  importedBadgeText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 8,
  }
});
