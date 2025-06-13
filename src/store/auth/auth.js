import { defineStore } from 'pinia'

export const useAdminAuthStore = defineStore('adminAuth', {
    state: () => ({
        token: null,
        user: null
    }),
    actions: {
        setToken(token) {
            this.token = token
        },
        clearToken() {
            this.token = null
        },
        loadTokenFromStorage() {
            const token = localStorage.getItem('token')
            if (token) {
                this.token = token
            }
        }
    }
})