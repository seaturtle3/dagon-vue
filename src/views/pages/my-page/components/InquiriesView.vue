<template>
  <div class="inquiries-container">
    <div class="page-header">
      <font-awesome-icon icon="fa-solid fa-anchor" class="header-icon" />
      <h2 class="page-title">나의 문의 내역</h2>
    </div>

    <div v-if="loading" class="loading">
      <font-awesome-icon icon="fa-solid fa-fish" spin class="loading-icon" />
      문의 내역을 불러오는 중...
    </div>
    
    <div v-else-if="inquiries.length === 0" class="no-inquiries">
      <font-awesome-icon icon="fa-solid fa-water" class="empty-icon" />
      <p>아직 문의 내역이 없습니다.</p>
      <span class="help-text">궁금하신 점이 있으시다면 언제든 문의해주세요!</span>
    </div>
    
    <div v-else class="inquiry-list">
      <div v-for="inquiry in inquiries" :key="inquiry.id" class="inquiry-card">
        <div class="wave-decoration"></div>
        <div class="inquiry-header">
          <div class="header-main">
            <div class="title-section">
              <span class="inquiry-type" :class="getInquiryTypeClass(inquiry.inquiryType)">
                <font-awesome-icon :icon="getInquiryTypeIcon(inquiry.inquiryType)" class="type-icon" />
                {{ getInquiryTypeText(inquiry.inquiryType) }}
              </span>
              <h3>{{ inquiry.title }}</h3>
            </div>
            <span :class="['status-badge', inquiry.answerContent ? 'answered' : 'pending']">
              <font-awesome-icon :icon="inquiry.answerContent ? 'fa-solid fa-life-ring' : 'fa-solid fa-clock'" class="status-icon" />
              {{ inquiry.answerContent ? '답변 완료' : '답변 대기' }}
            </span>
          </div>
          <div class="inquiry-meta">
            <span class="date">
              <font-awesome-icon icon="fa-solid fa-calendar-days" class="meta-icon" />
              문의일: {{ formatDate(inquiry.createdAt) }}
            </span>
            <span class="partner">
              <font-awesome-icon icon="fa-solid fa-ship" class="meta-icon" />
              문의 대상: {{ inquiry.partnerName || '일반 문의' }}
            </span>
          </div>
        </div>
        
        <div class="inquiry-content">
          <div class="question-section">
            <div class="section-header">
              <font-awesome-icon icon="fa-solid fa-circle-question" class="section-icon" />
              <span>문의 내용</span>
              <span class="author">
                <font-awesome-icon icon="fa-solid fa-user" class="user-icon" />
                작성자: {{ inquiry.userName }} ({{ inquiry.userUid }})
              </span>
            </div>
            <p class="question-text">{{ inquiry.content }}</p>
          </div>
          
          <div v-if="inquiry.answerContent" class="answer-section">
            <div class="section-header">
              <font-awesome-icon icon="fa-solid fa-comment" class="section-icon" />
              <span>답변</span>
              <span class="answer-date">
                <font-awesome-icon icon="fa-solid fa-clock-rotate-left" class="time-icon" />
                {{ formatDate(inquiry.answeredAt) }}
              </span>
            </div>
            <div class="answer-content">
              <p class="answer-text">{{ inquiry.answerContent }}</p>
            </div>
          </div>
          
          <div v-else class="no-answer">
            <font-awesome-icon icon="fa-solid fa-anchor" class="waiting-icon" />
            답변을 준비 중입니다. 조금만 기다려주세요!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { myPageAPI } from '@/api/mypage.js';

// Font Awesome CDN 추가
const fontAwesomeScript = document.createElement('link');
fontAwesomeScript.rel = 'stylesheet';
fontAwesomeScript.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
document.head.appendChild(fontAwesomeScript);

const inquiries = ref([]);
const loading = ref(false);

const getInquiryTypeText = (type) => {
  const typeMap = {
    PRODUCT: '상품관련',
    BUSINESS: '제휴관련',
    SYSTEM: '시스템관련',
    RESERVATION: '예약관련',
    CANCEL: '예약취소관련'
  };
  return typeMap[type] || '기타';
};

