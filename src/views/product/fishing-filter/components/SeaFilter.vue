<script setup>
import { ref, computed } from 'vue'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";

const props = defineProps({
  filteredProducts: {
    type: Array,
    required: true
  }
})

const currentPage = ref(1)
const pageSize = 12

const totalPages = computed(() =>
    Math.ceil(props.filteredProducts.length / pageSize)
)

const paginatedProducts = computed(() =>
    props.filteredProducts.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
)

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
</script>

<template>
  <div class="product-grid">
    <div class="product-card" v-for="product in paginatedProducts" :key="product.prodId">
      <img
          :src="`${IMAGE_BASE_URL}/${product.prodThumbnail}`"
           alt="thumbnail" class="thumbnail" />
      <h4>{{ product.prodName }}</h4>
      <p class="address">{{ product.prodAddress }}</p>
    </div>
  </div>

  <div class="pagination">
    <button @click="prevPage" :disabled="currentPage === 1">이전</button>
    <span>{{ currentPage }} / {{ totalPages }}</span>
    <button @click="nextPage" :disabled="currentPage === totalPages">다음</button>
  </div>
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* 넓게, 꽉 차게 */
  gap: 32px; /* 카드 사이 간격 넓힘 */
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 16px;
  background: #fff;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: transform 0.2s;
}
.product-card:hover {
  transform: translateY(-4px);
}

.thumbnail {
  width: 100%;
  height: 180px; /* 조금 더 커진 썸네일 */
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 12px;
}

.address {
  font-size: 0.9rem;
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
}

button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #f8f8f8;
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
