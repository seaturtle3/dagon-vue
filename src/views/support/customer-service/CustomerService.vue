<script>

</script>

<template>
  <div class="customer-service-container">
    <div class="service-header">
      <h1 class="service-title">고객센터</h1>
      <p class="service-subtitle">언제든 편리하게 문의해주세요</p>
    </div>

    <div class="service-content">
      <!-- 연락처 정보 -->
      <div class="contact-info-section">
        <div class="contact-card">
          <div class="contact-icon">
            <i class="fas fa-phone"></i>
          </div>
          <div class="contact-details">
            <h3>전화 문의</h3>
            <p class="phone-number">1588-1234</p>
            <p class="service-time">평일 09:00 - 18:00 (주말/공휴일 휴무)</p>
          </div>
        </div>

        <div class="contact-card">
          <div class="contact-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="contact-details">
            <h3>이메일 문의</h3>
            <p class="email">support@dagon.com</p>
            <p class="service-time">24시간 접수 (답변: 평일 09:00 - 18:00)</p>
          </div>
        </div>

        <div class="contact-card">
          <div class="contact-icon">
            <i class="fas fa-comments"></i>
          </div>
          <div class="contact-details">
            <h3>1:1 문의</h3>
            <p class="inquiry-text">온라인으로 편리하게</p>
            <router-link to="/inquiry" class="inquiry-link">문의하기</router-link>
          </div>
        </div>
      </div>

      <!-- 빠른 메뉴 -->
      <div class="quick-menu-section">
        <h2 class="section-title">빠른 메뉴</h2>
        <div class="quick-menu-grid">
          <router-link to="/faq" class="quick-menu-item">
            <div class="menu-icon">
              <i class="fas fa-question-circle"></i>
            </div>
            <h3>자주하는 질문</h3>
            <p>고객님들이 자주 묻는 질문들을 확인해보세요</p>
          </router-link>

          <router-link to="/notice" class="quick-menu-item">
            <div class="menu-icon">
              <i class="fas fa-bullhorn"></i>
            </div>
            <h3>공지사항</h3>
            <p>중요한 공지사항과 업데이트 소식을 확인하세요</p>
          </router-link>

          <router-link to="/inquiry" class="quick-menu-item">
            <div class="menu-icon">
              <i class="fas fa-edit"></i>
            </div>
            <h3>1:1 문의</h3>
            <p>개인적인 문의사항을 편리하게 접수하세요</p>
          </router-link>

          <div class="quick-menu-item">
            <div class="menu-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <h3>예약 조회</h3>
            <p>내 예약 현황을 확인하고 관리하세요</p>
            <router-link to="/mypage/reservations" class="menu-link">바로가기</router-link>
          </div>
        </div>
      </div>

      <!-- 운영 시간 및 안내 -->
      <div class="service-guide-section">
        <h2 class="section-title">운영 안내</h2>
        <div class="guide-content">
          <div class="guide-item">
            <h3><i class="fas fa-clock"></i> 운영 시간</h3>
            <div class="guide-details">
              <p><strong>전화 문의:</strong> 평일 09:00 - 18:00 (주말/공휴일 휴무)</p>
              <p><strong>이메일 문의:</strong> 24시간 접수 (답변: 평일 09:00 - 18:00)</p>
              <p><strong>1:1 문의:</strong> 24시간 접수 (답변: 평일 09:00 - 18:00)</p>
            </div>
          </div>

          <div class="guide-item">
            <h3><i class="fas fa-info-circle"></i> 문의 시 안내사항</h3>
            <div class="guide-details">
              <ul>
                <li>회원 문의 시 로그인 후 이용하시면 더 빠른 답변이 가능합니다.</li>
                <li>예약 관련 문의는 예약번호를 준비해 주세요.</li>
                <li>결제 관련 문의는 결제 수단과 결제일을 알려주세요.</li>
                <li>기술적 문제 문의 시 사용 중인 브라우저와 기기를 알려주세요.</li>
              </ul>
            </div>
          </div>

          <div class="guide-item">
            <h3><i class="fas fa-exclamation-triangle"></i> 긴급 상황</h3>
            <div class="guide-details">
              <p>낚시 중 긴급 상황 발생 시 <strong>1588-1234</strong>로 즉시 연락해주세요.</p>
              <p>안전사고 예방을 위해 항상 안전수칙을 준수해주시기 바랍니다.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 자주 묻는 질문 미리보기 -->
      <div class="faq-preview-section">
        <h2 class="section-title">자주 묻는 질문</h2>
        <div class="faq-preview-list">
          <div class="faq-preview-item" @click="toggleFAQ(item.id)" v-for="item in faqPreview" :key="item.id">
            <div class="faq-question">
              <span>{{ item.question }}</span>
              <i class="fas fa-chevron-down" :class="{ 'rotated': expandedFAQ === item.id }"></i>
            </div>
            <div class="faq-answer" v-show="expandedFAQ === item.id">
              {{ item.answer }}
            </div>
          </div>
        </div>
        <div class="faq-more">
          <router-link to="/faq" class="more-link">
            더 많은 질문 보기 <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const expandedFAQ = ref(null)

