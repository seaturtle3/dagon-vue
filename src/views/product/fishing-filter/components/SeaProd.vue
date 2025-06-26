<script setup>
import {ref, computed} from 'vue'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";
import {useRouter} from 'vue-router'
import Pagination from "@/components/common-function/Pagination.vue";

const props = defineProps({
  seaProducts: {
    type: Array,
    required: true
  }
})

const router = useRouter()
const currentPage = ref(1)
const pageSize = 12

const totalPages = computed(() =>
    Math.ceil(props.seaProducts.length / pageSize)
)

const paginatedProducts = computed(() =>
    props.seaProducts.slice(
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
        style="cursor: pointer"
    >

      <!-- 썸네일 -->
      <div class="thumbnail-wrapper">
        <img
            :src="`${IMAGE_BASE_URL}/${product.prodThumbnail}`"
            alt="thumbnail"
            class="thumbnail"
        />
      </div>

      <!-- 본문 -->
      <div class="content">
        <p class="prod-name mb-2 fs-5">{{ product.prodName }}</p>
        <p class="address">위치 : {{ product.prodAddress }}</p>
      </div>

    </div>
  </div>

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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); /* ✅ 반응형 열 */
  gap: 32px;
  place-items: center; /* ✅ 아이템들을 가운데 정렬 */
}

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 900px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  max-width: 320px;  /* ✅ 고정된 카드 폭 */
  margin: 0 auto;    /* ✅ 가운데 정렬 */
}

/* .prod-name {
  font-weight: bold;
  font-size: 1.1rem;
  background-color: cornflowerblue;
  color: #ffffff;
  padding: 12px 16px 8px 16px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  cursor:pointer;
} */

.prod-name {
  display: block;       /* ✅ 줄바꿈 방지 */
  overflow: hidden;
  text-overflow: ellipsis; /* ✅ 말줄임 표시 */
  white-space: nowrap;  /* ✅ 한 줄로 고정 */
}

.thumbnail-wrapper {
  position: relative;
}

.thumbnail {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 0 0 10px 10px;
  display: block;
}

.content {
  padding: 16px 16px 0 16px;
}

.address {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5%;
}

button {
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  border: 2px solid #007bff;
  background: #ffffff;
  color: #007bff;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #e6f0ff;
}
</style>
