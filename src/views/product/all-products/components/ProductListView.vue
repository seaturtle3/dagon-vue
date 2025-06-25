<script setup>
import { useRouter } from 'vue-router'
import ProductCard from "@/views/product/all-products/components/ProductCard.vue";
import Pagination from "@/components/common-function/Pagination.vue";

defineProps({
  products: Array,
  page: Number,
  totalPages: Number,
})

const emit = defineEmits(['page-change'])
const router = useRouter()

function goToPage(num) {
  emit('page-change', num)
}

function goToProductForm() {
  router.push('/products/form')
}
</script>

<template>
  <div class="container my-4">

    <div class="d-flex justify-content-between align-items-center mb-5">
      <h4 class="m-0">모든 선박 리스트</h4>
      <button
          type="button"
          class="btn btn-secondary"
          style="padding:0.3%"
          @click="goToProductForm">
        배 등록하기
      </button>
    </div>

    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4">
      <div
          v-for="product in products"
          :key="product.prodId"
          class="col"
      >
        <ProductCard :product="product" />
      </div>
    </div>

    <!-- 공통 Pagination 컴포넌트 사용 -->
    <Pagination
        :page="page"
        :total-pages="totalPages"
        @page-change="goToPage"
    />
  </div>
</template>
