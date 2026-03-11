import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Alert,
} from '@mui/material';
import {
  Refresh,
  Edit,
  CheckCircle,
  Cancel,
  LocalShipping,
  Restaurant,
  Timer,
} from '@mui/icons-material';
import { vendorApi } from '../services/api';

const Orders = ({ socket }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchOrders();
    
    if (socket) {
      socket.on('newOrder', (order) => {
        setOrders(prev => [order, ...prev]);
        setNotification({ type: 'info', message: `New order received: #${order.id}` });
        setTimeout(() => setNotification(null), 5000);
      });
    }
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const response = await vendorApi.getOrders();
      setOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await vendorApi.updateOrderStatus(
        selectedOrder.id,
        newStatus,
        estimatedTime || undefined
      );
      
      setOrders(prev =>
        prev.map(order =>
          order.id === selectedOrder.id
            ? { ...order, status: newStatus, estimatedTime }
            : order
        )
      );
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('orderStatusUpdate', {
          orderId: selectedOrder.id,
          status: newStatus,
          estimatedTime,
        });
      }
      
      setStatusUpdateDialog(false);
      setNotification({ type: 'success', message: 'Order status updated successfully' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Failed to update order status:', error);
      setNotification({ type: 'error', message: 'Failed to update order status' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'secondary',
      ready: 'success',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Timer />,
      confirmed: <CheckCircle />,
      preparing: <Restaurant />,
      ready: <LocalShipping />,
      completed: <CheckCircle />,
      cancelled: <Cancel />,
    };
    return icons[status] || <Timer />;
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'completed',
    };
    return statusFlow[currentStatus];
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Order Management
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select
              value={filterStatus}
              label="Filter Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Orders</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="preparing">Preparing</MenuItem>
              <MenuItem value="ready">Ready</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchOrders}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {notification && (
        <Alert severity={notification.type} sx={{ mb: 2 }}>
          {notification.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {filteredOrders.map((order) => (
          <Grid item xs={12} md={6} lg={4} key={order.id}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Order #{order.id}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(order.status)}
                    label={order.status.toUpperCase()}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Customer: {order.user?.fullName}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Type: {order.ordertype} • Amount: ₹{order.totalprice}
                </Typography>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Time: {new Date(order.createdAt).toLocaleTimeString()}
                </Typography>

                {order.estimatedTime && (
                  <Typography variant="body2" color="primary" gutterBottom>
                    Est. Ready: {order.estimatedTime}
                  </Typography>
                )}

                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Items:
                  </Typography>
                  <List dense>
                    {order.items?.map((item, index) => (
                      <ListItem key={index} sx={{ pl: 0 }}>
                        <ListItemText
                          primary={`${item.quantity}x ${item.menuItem.name}`}
                          secondary={`₹${item.price * item.quantity}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box display="flex" gap={1} mt={2}>
                  {getNextStatus(order.status) && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(getNextStatus(order.status));
                        setStatusUpdateDialog(true);
                      }}
                    >
                      Mark as {getNextStatus(order.status)}
                    </Button>
                  )}
                  
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => {
                      setSelectedOrder(order);
                      setNewStatus(order.status);
                      setStatusUpdateDialog(true);
                    }}
                  >
                    Update
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialog} onClose={() => setStatusUpdateDialog(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                label="Status"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="preparing">Preparing</MenuItem>
                <MenuItem value="ready">Ready</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            {(newStatus === 'preparing' || newStatus === 'confirmed') && (
              <TextField
                fullWidth
                label="Estimated Ready Time"
                type="time"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleStatusUpdate}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
