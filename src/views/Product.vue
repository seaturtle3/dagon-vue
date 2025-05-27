<script>
import api from '@/lib/axios.js'

export default {
  name: 'ProductPage',
  data() {
    return {
      products: []
    }
  },
  mounted() {
    this.fetchProducts()
    console.log("API 상품 호출");
  },
  methods: {
    async fetchProducts() {
      try {
        const res = await api.get('/api/product/get-all')
        this.products = res.data
        console.log(this.products)
      } catch (err) {
        console.error('상품 목록 불러오기 실패', err)
      }
    }
  }
}
</script>

<template>



</template>

<style scoped>

</style>