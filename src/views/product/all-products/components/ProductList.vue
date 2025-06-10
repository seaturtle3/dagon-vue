<script setup>
import { IMAGE_BASE_URL } from "@/constants/imageBaseUrl.js"

defineProps({
  products: Array,
  page: Number,
  totalPages: Number,
})

const emit = defineEmits(['page-change'])

function goToPage(num) {
  emit('page-change', num)
}

function onClick(product) {
  const url = `products/product-detail/${product.prodId}`
  window.open(url, '_blank')
}

</script>

<template>
  <div class="container my-4">

    <div class="mb-5">
      <h2>모든 배 리스트</h2>
    </div>

    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4">
      <div
          v-for="product in products"
          :key="product.prodId"
          class="col"
          @click="onClick(product)"
      >
        <div class="card h-100">
          <img
              :src="`${IMAGE_BASE_URL}/${product.prodThumbnail}`"
              class="card-img-top"
              alt="썸네일"
              style="height: 150px; object-fit: cover;"
          />
          <div class="card-body">
            <h6 class="card-title">{{ product.prodName }}</h6>
            <p class="card-text text-muted" style="font-size: 0.8rem">
              {{ product.prodRegion }}
            </p>
            <small class="text-muted">{{ new Date(product.createdAt).toLocaleDateString() }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이지 버튼 -->
    <div class="d-flex justify-content-center mt-4">
      <button
          class="btn btn-outline-secondary mx-1"
          :disabled="page === 0"
          @click="goToPage(page - 1)"
      >
        이전
      </button>

      <button
          v-for="pageNum in totalPages"
          :key="pageNum"
          class="btn mx-1"
          :class="page === (pageNum - 1) ? 'btn-primary' : 'btn-outline-primary'"
          @click="goToPage(pageNum - 1)"
      >
        {{ pageNum }}
      </button>

      <button
          class="btn btn-outline-secondary mx-1"
          :disabled="page >= totalPages - 1"
          @click="goToPage(page + 1)"
      >
        다음
      </button>
    </div>

  </div>
</template>
