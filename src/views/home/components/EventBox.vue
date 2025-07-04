<template>
  <div class="event-container">
    <router-link to="/event" class="event-banner" style="display: block;">
      <img :src="eventImg" alt="이벤트 배너" class="event-img" />
    </router-link>
  </div>
</template>

<script setup>
import eventImg from '@/assets/images/event-sample.jpg'
</script>

<style scoped>
.event-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  flex: 1 1 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 560px;
}
@media (max-width: 900px) {
  .event-container {
    height: auto;
    min-height: 320px;
  }
}
.event-header {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.event-banner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  overflow: hidden;
}
.event-img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
}
.event-placeholder {
  color: #6b7280;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 2.5rem 0;
  text-align: center;
}
</style> 