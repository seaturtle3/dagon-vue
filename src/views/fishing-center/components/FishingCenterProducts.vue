<script>
import axios from "@/lib/axios.js"

export default {
  name: 'FishingCenterProducts',
  data() {
    return {
      products: [],
      page: 0,
      size: 10,
      totalPages: 0
    }
  },
  async created() {
    await this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      try {
        const res = await axios.get('/api/fishing-center/get-with-reports-or-diaries', {
          params: {
            page: this.page,
            size: this.size
          }
        })
        this.products = res.data.content
        console.log(this.products);
        this.totalPages = res.data.totalPages
      } catch (err) {
        console.error('상품 불러오기 실패', err)
      }
    },
    goToPage(pageNum) {
      this.page = pageNum
      this.fetchProducts()
    },
    selectProduct(product) {
      this.$emit('select', product)
    }
  }
}
</script>

<template>
  <div>
    <div class="row row-cols-1 row-cols-md-5 g-3">
      <div v-for="product in products" :key="product.prodId" class="col">
        <div class="card h-100" @click="selectProduct(product)" style="cursor: pointer;">
          <img
              :src="`http://localhost:8095/uploads/${product.prodThumbnail}`"
              class="card-img-top"
              alt="썸네일"
              style="height: 120px; object-fit: cover;"
          />
          <div class="card-body p-2">
            <h6 class="card-title mb-1">{{ product.prodName }}</h6>
            <p class="card-text text-muted" style="font-size: 0.8rem;">{{ product.prodRegion }}</p>
          </div>

          <div class="card-body p-2">
            <h6 class="card-title mb-1">{{ product.createdAt }}</h6>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이징 -->
    <nav v-if="totalPages > 1" class="mt-3">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: page === 0 }">
          <a class="page-link" @click.prevent="goToPage(page - 1)">이전</a>
        </li>
        <li class="page-item" v-for="i in totalPages" :key="i"
            :class="{ active: page === i - 1 }">
          <a class="page-link" @click.prevent="goToPage(i - 1)">{{ i }}</a>
        </li>
        <li class="page-item" :class="{ disabled: page === totalPages - 1 }">
          <a class="page-link" @click.prevent="goToPage(page + 1)">다음</a>
        </li>
      </ul>
    </nav>
  </div>
</template>
