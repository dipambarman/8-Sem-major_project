import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Fab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Fastfood,
} from '@mui/icons-material';
import { vendorApi } from '../services/api';

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(['Beverages', 'Snacks', 'Main Course', 'Desserts']);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    preparationTime: '',
    isAvailable: true,
    isExpress: false,
    image: '',
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await vendorApi.getMenuItems();
      setMenuItems(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedItem) {
        // Update existing item
        await vendorApi.updateMenuItem(selectedItem.id, formData);
        setMenuItems(prev =>
          prev.map(item =>
            item.id === selectedItem.id ? { ...item, ...formData } : item
          )
        );
      } else {
        // Create new item
        const response = await vendorApi.createMenuItem(formData);
        setMenuItems(prev => [...prev, response.data.data]);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await vendorApi.deleteMenuItem(itemId);
        setMenuItems(prev => prev.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Failed to delete menu item:', error);
      }
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const updatedItem = { ...item, isAvailable: !item.isAvailable };
      await vendorApi.updateMenuItem(item.id, updatedItem);
      setMenuItems(prev =>
        prev.map(menuItem =>
          menuItem.id === item.id ? updatedItem : menuItem
        )
      );
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  const handleOpenDialog = (item = null) => {
    setSelectedItem(item);
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        preparationTime: item.preparationTime.toString(),
        isAvailable: item.isAvailable,
        isExpress: item.isExpress,
        image: item.image || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        preparationTime: '',
        isAvailable: true,
        isExpress: false,
        image: '',
      });
    }
    setEditDialog(true);
  };

  const handleCloseDialog = () => {
    setEditDialog(false);
    setSelectedItem(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Menu Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add New Item
        </Button>
      </Box>

      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card elevation={2}>
              {item.image && (
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image}
                  alt={item.name}
                />
              )}
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                  <Typography variant="h6" component="h2">
                    {item.name}
                  </Typography>
                  <Box display="flex" gap={0.5}>
                    {item.isExpress && (
                      <Chip label="EXPRESS" size="small" color="secondary" />
                    )}
                    <Chip
                      label={item.isAvailable ? 'Available' : 'Unavailable'}
                      size="small"
                      color={item.isAvailable ? 'success' : 'default'}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {item.description}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" color="primary">
                    ₹{item.price}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {item.preparationTime} min
                  </Typography>
                </Box>

                <Chip label={item.category} size="small" variant="outlined" />

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                  <IconButton
                    color={item.isAvailable ? 'success' : 'default'}
                    onClick={() => toggleAvailability(item)}
                  >
                    {item.isAvailable ? <Visibility /> : <VisibilityOff />}
                  </IconButton>

                  <Box>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(item)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={editDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit Menu Item' : 'Add New Menu Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price (₹)"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Preparation Time (minutes)"
                type="number"
                value={formData.preparationTime}
                onChange={(e) => handleInputChange('preparationTime', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAvailable}
                    onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                  />
                }
                label="Available"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isExpress}
                    onChange={(e) => handleInputChange('isExpress', e.target.checked)}
                  />
                }
                label="Express Item"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedItem ? 'Update' : 'Add'} Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuPage;
