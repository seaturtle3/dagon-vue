import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8095',
    // baseURL: 'http://docs.yi.or.kr:8095/api',
})

export default api