const getInquiryTypeIcon = (type) => {
  const iconMap = {
    PRODUCT: 'fa-solid fa-sailboat',        // 낚시배를 상징하는 범선 아이콘
    BUSINESS: 'fa-solid fa-handshake',      // 제휴를 상징하는 악수 아이콘
    SYSTEM: 'fa-solid fa-gears',            // 시스템을 상징하는 기어 아이콘
    RESERVATION: 'fa-solid fa-calendar-check', // 예약을 상징하는 체크된 달력
    CANCEL: 'fa-solid fa-ban'               // 취소를 상징하는 금지 아이콘
  };
  return iconMap[type] || 'fa-solid fa-circle-info';
};

const getInquiryTypeClass = (type) => {
  const classMap = {
    PRODUCT: 'type-product',
    BUSINESS: 'type-business',
    SYSTEM: 'type-system',
    RESERVATION: 'type-reservation',
    CANCEL: 'type-cancel'
  };
  return classMap[type] || 'type-other';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const loadInquiries = async () => {
  loading.value = true;
  try {
    const data = await myPageAPI.getMyInquiries();
    console.log('받아온 문의 데이터:', data);
    inquiries.value = data;
  } catch (error) {
    console.error('문의 내역 로딩 실패:', error);
    alert('문의 내역을 불러오는데 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadInquiries();
});
</script>

<style scoped>
.inquiries-container {
  padding: 0;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #1976d2;
}

.header-icon {
  font-size: 2em;
  color: #1976d2;
  filter: drop-shadow(0 2px 4px rgba(25, 118, 210, 0.3));
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #0d47a1;
  margin: 0;
}

.loading, .no-inquiries {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
  border: 2px solid #90caf9;
  color: #546e7a;
}

.loading-icon, .empty-icon {
  font-size: 2.5em;
  color: #1976d2;
  margin-bottom: 1rem;
  filter: drop-shadow(0 2px 4px rgba(25, 118, 210, 0.3));
}

.empty-icon {
  font-size: 3.5em;
}

.help-text {
  display: block;
  margin-top: 0.5rem;
  color: #78909c;
  font-size: 0.95rem;
}

.inquiry-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.inquiry-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
  border: 2px solid #90caf9;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.inquiry-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 105, 192, 0.2);
}

.wave-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1976d2, #64b5f6, #1976d2);
  opacity: 0.8;
}

.inquiry-header {
  margin-bottom: 1.5rem;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e3f2fd;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.inquiry-type {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-product {
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #90caf9;
}

.type-business {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #81c784;
}

.type-system {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #ce93d8;
}

.type-reservation {
  background: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffb74d;
}

.type-cancel {
  background: #fbe9e7;
  color: #d32f2f;
  border: 1px solid #ef5350;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge.answered {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #81c784;
}

.status-badge.pending {
  background: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffb74d;
}

.inquiry-meta {
  display: flex;
  gap: 1.5rem;
  color: #546e7a;
  font-size: 0.95rem;
}

.meta-icon {
  color: #1976d2;
}

.inquiry-content {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #bbdefb;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: #0d47a1;
  font-weight: 500;
}

.section-icon {
  color: #1976d2;
  font-size: 1.2rem;
}

.author, .answer-date {
  margin-left: auto;
  font-size: 0.9rem;
  color: #546e7a;
}

.question-text, .answer-text {
  color: #37474f;
  line-height: 1.6;
  margin: 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  border: 1px solid #e3f2fd;
}

.answer-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e3f2fd;
}

.no-answer {
  text-align: center;
  padding: 1.5rem;
  color: #78909c;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  border: 1px solid #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.waiting-icon {
  color: #1976d2;
  font-size: 1.3rem;
  animation: bob 2s infinite ease-in-out;
}

@keyframes bob {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .inquiries-container {
    padding: 1rem;
  }

  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .inquiry-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .status-badge {
    align-self: flex-start;
  }
}
</style> 