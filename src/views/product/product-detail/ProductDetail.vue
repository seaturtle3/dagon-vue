<script setup>
import {computed, onMounted, onUnmounted} from 'vue'
import {useRoute} from 'vue-router'
import {useProductDetailStore} from '@/store/product/product-detail/productDetailStore.js'
import ProductInfo from '@/views/product/product-detail/components/ProductInfo.vue'
import FishingCenter from "@/views/community/fishing-center/FishingCenter.vue";

const route = useRoute()
const productId = route.params.id
const store = useProductDetailStore()
const product = computed(() => store.product)

onMounted(() => {
  store.fetchProductDetail(productId)
  console.log('ProductDetail prodId: ', productId)
})

onUnmounted(() => {
  store.clearProduct()
})
</script>

<template>
  <div class="center">
    <ProductInfo v-if="product" :product="product"/>

    <div class="main">
      <!-- 상위 버튼 -->
      <div class="top-nav">
        <button class="nav-btn">조황센터</button>
        <button class="nav-btn">결제하기</button>
      </div>

      <!-- 하위 버튼 (조황센터 하위) -->
      <div class="sub-nav">
        <button class="sub-btn">전체</button>
        <button class="sub-btn">조황정보</button>
        <button class="sub-btn">조행기</button>
      </div>
    </div>
  </div>
  <FishingCenter/>


</template>

<style scoped>
.center {
  width: 80%;
  margin: 4% auto;
}

.main{
  width: 100%;
  margin: 5% 0%;
}

/* 상위 버튼 */
.top-nav {
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.nav-btn {
  flex: 1;
  padding: 12px;
  font-size: 1.1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* 하위 버튼 */
.sub-nav {
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.sub-btn {
  flex: 1;
  padding: 10px;
  font-size: 1rem;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
}
</style>
