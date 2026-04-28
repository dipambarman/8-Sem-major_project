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

const VendorDashboard = ({ socket }: any) => {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    totalCustomers: 0,
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
            totalCustomers: data.menuItemsCount, 
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
      socket.on('newOrder', (order: any) => {
        setRecentOrders((prev) => [order, ...prev.slice(0, 4)]);
        setStats((prev) => ({
          ...prev,
          todayOrders: prev.todayOrders + 1,
          todayRevenue: prev.todayRevenue + order.amount,
        }));
      });

      socket.on('orderStatusUpdate', (updatedOrder: any) => {
        setRecentOrders((prev) =>
          prev.map((order) =>
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
      pending: 'warning',
      preparing: 'info',
      ready: 'success',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
        Dashboard Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Today's Orders", value: stats.todayOrders, icon: <ShoppingCart />, color: '#1976D2' },
          { title: 'Today Revenue', value: `₹${stats.todayRevenue}`, icon: <AttachMoney />, color: '#2E7D32' },
          { title: 'Total Customers', value: stats.totalCustomers, icon: <People />, color: '#FF6B35' },
          { title: 'Avg Order Value', value: `₹${stats.avgOrderValue}`, icon: <TrendingUp />, color: '#9C27B0' },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {item.value}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: `${item.color}15`, color: item.color, width: 56, height: 56 }}>
                  {item.icon}
                </Avatar>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Revenue Overview
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="#1976D2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Order Types
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              {orderTypes.map((type) => (
                <Box key={type.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: type.color }} />
                  <Typography variant="body2">{type.name}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Orders
              </Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {recentOrders.map((order, index) => (
                <ListItem
                  key={order.id}
                  divider={index < recentOrders.length - 1}
                  sx={{ py: 2, px: 3 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                      {order.customer.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {order.id}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          • {order.time}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="textPrimary" sx={{ mt: 0.5 }}>
                        {order.customer} • ₹{order.amount}
                      </Typography>
                    }
                  />
                  <Chip
                    label={order.status.toUpperCase()}
                    color={getStatusColor(order.status)}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
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