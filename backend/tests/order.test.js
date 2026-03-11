const request = require('supertest');
const app = require('../app');
const Order = require('../models/Order');

describe('Order API Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/orders', () => {
        it('should create a new order', async () => {
            const orderData = {
                userId: '123',
                items: [{ itemId: '1', quantity: 2, price: 100 }],
                totalPrice: 200,
                status: 'pending'
            };

            const response = await request(app)
                .post('/api/orders')
                .send(orderData)
                .expect(201);

            expect(response.body).toHaveProperty('orderId');
            expect(response.body.status).toBe('pending');
        });

        it('should return 400 for invalid order data', async () => {
            await request(app)
                .post('/api/orders')
                .send({})
                .expect(400);
        });
    });

    describe('GET /api/orders/:id', () => {
        it('should fetch an order by ID', async () => {
            const response = await request(app)
                .get('/api/orders/123')
                .expect(200);

            expect(response.body).toHaveProperty('orderId');
        });

        it('should return 404 for non-existent order', async () => {
            await request(app)
                .get('/api/orders/invalid')
                .expect(404);
        });
    });

    describe('PUT /api/orders/:id', () => {
        it('should update an order status', async () => {
            const response = await request(app)
                .put('/api/orders/123')
                .send({ status: 'completed' })
                .expect(200);

            expect(response.body.status).toBe('completed');
        });
    });

    describe('DELETE /api/orders/:id', () => {
        it('should delete an order', async () => {
            await request(app)
                .delete('/api/orders/123')
                .expect(200);
        });
    });
});