import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Edit,
  EventSeat,
  AccessTime,
  People,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [tableNumber, setTableNumber] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get('/api/vendor/reservations');
      setReservations(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const updateReservationStatus = async (id, status) => {
    try {
      await axios.put(`/api/vendor/reservations/${id}`, { status });
      setReservations(prev =>
        prev.map(reservation =>
          reservation.id === id ? { ...reservation, status } : reservation
        )
      );
    } catch (error) {
      console.error('Failed to update reservation status:', error);
    }
  };

  const assignTable = async () => {
    try {
      await axios.put(`/api/vendor/reservations/${selectedReservation.id}`, {
        tableNumber: parseInt(tableNumber),
        status: 'confirmed'
      });
      
      setReservations(prev =>
        prev.map(reservation =>
          reservation.id === selectedReservation.id
            ? { ...reservation, tableNumber: parseInt(tableNumber), status: 'confirmed' }
            : reservation
        )
      );
      
      setEditDialog(false);
      setTableNumber('');
      setSelectedReservation(null);
    } catch (error) {
      console.error('Failed to assign table:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'error',
      completed: 'info',
    };
    return colors[status] || 'default';
  };

  const todayReservations = reservations.filter(
    res => format(new Date(res.reservationTime), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  return (
    <Box>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Reservation Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4">{todayReservations.length}</Typography>
                  <Typography color="textSecondary">Today's Reservations</Typography>
                </Box>
                <EventSeat color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4">
                    {todayReservations.filter(r => r.status === 'confirmed').length}
                  </Typography>
                  <Typography color="textSecondary">Confirmed</Typography>
                </Box>
                <CheckCircle color="success" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4">
                    {todayReservations.filter(r => r.status === 'pending').length}
                  </Typography>
                  <Typography color="textSecondary">Pending</Typography>
                </Box>
                <AccessTime color="warning" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4">
                    {reservations.reduce((sum, r) => sum + r.partySize, 0)}
                  </Typography>
                  <Typography color="textSecondary">Total Guests</Typography>
                </Box>
                <People color="info" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reservations List */}
      <Paper elevation={2}>
        <Box p={2}>
          <Typography variant="h6" mb={2}>
            All Reservations
          </Typography>
          <List>
            {reservations.length === 0 ? (
              <ListItem>
                <ListItemText primary="No reservations found." />
              </ListItem>
            ) : (
              reservations.map((reservation) => (
                <ListItem key={reservation.id} divider>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          Reservation #{reservation.id}
                        </Typography>
                        <Chip
                          label={reservation.status.toUpperCase()}
                          color={getStatusColor(reservation.status)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          Customer: {reservation.user?.fullName || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          Date: {format(new Date(reservation.reservationTime), 'PPP')} at{' '}
                          {format(new Date(reservation.reservationTime), 'p')}
                        </Typography>
                        <Typography variant="body2">
                          Party Size: {reservation.partySize} people
                        </Typography>
                        {reservation.tableNumber && (
                          <Typography variant="body2">
                            Table: {reservation.tableNumber}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={1}>
                      {reservation.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setTableNumber(reservation.tableNumber?.toString() || '');
                              setEditDialog(true);
                            }}
                          >
                            Assign Table
                          </Button>
                          <IconButton
                            color="error"
                            onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                      {reservation.status === 'confirmed' && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => updateReservationStatus(reservation.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
        </Box>
      </Paper>

      {/* Assign Table Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Assign Table</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Table Number"
            type="number"
            fullWidth
            variant="outlined"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            helperText="Enter table number to confirm reservation"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={assignTable} disabled={!tableNumber}>
            Assign & Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reservations;
