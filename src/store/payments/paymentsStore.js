import { defineStore } from 'pinia';
import api from '@/lib/axios';

export const usePaymentsStore = defineStore('payments', {
    state: () => ({
        payments: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchPayments() {
            this.loading = true;
            try {
                const res = await api.get('/payments', {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
                    },
                });
                this.payments = res.data;
            } catch (err) {
                this.error = err;
            } finally {
                this.loading = false;
            }
        },

        async addPayments(paymentData) {
            try {
                const res = await api.post('/payments', paymentData, {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('authToken'),
                    },
                });
                this.payments.push(res.data);
                return res.data;
            } catch (err) {
                this.error = err;
                throw err;
            }
        },
    },
});