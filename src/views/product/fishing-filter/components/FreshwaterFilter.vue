<script setup>
import {ref, computed} from 'vue'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";
import { useRouter } from 'vue-router'
import Pagination from "@/components/common-function/Pagination.vue";

const props = defineProps({
  filteredProducts: {
    type: Array,
    required: true
  }
})

const router = useRouter()
const currentPage = ref(1)
const pageSize = 12

const totalPages = computed(() =>
    Math.ceil(props.filteredProducts.length / pageSize)
)

const paginatedProducts = computed(() =>
    props.filteredProducts.slice(
        (currentPage.value - 1) * pageSize,
        currentPage.value * pageSize
    )
)

function openDetail(product) {
  router.push(`/products/${product.prodId}`)
}

function onPageChange(newPage) {
  currentPage.value = newPage
}
</script>

<template>
  <div class="product-grid">
    <div
        class="product-card"
        v-for="product in paginatedProducts"
        :key="product.prodId"
        @click="openDetail(product)"
    >
      <img :src="`${IMAGE_BASE_URL}/${product.prodThumbnail}`"
           alt="thumbnail" class="thumbnail"/>

      <div>
        <h5>{{ product.prodId }}</h5>
        <h4>{{ product.prodName }}</h4>
        <p class="address">{{ product.prodAddress }}</p>
      </div>
    </div>
  </div>

  <!-- 공통 Pagination 컴포넌트 사용 -->
  <Pagination
      :page="currentPage"
      :total-pages="totalPages"
      :zero-based="false"
      @page-change="onPageChange"
  />
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
  cursor: pointer;
}

.product-card > div {
  padding-left: 5%;
}

.product-card:hover {
  transform: translateY(-4px);
}

.thumbnail {
  width: 100%;
  height: 180px; /* 조금 더 커진 썸네일 */
  object-fit: cover;
  border-radius: 10px 10px 0 0;
  margin-bottom: 12px;
}

.address {
  font-size: 0.9rem;
  color: #666;
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
