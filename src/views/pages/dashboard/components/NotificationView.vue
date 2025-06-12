<template>
  <div class="notification-view">
    <div class="notification-header">
      <h2>{{ notification.title }}</h2>
      <div class="notification-meta">
        <span class="type">{{ notification.type }}</span>
        <span class="date">{{ formatDate(notification.createdAt) }}</span>
      </div>
    </div>
    
    <div class="notification-content">
      <p>{{ notification.content }}</p>
    </div>
    
    <div class="notification-info">
      <div class="info-item">
        <label>발신자:</label>
        <span>{{ notification.senderName || '시스템' }}</span>
      </div>
      <div class="info-item">
        <label>수신자:</label>
        <span>{{ notification.receiverUid }}</span>
      </div>
    </div>
    
    <div class="notification-actions">
      <button @click="$emit('close')" class="close-btn">닫기</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationView',
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.notification-view {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  margin: 0 auto;
}

.notification-header {
  margin-bottom: 1.5rem;
}

.notification-header h2 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.notification-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.type {
  background: #e3f2fd;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: #1976d2;
}

.date {
  color: #666;
}

.notification-content {
  margin-bottom: 2rem;
  line-height: 1.6;
  color: #2c3e50;
}

.notification-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  margin-bottom: 0.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item label {
  font-weight: 600;
  width: 80px;
  color: #666;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  padding: 0.5rem 1rem;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn:hover {
  background-color: #7f8c8d;
}
</style> 