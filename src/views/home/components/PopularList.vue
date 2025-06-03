<script setup>
import { ref, onMounted, computed } from 'vue'
import { useFishingCenterStore } from '@/store/fishing-center/fishingCenterStore.js'

const store = useFishingCenterStore()
const currentPage = ref(0)
const pageSize = 6

onMounted(() => {
  store.fetchProducts()
})

const totalPages = computed(() => {
  return Math.ceil(store.products.length / pageSize)
})

const paginatedProducts = computed(() => {
  const sorted = [...store.products].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
  const start = currentPage.value * pageSize
  return sorted.slice(start, start + pageSize)
})

function prevPage() {
  if (currentPage.value > 0) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value - 1) currentPage.value++
}
</script>

<template>
  <div class="mt-5">
    <h2 class="fw-bold fs-5 mb-3">최근 인기 조황</h2>

    <div class="d-flex align-items-center">
      <!-- 왼쪽 버튼 -->
      <button
          class="nav-btn me-2"
          @click="prevPage"
          :disabled="currentPage === 0"
      >
        &lt;
      </button>

      <!-- 카드 리스트 -->
      <div class="row row-cols-1 row-cols-md-6 g-3 flex-grow-1 m-0">
        <div
            v-for="product in paginatedProducts"
            :key="product.prodId"
            class="col"
        >
          <div class="card h-200 text-center" style="cursor: pointer;">
            <img
                :src="`http://localhost:8095/uploads/${product.prodThumbnail}`"
                class="card-img-top"
                alt="썸네일"
                style="height: 60%; object-fit: cover;"
            />
            <div class="card-body p-2 mt-2">
              <h6 class="card-title mb-1">
                {{ product.prodName }}
              </h6>
              <p class="card-text text-muted" style="font-size: 0.8rem;">
                {{ product.prodRegion }}
              </p>
              <small class="text-muted">
                {{ product.createdAt }}
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- 오른쪽 버튼 -->
      <button
          class="nav-btn ms-2"
          @click="nextPage"
          :disabled="currentPage === totalPages - 1"
      >
        &gt;
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0 10px;
}

.nav-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}
</style>
