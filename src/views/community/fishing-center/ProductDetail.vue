<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFishingCenterStore } from '@/store/fishing-center/fishingCenterStore.js'

const route = useRoute()
const router = useRouter()
const store = useFishingCenterStore()
const productId = route.params.id

const product = ref(null)

watch(
    () => store.products,
    (products) => {
      if (products.length > 0) {
        product.value = products.find(p => String(p.prodId) === productId)
        console.log('found product:', product.value)
      }
    },
    { immediate: true }
)

onMounted(() => {
  if (store.products.length === 0) {
    store.fetchProducts()
  }
})

function goBack() {
  router.push('/fishing-center')
}
</script>

<template>
  <div class="detail">
    <div v-if="product">
      <h1 style="margin-bottom: 5%">{{ product.prodName }}</h1>
      <img
          :src="`/uploads/${product.prodThumbnail}`"
          class="card-img-top"
          alt="썸네일"
          style="width: 100%; height: auto; object-fit: cover; border-radius: 8px;"
      />
      <p>지역: {{ product.prodRegion }}</p>
      <p>등록일: {{ product.createdAt }}</p>
    </div>
    <div v-else>
      <p>상품 정보를 불러오는 중입니다...</p>
    </div>
  </div>
</template>

<style scoped>
.detail {
  width: 80%;
  margin: 5% auto;
  max-width: 800px;
}
</style>

