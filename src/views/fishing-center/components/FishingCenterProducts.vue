<script setup>
import { useFishingCenterProducts } from '@/store/fishing-center/fishingCenterProducts'
import { onMounted } from 'vue'

const store = useFishingCenterProducts()

onMounted(() => {
  store.fetchProducts()
})

function selectProduct(product) {
  // 예: 상세 페이지 이동
  console.log('선택된 상품:', product)
}
</script>

<template>
  <div class="row row-cols-1 row-cols-md-5 g-3">
    <div
        v-for="product in store.products"
        :key="product.prodId"
        class="col"
        @click="selectProduct(product)"
    >
      <div class="card h-100" style="cursor: pointer;">
        <img
            :src="`http://localhost:8095/uploads/${product.prodThumbnail}`"
            class="card-img-top"
            alt="썸네일"
            style="height: 120px; object-fit: cover;"
        />
        <div class="card-body p-2">
          <h6 class="card-title mb-1">{{ product.prodName }}</h6>
          <p class="card-text text-muted" style="font-size: 0.8rem;">
            {{ product.prodRegion }}
          </p>
        </div>
        <div class="card-body p-2">
          <h6 class="card-title mb-1">{{ product.createdAt }}</h6>
        </div>
      </div>
    </div>
  </div>
</template>
