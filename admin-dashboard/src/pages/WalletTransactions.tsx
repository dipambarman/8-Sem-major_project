import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    useRecordContext,
} from 'react-admin';
import { Chip } from '@mui/material';

const TransactionTypeField = () => {
    const record = useRecordContext();
    if (!record) return null;

    const colorMap: Record<string, 'success' | 'error' | 'info' | 'default'> = {
        credit: 'success',
        debit: 'error',
        refund: 'info',
    };

    return (
        <Chip
            label={record.type?.toUpperCase()}
            color={colorMap[record.type] || 'default'}
            size="small"
            variant="filled"
        />
    );
};

const TransactionStatusField = () => {
    const record = useRecordContext();
    if (!record) return null;

    const colorMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
        completed: 'success',
        pending: 'warning',
        failed: 'error',
    };

    return (
        <Chip
            label={record.status?.toUpperCase()}
            color={colorMap[record.status] || 'default'}
            size="small"
        />
    );
};

export const WalletTransactionList = () => (
    <List sort={{ field: 'createdAt', order: 'DESC' }}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="wallet.user.fullName" label="User" />
            <TransactionTypeField />
            <NumberField source="amount" options={{ style: 'currency', currency: 'INR' }} />
            <TextField source="description" />
            <TextField source="referenceId" label="Reference" />
            <TransactionStatusField />
            <DateField source="createdAt" showTime />
        </Datagrid>
    </List>
);
