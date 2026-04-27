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

 