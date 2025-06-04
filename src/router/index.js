import { createRouter, createWebHistory } from 'vue-router';
import InquiryForm from '@/views/inquiries/Inquiry.vue';
// import Payments from '@/views/Payments/Payment.vue';
import Reservation from "@/views/reservation/ReservationForm.vue";
import Home from "@/views/home/Home.vue";
import FishingCenter from "@/views/fishing-center/FishingCenter.vue";
import SeaFishing from "@/views/sea-fishing/SeaFishing.vue";
import FreshwaterFishing from "@/views/freshwater-fishing/FreshwaterFishing.vue";
import CustomerService from "@/views/support/customer-service/CustomerService.vue";
import Product from "@/views/product/Product.vue";


const routes = [
    { path: '/', component: Home },
    { path: '/fishing-center', component: FishingCenter },
    { path: '/sea-fishing', component: SeaFishing },
    { path: '/freshwater-fishing', component: FreshwaterFishing },
    { path: '/customer-service', component: CustomerService },
    { path: '/products', component: Product },
    { path: '/payments', component: Payment },
    { path: '/inquiries', component: Inquiry },
    { path: '/reservation', component: ReservationForm },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
