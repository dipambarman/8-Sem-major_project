import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  ShoppingCart,
  AttachMoney,
  Star,
} from '@mui/icons-material';

const Analytics = () => {
  const [period, setPeriod] = useState('30d');
  const [revenueData, setRevenueData] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 125640,
    totalOrders: 1247,
    avgRating: 4.6,
    repeatCustomers: 68,
  });

  useEffect(() => {
    // Mock analytics data - replace with actual API calls
    setRevenueData([
      { date: '2024-01', revenue: 45000, orders: 234 },
      { date: '2024-02', revenue: 52000, orders: 267 },
      { date: '2024-03', revenue: 48000, orders: 245 },
      { date: '2024-04', revenue: 58000, orders: 289 },
      { date: '2024-05', revenue: 62000, orders: 312 },
      { date: '2024-06', revenue: 67000, orders: 334 },
    ]);

    setPopularItems([
      { name: 'Chicken Biryani', orders: 156, revenue: 23400 },
      { name: 'Masala Chai', orders: 234, revenue: 3510 },
      { name: 'Veg Sandwich', orders: 89, revenue: 3560 },
      { name: 'Paneer Tikka', orders: 67, revenue: 10720 },
      { name: 'Dal Rice', orders: 98, revenue: 7840 },
    ]);

    setOrderTypes([
      { name: 'Delivery', value: 45, color: '#2E7D32' },
      { name: 'Pickup', value: 35, color: '#FF6B35' },
      { name: 'Dine-in', value: 20, color: '#1976D2' },
    ]);
  }, [period]);

  const StatCard = ({ title, value, icon, color, trend }) => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2">
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUp color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" ml={0.5}>
                  +{trend}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Vendor Analytics
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={period}
            label="Period"
            onChange={(e) => setPeriod(e.target.value)}
          >
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
            <MenuItem value="1y">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<AttachMoney fontSize="large" />}
            color="#2E7D32"
            trend={12.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart fontSize="large" />}
            color="#1976D2"
            trend={8.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Rating"
            value={stats.avgRating}
            icon={<Star fontSize="large" />}
            color="#FF6B35"
            trend={2.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Repeat Customers"
            value={`${stats.repeatCustomers}%`}
            icon={<TrendingUp fontSize="large" />}
            color="#9C27B0"
            trend={5.7}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" mb={2}>
              Revenue & Orders Trend
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${value}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2E7D32"
                  fill="#2E7D32"
                  fillOpacity={0.3}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#FF6B35"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Order Types */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" mb={2}>
              Order Types Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={orderTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Popular Items */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Most Popular Items
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularItems} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `₹${value}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]} />
                <Bar dataKey="orders" fill="#2E7D32" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
