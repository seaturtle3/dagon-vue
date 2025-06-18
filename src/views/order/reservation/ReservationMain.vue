<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProductDetailStore } from '@/store/product/product-detail/useProductDetailStore.js';
import ReservationForm from '@/views/order/reservation/components/ReservationForm.vue';
import ReservationConfirm from '@/views/order/reservation/components/ReservationConfirm.vue';

const route = useRoute();
const store = useProductDetailStore();
const prodId = route.params.prodId;

onMounted(async () => {
  await store.fetchProductDetail(prodId);
});
</script>

<template>
  <div>
    <ReservationForm :product="store.product" />
    <ReservationConfirm />
  </div>
</template>

<style scoped>
div {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>