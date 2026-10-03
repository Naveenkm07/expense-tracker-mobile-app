import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth, useUser } from '@clerk/expo';
import { supabase, createClerkSupabaseClient } from '../../lib/supabase';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';

export default function DashboardScreen() {
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  const [totalSpent, setTotalSpent] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    const token = await getToken({ template: 'supabase' });
    const authClient = token ? createClerkSupabaseClient(token) : supabase;
    
    const { data, error: _error } = await authClient
      .from('expenses')
      .select('amount, category')
      .eq('user_id', user?.id);
    
    if (data) {
      const sum = data.reduce((acc, curr) => acc + Number(curr.amount), 0);
      setTotalSpent(sum);

      // Group for chart
      const grouped = data.reduce((acc: any, curr: any) => {
        acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
        return acc;
      }, {});

      const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6', '#AF52DE'];
      const mappedChartData = Object.keys(grouped).map((key, index) => ({
        name: key,
        amount: grouped[key],
        color: colors[index % colors.length],
        legendFontColor: '#1C1C1E',
        legendFontSize: 12,
      }));
      setChartData(mappedChartData);
    }
  }, [getToken, user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>{user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0]}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Ionicons name="wallet-outline" size={20} color="#007AFF" />
          <Text style={styles.summaryTitle}>Total Expenses</Text>
        </View>
        <Text style={styles.summaryAmount}>${totalSpent.toFixed(2)}</Text>
        <Text style={styles.summarySubtitle}>Across all categories this month</Text>
      </View>

      <Text style={styles.sectionTitle}>Analytics</Text>
      <View style={styles.chartCard}>
        {chartData.length > 0 ? (
          <PieChart
            data={chartData}
            width={Dimensions.get('window').width - 72}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor={"amount"}
            backgroundColor={"transparent"}
            paddingLeft={"0"}
            absolute
          />
        ) : (
          <View style={styles.emptyChart}>
            <Ionicons name="pie-chart-outline" size={40} color="#C7C7CC" />
            <Text style={styles.emptyChartText}>No data to display yet.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  greeting: {
    fontSize: 15,
    color: '#8E8E93',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 32,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  summaryAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#007AFF',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
    paddingLeft: 4,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyChart: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    marginTop: 12,
    color: '#8E8E93',
    fontSize: 15,
  }
});
