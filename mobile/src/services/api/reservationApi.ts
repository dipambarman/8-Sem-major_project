import apiClient from './apiClient';

export interface Reservation {
    id: string;
    userId: string;
    vendorId: string;
    reservationTime: string;
    partySize: number;
    status: 'active' | 'completed' | 'cancelled';
    tableNumber?: number;
    diningArea?: string;
    specialRequests?: string;
    createdAt: string;
}

export interface AvailabilitySlot {
    time: string;
    available: boolean;
    tablesRemaining: number;
}

const reservationApi = {
    /** Check table availability for a vendor */
    checkAvailability: async (vendorId: string, date?: string): Promise<{ success: boolean; data: any }> => {
        const query = date ? `?date=${date}` : '';
        const response = await apiClient.get(`/api/reservations/availability/${vendorId}${query}`);
        return response.data;
    },

    /** Create a new reservation */
    create: async (data: {
        vendorId: number;
        reservationTime: string;
        partySize: number;
        diningArea: string;
        specialRequests?: string;
    }): Promise<{ success: boolean; data: Reservation; message: string }> => {
        const response = await apiClient.post('/api/reservations', data);
        return response.data;
    },

    /** Get all reservations for the current user */
    getMyReservations: async (): Promise<{ success: boolean; data: Reservation[] }> => {
        const response = await apiClient.get('/api/reservations/my-reservations');
        return response.data;
    },

    /** Cancel a reservation */
    cancel: async (reservationId: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.put(`/api/reservations/${reservationId}/cancel`);
        return response.data;
    },
};

export { reservationApi };
