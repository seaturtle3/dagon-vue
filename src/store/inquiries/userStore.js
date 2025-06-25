import { defineStore } from 'pinia';
import { getCurrentUser } from '@/api/user';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        loading: false,
        error: null
    }),
    actions: {
        async fetchUser() {
            this.loading = true;
            try {
                const response = await getCurrentUser();
                this.user = response.data;
            } catch (err) {
                this.error = err;
                console.error('유저 정보 불러오기 실패:', err);
            } finally {
                this.loading = false;
            }
        }
    },
    getters: {
        isLoggedIn: (state) => !!state.user,
        role: (state) => state.user?.role || '',
        nickname: (state) => state.user?.nickname || '',
        uid: (state) => state.user?.uid || '',
        uno: (state) => state.user?.uno || ''
    }
});