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
            localStorage.setItem('token', token)
            console.log('토큰 저장됨:', token)
        },
        clearToken() {
            this.token = null
            this.isAuthenticated = false
            localStorage.removeItem('token')
            console.log('토큰 삭제됨')
        },
        loadTokenFromStorage() {
            const token = localStorage.getItem('token')
            console.log('localStorage에서 토큰 로드:', token)
            if (token) {
                this.token = token
                this.isAuthenticated = true
                console.log('토큰 로드 성공')
            } else {
                this.token = null
                this.isAuthenticated = false
                console.log('저장된 토큰 없음')
            }
        },
        setUser(user) {
            this.user = user;
        },
        isTokenValid() {
            if (!this.token) {
                console.log('토큰이 없습니다.')
                return false
            }
            
            try {
                const payload = JSON.parse(atob(this.token.split('.')[1]))
                const currentTime = Date.now() / 1000
                
                if (payload.exp && payload.exp < currentTime) {
                    console.log('토큰이 만료되었습니다.')
                    this.clearToken()
                    return false
                }
                
                console.log('토큰 유효함, 만료시간:', new Date(payload.exp * 1000))
                return true
            } catch (error) {
                console.error('토큰 디코딩 실패:', error)
                this.clearToken()
                return false
            }
        }
    }
})