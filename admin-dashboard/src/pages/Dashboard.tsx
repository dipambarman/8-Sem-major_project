import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { adminApi } from '../services/api';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });

  const [orderStats, setOrderStats] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getAnalyticsDashboard();
        if (response.data.success) {
          const {
            totalUsers,
            totalOrders,
            totalRevenue,
            activeUsers,
            orderStatusDistribution,
            userGrowth,
            dailyRevenue
          } = response.data.data;

          setStats({ totalUsers, totalOrders, totalRevenue, activeUsers });
          setOrderStats(orderStatusDistribution);
          setUserGrowth(userGrowth);
          setRevenueData(dailyRevenue);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats via axios:', error);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, trend }: any) => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" ml={0.5}>
                  +{trend}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box color="primary.main">{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Smart Canteen Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon fontSize="large" />}
            trend={12.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCartIcon fontSize="large" />}
            trend={8.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<AccountBalanceWalletIcon fontSize="large" />}
            trend={15.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<TrendingUpIcon fontSize="large" />}
            trend={5.8}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Order Status Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" mb={2}>
              Order Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={orderStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {orderStats.map((entry: any, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Growth */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" mb={2}>
              User Growth
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#007AFF"
                  strokeWidth={3}
                  dot={{ fill: '#007AFF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Daily Revenue */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" mb={2}>
              Daily Revenue (This Week)
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#4CAF50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