// FAQ 미리보기 데이터
const faqPreview = ref([
  {
    id: 1,
    question: '예약 취소는 언제까지 가능한가요?',
    answer: '이용일 7일 전까지는 전액 환불, 3일 전까지는 50% 환불이 가능합니다. 3일 이내에는 취소가 불가능합니다.'
  },
  {
    id: 2,
    question: '낚시 도구는 대여 가능한가요?',
    answer: '네, 대부분의 낚시터에서 낚시 도구 대여가 가능합니다. 예약 시 대여 옵션을 선택하시거나 현장에서 추가로 신청하실 수 있습니다.'
  },
  {
    id: 3,
    question: '초보자도 이용 가능한가요?',
    answer: '네, 초보자를 위한 가이드 서비스와 교육 프로그램을 제공하고 있습니다. 예약 시 "초보자 가이드" 옵션을 선택하시면 전문 가이드가 함께합니다.'
  }
])

const toggleFAQ = (id) => {
  expandedFAQ.value = expandedFAQ.value === id ? null : id
}
</script>

<style scoped>
.customer-service-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.service-header {
  text-align: center;
  margin-bottom: 3rem;
}

.service-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.service-subtitle {
  font-size: 1.1rem;
  color: #718096;
}

/* 연락처 정보 섹션 */
.contact-info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.contact-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.contact-card:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.contact-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.contact-icon i {
  font-size: 2rem;
  color: white;
}

.contact-details h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.phone-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.email {
  font-size: 1.1rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.service-time {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.inquiry-text {
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 1rem;
}

.inquiry-link {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.3s ease;
}

.inquiry-link:hover {
  background: #5a67d8;
  color: white;
}

/* 빠른 메뉴 섹션 */
.quick-menu-section {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 2rem;
  text-align: center;
}

.quick-menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.quick-menu-item {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
}

.quick-menu-item:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  color: inherit;
}

.menu-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.menu-icon i {
  font-size: 1.5rem;
  color: white;
}

.quick-menu-item h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
}

.quick-menu-item p {
  font-size: 0.875rem;
  color: #718096;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.menu-link {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.3s ease;
}

.menu-link:hover {
  background: #5a67d8;
  color: white;
}

/* 서비스 가이드 섹션 */
.service-guide-section {
  margin-bottom: 4rem;
}

.guide-content {
  display: grid;
  gap: 2rem;
}

.guide-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
}

.guide-item h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.guide-item h3 i {
  color: #667eea;
}

.guide-details p {
  margin-bottom: 0.5rem;
  color: #4a5568;
  line-height: 1.6;
}

.guide-details ul {
  list-style: none;
  padding: 0;
}

.guide-details li {
  margin-bottom: 0.5rem;
  color: #4a5568;
  line-height: 1.6;
  padding-left: 1.5rem;
  position: relative;
}

.guide-details li::before {
  content: '•';
  color: #667eea;
  position: absolute;
  left: 0;
  font-weight: bold;
}

/* FAQ 미리보기 섹션 */
.faq-preview-section {
  margin-bottom: 2rem;
}

.faq-preview-list {
  margin-bottom: 2rem;
}

.faq-preview-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.faq-preview-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.faq-question {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  font-weight: 500;
  color: #2d3748;
}

.faq-question i {
  color: #a0aec0;
  transition: transform 0.3s ease;
}

.faq-question i.rotated {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 1.5rem;
  color: #4a5568;
  line-height: 1.6;
  border-top: 1px solid #e2e8f0;
}

.faq-more {
  text-align: center;
}

.more-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.more-link:hover {
  color: #5a67d8;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .customer-service-container {
    padding: 1rem;
  }
  
  .service-title {
    font-size: 2rem;
  }
  
  .contact-info-section {
    grid-template-columns: 1fr;
  }
  
  .quick-menu-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-card,
  .quick-menu-item {
    padding: 1.5rem;
  }
}
</style>