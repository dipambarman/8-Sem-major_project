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
  const [categories, setCategories] = useState(['Breakfast', 'Snacks', 'Main Course', 'Desserts', 'Beverages']);
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
      // Convert display category to database format
      const categoryMap = {
        'Breakfast': 'BREAKFAST',
        'Snacks': 'SNACKS',
        'Main Course': 'MAIN_COURSE',
        'Desserts': 'DESSERTS',
        'Beverages': 'BEVERAGES',
      };
      
      const dataToSave = {
        ...formData,
        category: categoryMap[formData.category] || formData.category,
      };

      if (selectedItem) {
        // Update existing item
        await vendorApi.updateMenuItem(selectedItem.id, dataToSave);
        setMenuItems(prev =>
          prev.map(item =>
            item.id === selectedItem.id ? { ...item, ...dataToSave } : item
          )
        );
      } else {
        // Create new item
        const response = await vendorApi.createMenuItem(dataToSave);
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
    // Convert database categories to display format
    const displayCategoryMap = {
      'BREAKFAST': 'Breakfast',
      'SNACKS': 'Snacks',
      'MAIN_COURSE': 'Main Course',
      'DESSERTS': 'Desserts',
      'BEVERAGES': 'Beverages',
    };

    setSelectedItem(item);
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: displayCategoryMap[item.category] || item.category,
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
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section - Responsive Layout */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          Menu Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ 
            alignSelf: { xs: 'stretch', sm: 'auto' },
            minWidth: { xs: '100%', sm: 'auto' }
          }}
        >
          Add New Item
        </Button>
      </Box>

      {/* Menu Items Grid - Fully Responsive */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {item.image && (
                <CardMedia
                  component="img"
                  height={{ xs: '150', sm: '200' }}
                  image={item.image}
                  alt={item.name}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Title and Status Row */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1} gap={1}>
                  <Typography 
                    variant="h6" 
                    component="h2"
                    sx={{ 
                      flex: 1,
                      fontSize: { xs: '0.95rem', sm: '1.25rem' },
                      wordBreak: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Box display="flex" gap={0.5} flexDirection={{ xs: 'column', sm: 'row' }} flexShrink={0}>
                    {item.isExpress && (
                      <Chip label="EXPRESS" size="small" color="secondary" sx={{ fontSize: '0.7rem' }} />
                    )}
                    <Chip
                      label={item.isAvailable ? 'Available' : 'Unavailable'}
                      size="small"
                      color={item.isAvailable ? 'success' : 'default'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>

                {/* Description */}
                <Typography 
                  variant="body2" 
                  color="textSecondary" 
                  gutterBottom
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '2.5rem',
                  }}
                >
                  {item.description}
                </Typography>

                {/* Price and Prep Time */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" color="primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    ₹{item.price}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {item.preparationTime} min
                  </Typography>
                </Box>

                {/* Category Chip */}
                <Chip 
                  label={{
                    'BREAKFAST': 'Breakfast',
                    'SNACKS': 'Snacks',
                    'MAIN_COURSE': 'Main Course',
                    'DESSERTS': 'Desserts',
                    'BEVERAGES': 'Beverages',
                  }[item.category] || item.category}
                  size="small" 
                  variant="outlined"
                  sx={{ mb: 2, alignSelf: 'flex-start' }}
                />

                {/* Action Buttons */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
                  <IconButton
                    color={item.isAvailable ? 'success' : 'default'}
                    onClick={() => toggleAvailability(item)}
                    size="small"
                  >
                    {item.isAvailable ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                  </IconButton>

                  <Box display="flex">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(item)}
                      size="small"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(item.id)}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog - Responsive */}
      <Dialog 
        open={editDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {selectedItem ? 'Edit Menu Item' : 'Add New Menu Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
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
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (₹)"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preparation Time (min)"
                type="number"
                value={formData.preparationTime}
                onChange={(e) => handleInputChange('preparationTime', e.target.value)}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAvailable}
                    onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                    size="small"
                  />
                }
                label="Available"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isExpress}
                    onChange={(e) => handleInputChange('isExpress', e.target.checked)}
                    size="small"
                  />
                }
                label="Express Item"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Button onClick={handleCloseDialog} size="small">Cancel</Button>
          <Button variant="contained" onClick={handleSave} size="small">
            {selectedItem ? 'Update' : 'Add'} Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuPage;
