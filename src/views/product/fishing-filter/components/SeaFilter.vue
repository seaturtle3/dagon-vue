<script setup>
import {ref, computed} from 'vue'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";
import {useRouter} from 'vue-router'
import Pagination from "@/components/common-function/Pagination.vue";
import ReservationSchedule from '@views/order/reservation/components/ReservationSchedule.vue'

const props = defineProps({
  filteredProducts: {
    type: Array,
    required: true
  }
})

const router = useRouter()
const currentPage = ref(1)
const pageSize = 12

// 출조 정보 확인 모달창 -여기부터-
const showModal = ref(false)
const filters = ref({})
const selectedSchedule = ref({})

// 필터 값 저장
function handleFilterChange(val) {
  filters.value = val
}

// 예약 클릭 시
function openModal(schedule) {
  selectedSchedule.value = schedule
  showModal.value = true
}

// 예시용 예약 정보
const sampleSchedule = {
  price: 60000,
  partnerName: '제주승강호',
  contact: '010-1234-5678',
  location: '제주특별자치도 제주시 애월읍 하귀12길 21-6',
  note: '낚시대, 릴, 채비/미끼 등 유료 제공 (각 10,000원)'
}
// 출조 정보 확인 모달창 -여기까지-

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

function openReservation(product) {
  router.push(``)
}

</script>

<template>
  <div class="product-grid">
    <div
        class="product-card"
        v-for="product in paginatedProducts"
        :key="product.prodId"
    >
      <!-- 상품명 + 배경 -->
      <div class="prod-name" @click="openDetail(product)">{{ product.prodName }}</div>

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
        <p style="margin-bottom: 1%">어종 : </p>
        <p style="margin-bottom: 1%">비용 : </p>
        <p style="margin-bottom: 1%">시간 : </p>
        <p class="address">위치 : {{ product.prodAddress }}</p>
      </div>

      <!-- 하단 버튼 -->
      <div class="card-footer">
        <button @click.stop="openReservation(product)">
          예약하기 (0/10)
        </button>
      </div>
    </div>
  </div>

  <Pagination
      :page="currentPage"
      :total-pages="totalPages"
      :zero-based="false"
      @page-change="onPageChange"
  />

  <ReservationSchedule
      :show="showModal"
      :selectedFilters="filters"
      :scheduleInfo="selectedSchedule"
      @close="showModal = false"
  />
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 32px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
}

.prod-name {
  font-weight: bold;
  font-size: 1.1rem;
  background-color: cornflowerblue;
  color: #ffffff;
  padding: 12px 16px 8px 16px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  cursor:pointer;
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

.card-footer {
  padding: 0 16px 16px;
  margin-top: auto;
  text-align: center;
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
