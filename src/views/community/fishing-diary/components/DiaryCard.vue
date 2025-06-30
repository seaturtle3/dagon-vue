<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  diary: {
    type: Object,
    required: true
  }
})

const goToDetail = () => {
  router.push(`/fishing-diary/${props.diary.fdId}`)
}
</script>

<template>

  <div class="diary-card"
       @click="goToDetail">
    <div class="thumbnail-list">
      <img
        class="thumbnail"
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
    />
    </div>
    <div class="content">
      <h3 class="product-name">{{ diary.product?.prodName }}</h3>
      <h5 class="diary-title">{{ diary.title }}</h5>
      <small class="diary-date">{{ diary.fishingAt ? diary.fishingAt.slice(0, 10) : '날짜 없음' }}</small>
    </div>
  </div>
</template>

<style scoped>
.diary-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: start;
  height: 300px;
  cursor: pointer;
}

.thumbnail-list {
  display: flex;
  flex-direction: row;
  gap: 6px;
  width: 100%;
  height: 60%;
  margin-bottom: 8px;
  align-items: center;
  justify-content: flex-start;
  overflow-x: auto;
}

.thumbnail {
  width: 80px;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 6px;
  flex-shrink: 0;
}

.content {
  height: 40%;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 4px 0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.diary-title {
  font-size: 1rem;
  color: #333;
  margin: 0;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.diary-date {
  color: #999;
  font-size: 0.8rem;
  margin-top: auto;
  flex-shrink: 0;
}
</style>
