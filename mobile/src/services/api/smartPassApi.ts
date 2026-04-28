import apiClient from './apiClient';

export interface SmartPassStatus {
    id: number;
    userId: number;
    tier: 'SILVER' | 'GOLD' | 'PLATINUM';
    status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    discountPercent: number;
    cardNumber: string;
    activatedAt?: string;
    expiresAt?: string;
    createdAt: string;
}

export interface SmartPassCard {
    cardNumber: string;
    tier: string;
    discountPercent: number;
    expiresAt: string;
    holder: string;
    qrCode: string;
}

export interface SmartPassBenefits {
    [tier: string]: {
        discountPercent: number;
        perks: string[];
    };
}

const smartPassApi = {
    /** Apply for a SmartPass membership */
    join: async (tier: 'SILVER' | 'GOLD' | 'PLATINUM'): Promise<{ success: boolean; data: SmartPassStatus; message: string }> => {
        const response = await apiClient.post('/api/smartpass/join', { tier });
        return response.data;
    },

    /** Get current user's SmartPass status */
    getStatus: async (): Promise<{ success: boolean; data: SmartPassStatus | null; message?: string }> => {
        const response = await apiClient.get('/api/smartpass/status');
        return response.data;
    },

    /** Get virtual card with QR code (only for ACTIVE members) */
    getCard: async (): Promise<{ success: boolean; data: SmartPassCard }> => {
        const response = await apiClient.get('/api/smartpass/card');
        return response.data;
    },

    /** Get all tier benefits (public endpoint) */
    getBenefits: async (): Promise<{ success: boolean; data: SmartPassBenefits }> => {
        const response = await apiClient.get('/api/smartpass/benefits');
        return response.data;
    },
};

export { smartPassApi };
