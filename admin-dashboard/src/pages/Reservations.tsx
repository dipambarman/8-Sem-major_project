import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    EditButton,
    Edit,
    SimpleForm,
    SelectInput,
    TextInput,
    useRecordContext,
} from 'react-admin';
import { Chip } from '@mui/material';

const ReservationStatusField = () => {
    const record = useRecordContext();
    if (!record) return null;

    const colorMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
        active: 'success',
        confirmed: 'success',
        pending: 'warning',
        cancelled: 'error',
        completed: 'info',
    };

    return (
        <Chip
            label={record.status?.toUpperCase()}
            color={colorMap[record.status] || 'default'}
            size="small"
            variant="filled"
        />
    );
};

export const ReservationList = () => (
    <List sort={{ field: 'reservationTime', order: 'DESC' }}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="user.fullName" label="Customer" />
            <TextField source="vendor.name" label="Vendor" />
            <DateField source="reservationTime" label="Date & Time" showTime />
            <NumberField source="partySize" label="Guests" />
            <TextField source="tableNumber" label="Table" />
            <ReservationStatusField />
            <EditButton />
        </Datagrid>
    </List>
);

export const ReservationEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="user.fullName" label="Customer" disabled />
            <SelectInput
                source="status"
                choices={[
                    { id: 'active', name: 'Active' },
                    { id: 'completed', name: 'Completed' },
                    { id: 'cancelled', name: 'Cancelled' },
                ]}
            />
            <TextInput source="tableNumber" label="Table Number" />
            <TextInput source="specialRequests" label="Special Requests" multiline disabled />
        </SimpleForm>
    </Edit>
);
