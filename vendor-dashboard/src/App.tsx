import React, { useState, useEffect } from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Pages
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import MenuPage from './pages/Menu';
import Reservations from './pages/Reservations';
import Analytics from './pages/Analytics';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Socket.IO
import io from 'socket.io-client';

const drawerWidth = 240;

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
    },
    secondary: {
      main: '#FF6B35',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
  { text: 'Menu', icon: <RestaurantMenuIcon />, path: '/menu' },
  { text: 'Reservations', icon: <EventSeatIcon />, path: '/reservations' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
];

const VendorApp = () => {
  const [socket, setSocket] = useState(null);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: localStorage.getItem('vendorToken'),
        type: 'vendor'
      }
    });

    newSocket.on('newOrder', (order) => {
      setNewOrdersCount(prev => prev + 1);
      // Show notification
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem?.text || 'Smart Canteen Vendor';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getCurrentPageTitle()}
          </Typography>
          
          <Avatar
            sx={{ cursor: 'pointer' }}
            onClick={handleProfileMenuOpen}
          >
            <AccountCircleIcon />
          </Avatar>
          
          <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>
                    {item.text === 'Orders' ? (
                      <Badge badgeContent={newOrdersCount} color="error">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<Dashboard socket={socket} />} />
          <Route path="/orders" element={<Orders socket={socket} />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Box>
    </Box>
  );
};

const App = () => (
  <ThemeProvider theme={theme}>
    <Router>
      <VendorApp />
    </Router>
  </ThemeProvider>
);

export default App;
