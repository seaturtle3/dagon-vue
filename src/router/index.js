// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import InquiryForm from '@/components/inquiry/InquiryForm.vue';
import InquiryList from '@/views/inquiry/InquiryList.vue';

const routes = [
    {
        path: '/inquiry/form',
        name: 'InquiryForm',
        component: InquiryForm
    },
    {
        path: '/inquiry/list',
        name: 'InquiryList',
        component: InquiryList
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
