import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Paper,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  ShoppingCart,
  AttachMoney,
  People,
  Notifications,
} from '@mui/icons-material';
import { vendorApi } from '../services/api';

const VendorDashboard = ({ socket }) => {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    totalCustomers: 0, // Maps to menuItemsCount or other actual count
    avgOrderValue: 0,
    totalOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([
    { id: 'ORD001', customer: 'John Doe', amount: 450, status: 'preparing', time: '10:30 AM' },
    { id: 'ORD002', customer: 'Jane Smith', amount: 320, status: 'ready', time: '10:45 AM' },
    { id: 'ORD003', customer: 'Mike Johnson', amount: 275, status: 'completed', time: '11:00 AM' },
  ]);

  const [salesData] = useState([
    { day: 'Mon', orders: 32, revenue: 12000 },
    { day: 'Tue', orders: 45, revenue: 15800 },
    { day: 'Wed', orders: 28, revenue: 9600 },
    { day: 'Thu', orders: 52, revenue: 18200 },
    { day: 'Fri', orders: 38, revenue: 13400 },
    { day: 'Sat', orders: 65, revenue: 22500 },
    { day: 'Sun', orders: 48, revenue: 16800 },
  ]);

  const [orderTypes] = useState([
    { name: 'Delivery', value: 45, color: '#2E7D32' },
    { name: 'Pickup', value: 35, color: '#FF6B35' },
    { name: 'Dine-in', value: 20, color: '#1976D2' },
  ]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await vendorApi.getDashboardStats();
        if (response.data.success) {
          const data = response.data.data;
          setStats({
            todayOrders: data.todayOrders,
            todayRevenue: data.totalRevenue,
            totalCustomers: data.menuItemsCount, // Temporary mapping totalCustomers to menuItems
            avgOrderValue: data.totalOrders ? Math.round(data.totalRevenue / data.totalOrders) : 0,
            totalOrders: data.totalOrders
          });
        }
      } catch (error) {
        console.error('Failed to fetch vendor stats', error);
      }
    };
    
    fetchDashboardStats();

    if (socket) {
      socket.on('newOrder', (order) => {
        setRecentOrders(prev => [order, ...prev.slice(0, 4)]);
        setStats(prev => ({
          ...prev,
          todayOrders: prev.todayOrders + 1,
          todayRevenue: prev.todayRevenue + order.amount,
        }));
      });

      socket.on('orderStatusUpdate', (updatedOrder) => {
        setRecentOrders(prev =>
          prev.map(order =>
            order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order
          )
        );
      });
    }
    
    return () => {
      if (socket) {
        socket.off('newOrder');
        socket.off('orderStatusUpdate');
      }
    };
  }, [socket]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      preparing: 'info',
      ready: 'success',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const StatCard = ({ title, value, icon, trend, color }) => (
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
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Vendor Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Orders"
            value={stats.todayOrders}
            icon={<ShoppingCart />}
            trend={12.5}
            color="#2E7D32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Revenue"
            value={`₹${stats.todayRevenue.toLocaleString()}`}
            icon={<AttachMoney />}
            trend={8.3}
            color="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Menu Items"
            value={stats.totalCustomers}
            icon={<People />}
            trend={0}
            color="#FF6B35"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Order Value"
            value={`₹${stats.avgOrderValue}`}
            icon={<TrendingUp />}
            trend={3.2}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      {/* Charts and Recent Orders */}
      <Grid container spacing={3}>
        {/* Weekly Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" mb={2}>
              Weekly Sales Overview
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="revenue" fill="#2E7D32" name="Revenue (₹)" />
                <Line yAxisId="right" dataKey="orders" stroke="#FF6B35" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Order Types Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" mb={2}>
              Order Types
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

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recent Orders</Typography>
              <Badge badgeContent={recentOrders.length} color="primary">
                <Notifications />
              </Badge>
            </Box>
            <List>
              {recentOrders.map((order) => (
                <ListItem key={order.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {order.customer.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Order #${order.id} - ${order.customer}`}
                    secondary={`₹${order.amount} • ${order.time}`}
                  />
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                    variant="filled"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VendorDashboard;
