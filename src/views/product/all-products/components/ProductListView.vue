<script setup>
import ProductCard from "@/views/product/all-products/components/ProductCard.vue";
import Pagination from "@/components/common-function/Pagination.vue";

defineProps({
  products: Array,
  page: Number,
  totalPages: Number,
})

const emit = defineEmits(['page-change'])

function goToPage(num) {
  emit('page-change', num)
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
      >
        <ProductCard :product="product"/>
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
