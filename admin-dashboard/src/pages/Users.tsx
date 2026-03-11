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
  DateInput,
  required,
  email,
  Toolbar,
  SaveButton,
  useRecordContext,
} from 'react-admin';
import { Chip, Avatar } from '@mui/material';

const UserTypeField = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Chip
      label={record.userType}
      color={record.userType === 'premium' ? 'primary' : 'default'}
      variant={record.userType === 'premium' ? 'filled' : 'outlined'}
      size="small"
    />
  );
};

const UserAvatar = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Avatar sx={{ width: 32, height: 32 }}>
      {record.fullName?.charAt(0).toUpperCase()}
    </Avatar>
  );
};

export const UserList = () => (
  <List>
    <Datagrid rowClick="edit">
      <UserAvatar />
      <TextField source="id" />
      <TextField source="fullName" label="Full Name" />
      <EmailField source="email" />
      <TextField source="phone" label="Phone" />
      <UserTypeField />
      <DateField source="createdAt" label="Registered" showTime />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

const UserEditToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);

export const UserEdit = () => (
  <Edit>
    <SimpleForm toolbar={<UserEditToolbar />}>
      <TextInput source="id" disabled />
      <TextInput source="fullName" validate={required()} />
      <TextInput source="email" validate={[required(), email()]} />
      <TextInput source="phone" validate={required()} />
      <SelectInput
        source="userType"
        choices={[
          { id: 'regular', name: 'Regular' },
          { id: 'premium', name: 'Premium' },
        ]}
      />
    </SimpleForm>
  </Edit>
);

export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="fullName" validate={required()} />
      <TextInput source="email" validate={[required(), email()]} />
      <TextInput source="phone" validate={required()} />
      <TextInput source="password" type="password" validate={required()} />
      <SelectInput
        source="userType"
        choices={[
          { id: 'regular', name: 'Regular' },
          { id: 'premium', name: 'Premium' },
        ]}
        defaultValue="regular"
      />
    </SimpleForm>
  </Create>
);
