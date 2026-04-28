import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    BooleanField,
    DateField,
    EditButton,
    DeleteButton,
    Create,
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    BooleanInput,
    SelectInput,
    required,
    useRecordContext,
} from 'react-admin';
import { Chip, Box } from '@mui/material';

const AvailabilityField = () => {
    const record = useRecordContext();
    if (!record) return null;

    return (
        <Chip
            label={record.isAvailable ? 'Available' : 'Unavailable'}
            color={record.isAvailable ? 'success' : 'default'}
            size="small"
        />
    );
};

const ExpressField = () => {
    const record = useRecordContext();
    if (!record) return null;

    return record.isExpress ? (
        <Chip label="⚡ EXPRESS" color="warning" size="small" variant="filled" />
    ) : null;
};

export const MenuList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" label="Item Name" />
            <TextField source="category" />
            <NumberField source="price" options={{ style: 'currency', currency: 'INR' }} />
            <NumberField source="preparationTime" label="Prep Time (min)" />
            <AvailabilityField />
            <ExpressField />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export const MenuEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" validate={required()} />
            <TextInput source="description" multiline />
            <NumberInput source="price" validate={required()} />
            <SelectInput
                source="category"
                choices={[
                    { id: 'Beverages', name: 'Beverages' },
                    { id: 'Snacks', name: 'Snacks' },
                    { id: 'Main Course', name: 'Main Course' },
                    { id: 'Desserts', name: 'Desserts' },
                    { id: 'Breakfast', name: 'Breakfast' },
                ]}
            />
            <NumberInput source="preparationTime" label="Preparation Time (minutes)" />
            <TextInput source="image" label="Image URL" />
            <BooleanInput source="isAvailable" label="Available" />
            <BooleanInput source="isExpress" label="Express Item" />
        </SimpleForm>
    </Edit>
);

export const MenuCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" validate={required()} />
            <TextInput source="description" multiline />
            <NumberInput source="price" validate={required()} />
            <SelectInput
                source="category"
                choices={[
                    { id: 'Beverages', name: 'Beverages' },
                    { id: 'Snacks', name: 'Snacks' },
                    { id: 'Main Course', name: 'Main Course' },
                    { id: 'Desserts', name: 'Desserts' },
                    { id: 'Breakfast', name: 'Breakfast' },
                ]}
                validate={required()}
            />
            <NumberInput source="preparationTime" label="Preparation Time (minutes)" defaultValue={15} />
            <TextInput source="image" label="Image URL" />
            <BooleanInput source="isAvailable" label="Available" defaultValue={true} />
            <BooleanInput source="isExpress" label="Express Item" defaultValue={false} />
        </SimpleForm>
    </Create>
);
