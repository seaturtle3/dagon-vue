<script setup>
import {useRoute, useRouter} from 'vue-router'
import { useProductFishingDiaryStore } from '@/store/product/product-detail/useProductFishingDiaryStore.js'
import {IMAGE_BASE_URL} from "@/constants/imageBaseUrl.js";
import {onMounted, onUnmounted, watch, computed} from "vue";

const route = useRoute()
const router = useRouter()
const store = useProductFishingDiaryStore()
const productId = route.params.prodId
console.log("-------------2222222222221>",productId)

onMounted(async () => {
  try {
    await store.fetchFishingDiary(productId)
  } catch (error) {
    // 404 에러는 조행기가 없다는 의미이므로 무시
    if (error.response?.status !== 404) {
      console.error('조행기 조회 중 오류:', error)
    }
  }
})

const diaryList = computed(() => {
  const list = store.getDiaryByProductId(productId) || [];
  return [...list].sort((a, b) => {
    // fishingAt(날짜) 기준 내림차순, 없으면 fdId 내림차순
    const dateA = a.fishingAt ? new Date(a.fishingAt) : null;
    const dateB = b.fishingAt ? new Date(b.fishingAt) : null;
    if (dateA && dateB) {
      return dateB - dateA;
    } else if (dateA) {
      return -1;
    } else if (dateB) {
      return 1;
    } else {
      return (b.fdId || 0) - (a.fdId || 0);
    }
  });
})

watch(() => route.params.prodId, async (newId, oldId) => {
  if (newId !== oldId) {
    store.clearDiary()
    try {
      await store.fetchFishingDiary(newId)
    } catch (error) {
      // 404 에러는 조행기가 없다는 의미이므로 무시
      if (error.response?.status !== 404) {
        console.error('조행기 조회 중 오류:', error)
      }
    }
  }
})

onUnmounted(() => {
  store.clearDiary()
})

const goToDetail = (diary) => {
  router.push(`/fishing-diary/${diary.fdId}`)
}

const filteredDiaries = computed(() => {
  const diaryArr = Array.isArray(store.diary) ? store.diary : []
  return diaryArr.filter(diary => String(diary.product?.prodId) === String(productId))
})

const emit = defineEmits(['update:count'])
watch(filteredDiaries, (val) => {
  emit('update:count', val.length)
}, { immediate: true })
</script>

<template>
  <div class="list-container">
    <div v-if="store.loading">로딩중...</div>
    <div v-else-if="store.error">{{ store.error }}</div>
    <div v-else>

      <div v-if="diaryList.length > 0" class="diary-grid">
        <div
            v-for="diary in diaryList"
            :key="diary.fdId"
            class="item-box"
            @click="goToDetail(diary)"
            style="cursor: pointer"
        >
          <div class="thumbnail-wrapper">
            <img
          class="thumbnail-img"
          :src="
            diary.images && diary.images.length
              ? (
                  diary.images[0].imageData
                    ? `data:image/jpeg;base64,${diary.images[0].imageData}`
                    : (diary.images[0].image_data
                        ? `data:image/jpeg;base64,${diary.images[0].image_data}`
                        : (diary.images[0].imageUrl
                            ? diary.images[0].imageUrl
                            : (diary.images[0].image_url
                                ? diary.images[0].image_url
                                : '/images/no-image.png'
                              )
                          )
                      )
                )
              : '/images/no-image.png'
          "
          alt="썸네일"
      />

          </div>
          <div class="item-content">
            <h3>{{ diary.product?.prodName }}</h3>
            <h5>{{ diary.title }}</h5>
            <small>{{ diary.fishingAt ? diary.fishingAt.slice(0, 10) : '날짜 없음' }}</small>
          </div>
        </div>
      </div>
       <div v-else>조행기가 없습니다.</div>
    </div>
  </div>
</template>

<style scoped>
.list-container {
  width: 100%;
  margin: 0 auto;
}

.diary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 10px 0;
}

.item-box {
  border: 1px solid #aaa;
  border-radius: 6px;
  background-color: #f9f9f9;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 400px;
  padding: 0; /* 패딩 제거 */
}
.item-content {
  height: 40%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-content h3 {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.item-content h5 {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-content small {
  color: #999;
  font-size: 0.85rem;
}

.thumbnail-wrapper {
  height: 60%;
  overflow: hidden;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.image-placeholder i {
  font-size: 2rem;
  color: #999;
  margin-bottom: 8px;
}

.image-placeholder span {
  color: #999;
  font-size: 0.85rem;
}
</style>
