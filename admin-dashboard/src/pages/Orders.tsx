import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  EditButton,
  ShowButton,
  Edit,
  Show,
  SimpleForm,
  SelectInput,
  SimpleShowLayout,
  ArrayField,
  SingleFieldList,
  ChipField,
  useRecordContext,
} from 'react-admin';
import { Chip, Box } from '@mui/material';

const OrderStatusField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const getStatusColor = (status: string) => {
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

  return (
    <Chip
      label={record.status}
      color={getStatusColor(record.status)}
      size="small"
      variant="filled"
    />
  );
};

const OrderTypeField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const getTypeIcon = (type: string) => {
    const icons = {
      delivery: '🚴',
      pickup: '🛍️',
      dine_in: '🍽️',
    };
    return icons[type] || '📦';
  };

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <span>{getTypeIcon(record.orderType)}</span>
      <span>{record.orderType?.replace('_', ' ')}</span>
    </Box>
  );
};

export const OrderList = () => (
  <List sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="user.fullName" label="Customer" />
      <TextField source="vendor.name" label="Vendor" />
      <OrderTypeField />
      <NumberField source="totalAmount" options={{ style: 'currency', currency: 'INR' }} />
      <OrderStatusField />
      <DateField source="createdAt" showTime />
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
);

export const OrderShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="user.fullName" label="Customer" />
      <TextField source="user.email" label="Customer Email" />
      <TextField source="vendor.name" label="Vendor" />
      <OrderTypeField />
      <OrderStatusField />
      <NumberField source="totalAmount" options={{ style: 'currency', currency: 'INR' }} />
      <TextField source="paymentMethod" />
      <DateField source="slotTime" showTime />
      <TextField source="specialInstructions" />
      
      <ArrayField source="items">
        <Datagrid>
          <TextField source="menuItem.name" label="Item" />
          <NumberField source="quantity" />
          <NumberField source="price" options={{ style: 'currency', currency: 'INR' }} />
          <NumberField 
            source="total" 
            options={{ style: 'currency', currency: 'INR' }}
            render={({ record }) => record.price * record.quantity}
          />
        </Datagrid>
      </ArrayField>
      
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);

export const OrderEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" disabled />
      <SelectInput
        source="status"
        choices={[
          { id: 'pending', name: 'Pending' },
          { id: 'confirmed', name: 'Confirmed' },
          { id: 'preparing', name: 'Preparing' },
          { id: 'ready', name: 'Ready' },
          { id: 'completed', name: 'Completed' },
          { id: 'cancelled', name: 'Cancelled' },
        ]}
      />
      <TextInput source="specialInstructions" multiline />
    </SimpleForm>
  </Edit>
);
