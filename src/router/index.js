import { createRouter, createWebHistory } from 'vue-router';
import InquiryForm from '@/views/inquiry/InquiryForm.vue';
import Reservation from '@/views/inquiry/ReservationForm.vue';
import Payments from '@/views/Payments/Payments.vue'


const routes = [
    {
        path: '/inquiry/form',
        name: 'InquiryForm',
        component: InquiryForm
    },
    {
        path: '/Payments',
        component: () => import("@/views/payments/Payments.vue")
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
