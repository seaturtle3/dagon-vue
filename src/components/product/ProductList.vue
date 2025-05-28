<script>
import api from '@/lib/axios.js'

export default {
  name: 'ProductList',
  data() {
    return {
      products: []
    }
  },
  mounted() {
    this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      try {
        const res = await api.get('/api/product/get-all')
        this.products = res.data.content // Page 객체니까 content 필요
      } catch (err) {
        console.error('상품 목록 불러오기 실패', err)
      }
    }
  }
}
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
        <td>
          <button type="button" class="btn btn-sm btn-primary">예약</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
</style>