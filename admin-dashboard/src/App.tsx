import React from 'react';
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';

// Providers
import { dataProvider } from './providers/dataProvider';
import { authProvider } from './providers/authProvider';

// Components
import Dashboard from './pages/Dashboard';
import { UserList, UserEdit, UserCreate } from './pages/Users';
import { OrderList, OrderEdit, OrderShow } from './pages/Orders';
import VendorList, { VendorEdit, VendorCreate } from './pages/Vendors';
import { MenuList, MenuEdit, MenuCreate } from './pages/Menu';
import { WalletTransactionList } from './pages/WalletTransactions';
import { ReservationList, ReservationEdit } from './pages/Reservations';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Icons
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AnalyticsIcon from '@mui/icons-material/Analytics';

// Custom theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF',
    },
    secondary: {
      main: '#FF6B35',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    dashboard={Dashboard}
    theme={theme}
    title="Smart Canteen Admin"
    disableTelemetry
  >
    {/* User Management */}
    <Resource
      name="users"
      list={UserList}
      edit={UserEdit}
      create={UserCreate}
      icon={PeopleIcon}
      options={{ label: 'Users' }}
    />

    {/* Order Management */}
    <Resource
      name="orders"
      list={OrderList}
      edit={OrderEdit}
      show={OrderShow}
      icon={ShoppingCartIcon}
      options={{ label: 'Orders' }}
    />

    {/* Vendor Management */}
    <Resource
      name="vendors"
      list={VendorList}
      edit={VendorEdit}
      create={VendorCreate}
      icon={StoreIcon}
      options={{ label: 'Vendors' }}
    />

    {/* Menu Management */}
    <Resource
      name="menu"
      list={MenuList}
      edit={MenuEdit}
      create={MenuCreate}
      icon={MenuBookIcon}
      options={{ label: 'Menu Items' }}
    />

    {/* Wallet Transactions */}
    <Resource
      name="transactions"
      list={WalletTransactionList}
      icon={AccountBalanceWalletIcon}
      options={{ label: 'Wallet Transactions' }}
    />

    {/* Reservations */}
    <Resource
      name="reservations"
      list={ReservationList}
      edit={ReservationEdit}
      icon={EventSeatIcon}
      options={{ label: 'Reservations' }}
    />

    {/* Custom Routes */}
    <CustomRoutes>
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
    </CustomRoutes>
  </Admin>
);

export default App;
