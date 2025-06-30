<script setup>
import {ref, computed, nextTick} from 'vue'
import {IMAGE_BASE_URL, BASE_URL} from "@/constants/imageBaseUrl.js";
import {useRouter} from 'vue-router'
import Pagination from "@/components/common-function/Pagination.vue";
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

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

// Swiper 인스턴스 관리 (카드별)
const swiperRefs = ref([])
function setSwiperRef(swiper, idx) {
  swiperRefs.value[idx] = swiper
}
function handleMouseEnter(idx) {
  const swiper = swiperRefs.value[idx]
  if (swiper && swiper.autoplay) {
    swiper.autoplay.start()
  }
}
function handleMouseLeave(idx) {
  const swiper = swiperRefs.value[idx]
  if (swiper && swiper.autoplay) {
    swiper.autoplay.stop()
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
            :autoplay="{ delay: 300, disableOnInteraction: false }"
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
            :autoplay="{ delay: 300, disableOnInteraction: false }"
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
        <p class="weight-max">{{ product.weight }}t & {{ product.maxPerson }}명</p>
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

.card-top {
  display: flex;            /* ✅ flex 컨테이너로 만들고 */
  justify-content: center;
  align-items: center;      /* (선택) 수직 정렬 */
  font-size: 1.1rem;
  background: linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%);
  color: black;
  padding: 12px 16px 8px 16px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  cursor:pointer;
}

.prod-name {
  font-weight: bold;
  display: block;       /* ✅ 줄바꿈 방지 */
  overflow: hidden;
  text-overflow: ellipsis; /* ✅ 말줄임 표시 */
  white-space: nowrap;  /* ✅ 한 줄로 고정 */
}

.thumbnail-wrapper {
  position: relative;
}

.thumbnail-img {
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
  overflow: hidden;
  text-overflow: ellipsis; /* ✅ 말줄임 표시 */
  white-space: nowrap;  /* ✅ 한 줄로 고정 */
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

.weight-max {
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}
</style>
