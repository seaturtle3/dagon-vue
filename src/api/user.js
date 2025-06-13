import axios from '@/lib/axios'; // 또는 설정된 axios 인스턴스 사용

export const getCurrentUser = () => {
    return axios.get('/api/users/me');
};