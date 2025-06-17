<template>
  <div class="product-detail">
    <div class="product-info">
      <h1>{{ product.name }}</h1>
      <p>{{ product.description }}</p>
      <div class="button-group">
        <button @click="goToReservation" class="btn btn-primary">결제하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productAPI } from '@/api/product.js'

const route = useRoute()
const router = useRouter()
const product = ref(null)
const loading = ref(true)
const error = ref(null)

const fetchProductDetail = async () => {
  try {
    const response = await productAPI.getProductDetail(route.params.id)
    product.value = response.data
  } catch (err) {
    error.value = '상품 정보를 불러오는데 실패했습니다.'
    console.error('상품 상세 정보 요청 실패:', err)
  } finally {
    loading.value = false
  }
}

const goToReservation = () => {
  router.push({
    name: 'ReservationForm',
    params: { id: route.params.id },
    state: { product: product.value }
  })
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.product-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button-group {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #2c3e70;
  color: white;
}

.btn-primary:hover {
  background-color: #1a237e;
  transform: translateY(-2px);
}
</style> 