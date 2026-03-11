const express = require('express');

const router = express.Router();

// Sample menu data
let menuItems = [
    { id: 1, name: 'Pizza', price: 8.99 },
    { id: 2, name: 'Burger', price: 5.99 },
    { id: 3, name: 'Pasta', price: 7.99 }
];

// Get all menu items
router.get('/', (req, res) => {
    res.json(menuItems);
});

// Get a single menu item by ID
router.get('/:id', (req, res) => {
    const item = menuItems.find(i => i.id === parseInt(req.params.id));
    if (!item) return res.status(404).send('Menu item not found.');
    res.json(item);
});

// Add a new menu item
router.post('/', (req, res) => {
    const newItem = {
        id: menuItems.length + 1,
        name: req.body.name,
        price: req.body.price
    };
    menuItems.push(newItem);
    res.status(201).json(newItem);
});

// Export the router
module.exports = router;