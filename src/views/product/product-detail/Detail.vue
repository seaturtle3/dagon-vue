// ProductDetailContainer.vue (예시)
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFishingCenterStore } from '@/store/fishing-center/fishingCenterStore.js'
import ProductInfo from '@/views/product/product-detail/components/ProductInfo.vue'

const route = useRoute()
const store = useFishingCenterStore()
const productId = route.params.id

const product = ref(null)

watch(
    () => store.products,
    (products) => {
      if (products.length > 0) {
        product.value = products.find(p => String(p.prodId) === productId)
      }
    },
    { immediate: true }
)
</script>

<template>
  <div class="center">
    <ProductInfo :product="product"/>
  </div>
</template>

<style scoped>
.center {
  width: 80%;
  margin: 5% auto;
  max-width: 800px;
}
</style>
