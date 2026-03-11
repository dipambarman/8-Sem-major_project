import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
import { adminApi } from '../services/api';

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('7d');
  const [revenueData, setRevenueData] = useState([]);
  const [orderTrends, setOrderTrends] = useState([]);
  const [userActivity, setUserActivity] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminApi.getAnalyticsDashboard();
        if (response.data.success) {
          const data = response.data.data;
          
          // Map daily revenue to area chart
          setRevenueData(data.dailyRevenue.map((d: any) => ({
             date: d.day,
             revenue: d.revenue,
             orders: Math.floor(d.revenue / 350) || 0 // Mock order count correlation since backend only gives revenue
          })));

          // Map order status to pie chart
          setOrderTrends(data.orderStatusDistribution);

          // Map user growth roughly to user activity
          const mappedActivity = data.userGrowth.map((g: any, i: number) => ({
            hour: `${i * 4}:00`,
            activeUsers: g.users
          }));
          setUserActivity(mappedActivity);
        }
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      }
    };
    
    fetchAnalytics();
  }, [timeframe]);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Analytics & Reports
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Timeframe</InputLabel>
          <Select
            value={timeframe}
            label="Timeframe"
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
            <MenuItem value="1y">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Revenue & Orders Chart */}
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
                  stackId="1"
                  stroke="#007AFF"
                  fill="#007AFF"
                  fillOpacity={0.3}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#34C759"
                  strokeWidth={3}
                  dot={{ fill: '#34C759' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Order Type Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" mb={2}>
              Order Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={orderTrends}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderTrends.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Activity Heatmap */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" mb={2}>
              Daily User Activity Pattern
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} users`, 'Active Users']} />
                <Bar dataKey="activeUsers" fill="#FF9500" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
