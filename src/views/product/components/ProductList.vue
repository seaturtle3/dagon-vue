<script setup>
defineProps(['products'])

import { useProductStore } from '@/store/product/productStore.js'

const productStore = useProductStore()

</script>

<template>
  <div class="container mt-5">
    <h2>등록된 배 리스트</h2>

    <table class="table table-striped table-hover">
      <thead>
      <tr>
        <th>이름</th>
        <th>지역</th>
        <th>주 유형</th>
        <th>서브 유형</th>
        <th>최대 인원</th>
        <th>최소 인원</th>
        <th>배 무게</th>
        <th>배 주소</th>
        <th>배 설명</th>
        <th>이벤트</th>
        <th>공지사항</th>
        <th>등록일</th>
        <th>예약</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="product in products" :key="product.prodId">
        <td>{{ product.prodName }}</td>
        <td>{{ product.prodRegion }}</td>
        <td>{{ product.mainType }}</td>
        <td>{{ product.subType }}</td>
        <td>{{ product.maxPerson }}</td>
        <td>{{ product.minPerson }}</td>
        <td>{{ product.weight }}</td>
        <td>{{ product.prodAddress }}</td>
        <td>{{ product.prodDescription }}</td>
        <td>{{ product.prodEvent }}</td>
        <td>{{ product.prodNotice }}</td>
        <td>{{ product.createdAt }}</td>
        <td><button class="btn btn-sm btn-primary">예약</button></td>
      </tr>
      </tbody>
    </table>

    <!-- 페이지 버튼 -->
    <div class="d-flex justify-content-center mt-3">
      <!-- 이전 버튼 -->
      <button
          class="btn btn-outline-secondary mx-1"
          :disabled="productStore.page === 0"
          @click="productStore.goToPage(productStore.page - 1)"
      >
        이전
      </button>

      <!-- 페이지 번호 -->
      <button
          v-for="pageNum in productStore.totalPages"
          :key="pageNum"
          class="btn mx-1"
          :class="productStore.page === (pageNum - 1) ? 'btn-primary' : 'btn-outline-primary'"
          @click="productStore.goToPage(pageNum - 1)"
      >
        {{ pageNum }}
      </button>

      <!-- 다음 버튼 -->
      <button
          class="btn btn-outline-secondary mx-1"
          :disabled="productStore.page >= productStore.totalPages - 1"
          @click="productStore.goToPage(productStore.page + 1)"
      >
        다음
      </button>
    </div>

  </div>

</template>
