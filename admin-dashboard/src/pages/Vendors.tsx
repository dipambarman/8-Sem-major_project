import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  EditButton,
  DeleteButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  required,
  email,
  useRecordContext,
} from 'react-admin';
import { Chip, Avatar } from '@mui/material';

const VendorStatusField = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Chip
      label={record.isActive ? 'Active' : 'Inactive'}
      color={record.isActive ? 'success' : 'default'}
      size="small"
      variant="filled"
    />
  );
};

const VendorList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" label="Vendor Name" />
      <EmailField source="email" />
      <TextField source="phone" />
      <TextField source="address" />
      <VendorStatusField />
      <DateField source="createdAt" label="Registered" showTime />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const VendorEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" disabled />
      <TextInput source="name" validate={required()} />
      <TextInput source="email" validate={[required(), email()]} />
      <TextInput source="phone" validate={required()} />
      <TextInput source="address" multiline />
      <BooleanInput source="isActive" label="Active" />
    </SimpleForm>
  </Edit>
);

export const VendorCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" validate={required()} />
      <TextInput source="email" validate={[required(), email()]} />
      <TextInput source="phone" validate={required()} />
      <TextInput source="password" type="password" validate={required()} />
      <TextInput source="address" multiline />
      <BooleanInput source="isActive" label="Active" defaultValue={true} />
    </SimpleForm>
  </Create>
);

export default VendorList;
