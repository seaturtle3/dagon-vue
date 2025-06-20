import api from '@/lib/axios'; // 또는 설정된 axios 인스턴스 사용

export const getCurrentUser = () => {
    return api.get('/api/users/me');
};