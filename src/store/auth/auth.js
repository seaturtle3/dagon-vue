import { defineStore } from 'pinia'

export const useAdminAuthStore = defineStore('adminAuth', {
    state: () => ({
        token: null,
        user: null,
        isAuthenticated: false
    }),
    actions: {
        setToken(token) {
            this.token = token
            this.isAuthenticated = true
        },
        clearToken() {
            this.token = null
            this.isAuthenticated = false
            localStorage.removeItem('token')
        },
        loadTokenFromStorage() {
            const token = localStorage.getItem('token')
            if (token) {
                this.token = token
                this.isAuthenticated = true
            } else {
                this.token = null
                this.isAuthenticated = false
            }
        },
        setUser(user) {
            this.user = user;
        }
    }
})