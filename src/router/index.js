import { createRouter, createWebHistory } from 'vue-router';
import InquiryForm from '@/views/inquiry/InquiryForm.vue';
import Payments from '@/views/Payments/PaymentsForm.vue';
import ReservationForm from "@/views/reservation/ReservationForm.vue";


const routes = [
    {
        path: '/inquiry/form',
        name: 'InquiryForm',
        component: InquiryForm
    },
    {
        path: '/payments/from',
        name: 'PaymentsForm',
        component: () => import("@/views/payments/Payments.vue")
    },
    {
        path: '/reservation/form',
        name: 'ReservationForm',
        component: ReservationForm
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
