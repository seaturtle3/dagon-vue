<script setup>
import {ref, computed, nextTick} from 'vue'
import {IMAGE_BASE_URL, BASE_URL} from "@/constants/imageBaseUrl.js";
import { useRouter } from 'vue-router'
import Pagination from "@/components/common-function/Pagination.vue";
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const props = defineProps({
  filteredProducts: {
    type: Array,
    required: true
  }
})

const router = useRouter()
const currentPage = ref(1)
const pageSize = 15 // 5개씩 3줄

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

// Swiper 인스턴스 관리 (카드별)
const swiperRefs = ref([])

function setSwiperRef(swiper, idx) {
  swiperRefs.value[idx] = swiper
}

function handleMouseEnter(idx) {
  const swiper = swiperRefs.value[idx]
  if (swiper && swiper.params && swiper.autoplay) {
    swiper.params.autoplay.delay = 500
    swiper.autoplay.start()
  }
}

function handleMouseLeave(idx) {
  const swiper = swiperRefs.value[idx]
  if (swiper && swiper.autoplay) {
    swiper.autoplay.stop()
    if (swiper.autoplay.running) {
      swiper.autoplay.running = false
    }
  }
}
</script>

<template>
  <div class="product-grid">
    <div
        class="product-card"
        v-for="(product, idx) in paginatedProducts"
        :key="product.prodId"
        @click="openDetail(product)"
        style="cursor: pointer"
    >
      <div class="card-top">
        <span class="prod-name mb-2 fs-5">{{ product.prodName }}</span>
      </div>
      <!-- 썸네일 -->
      <div class="thumbnail-wrapper"
           @mouseenter.stop="handleMouseEnter(idx)"
           @mouseleave.stop="handleMouseLeave(idx)"
      >
        <!-- 1. prodImageDataList가 여러 개면 Swiper로 -->
        <template v-if="product.prodImageDataList && product.prodImageDataList.length > 1">
          <Swiper
            :modules="[Autoplay]"
            :slides-per-view="1"
            :pagination="true"
            :navigation="true"
            :autoplay="false"
            style="width:100%;height:180px;"
            @swiper="swiper => setSwiperRef(swiper, idx)"
          >
            <SwiperSlide v-for="(imgData, sidx) in product.prodImageDataList" :key="sidx">
              <img
                :src="imgData.startsWith('data:image') ? imgData : `data:image/jpeg;base64,${imgData}`"
                class="thumbnail-img"
                @error="e => { e.target.src = defaultImage }"
              >
            </SwiperSlide>
          </Swiper>
        </template>
        <!-- 2. prodImageNames가 여러 개면 Swiper로 -->
        <template v-else-if="product.prodImageNames && product.prodImageNames.length > 1">
          <Swiper
            :modules="[Autoplay]"
            :slides-per-view="1"
            :pagination="true"
            :navigation="true"
            :autoplay="false"
            style="width:100%;height:180px;"
            @swiper="swiper => setSwiperRef(swiper, idx)"
          >
            <SwiperSlide v-for="(img, sidx) in product.prodImageNames" :key="img">
              <img
                :src="img.startsWith('/') ? img : `${BASE_URL}/uploads/products/${img}`"
                class="thumbnail-img"
                @error="e => { e.target.src = defaultImage }"
              >
            </SwiperSlide>
          </Swiper>
        </template>
        <!-- 3. prodImageDataList가 1개면 단일 이미지 -->
        <template v-else-if="product.prodImageDataList && product.prodImageDataList.length === 1">
          <img
            :src="product.prodImageDataList[0].startsWith('data:image') ? product.prodImageDataList[0] : `data:image/jpeg;base64,${product.prodImageDataList[0]}`"
            class="thumbnail-img"
            @error="e => { e.target.src = defaultImage }"
          >
        </template>
        <!-- 4. prodImageNames가 1개면 단일 이미지 -->
        <template v-else-if="product.prodImageNames && product.prodImageNames.length === 1">
          <img
            :src="product.prodImageNames[0].startsWith('/') ? product.prodImageNames[0] : `${BASE_URL}/uploads/products/${product.prodImageNames[0]}`"
            class="thumbnail-img"
            @error="e => { e.target.src = defaultImage }"
          >
        </template>
        <!-- 5. 둘 다 없으면 placeholder -->
        <template v-else>
          <div class="image-placeholder">
            <i class="fas fa-ship"></i>
            <span>이미지 없음</span>
          </div>
        </template>
      </div>
      <!-- 본문 -->
      <div class="content">
        <p class="weight-max">{{ product.weight }}t · {{ product.maxPerson }}명</p>
        <p class="address">위치 : {{ product.prodAddress }}</p>
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
  grid-template-columns: repeat(5, 1fr); /* 5열 고정 */
  gap: 32px;
  place-items: center;
  margin-bottom: 120px;
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
  max-width: 320px;
  margin: 0 auto;
}

.card-top {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.1rem;
  background: #46af87;
  color: #fff;
  padding: 12px 16px 8px 16px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  cursor:pointer;
}

.prod-name {
  font-weight: bold;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thumbnail-wrapper {
  position: relative;
}

.thumbnail-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.content {
  padding: 16px 16px 0 16px;
}

.address {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

button {
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  border: 2px solid #388e3c;
  background: #ffffff;
  color: #388e3c;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #e8f5e9;
}

.weight-max {
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}
</style>
