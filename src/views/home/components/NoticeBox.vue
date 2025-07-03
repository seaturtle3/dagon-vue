<script>
import { fetchNotices } from '@/api/notice.js';

export default {
  name: 'NoticeBox',
  data() {
    return {
      notices: [],
      loading: false,
      error: null,
      search: ''
    };
  },

  async mounted() {
    await this.fetchNotices();
  },
  methods: {
    async fetchNotices() {
      this.loading = true;
      this.error = null;
      try {
        const params = {
          page: 0,
          size: 10
        };
        
        if (this.search.trim()) {
          params.keyword = this.search.trim();
          params.type = 'title+content';
        }
        
        const res = await fetchNotices(params);
        if (res.data && res.data.content) {
          this.notices = res.data.content;
          console.log('공지사항 조회 결과:', res.data);
        } else {
          console.warn('공지사항 데이터 형식이 예상과 다릅니다:', res);
          this.notices = [];
        }
      } catch (error) {
        console.error('공지사항 조회 실패:', error);
        this.error = '공지사항을 불러오는 중 오류가 발생했습니다.';
        this.notices = [];
      } finally {
        this.loading = false;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('ko-KR');
      } catch (error) {
        console.error('날짜 형식 오류:', error);
        return '';
      }
    },
    
    truncateTitle(title, maxLength = 40) {
      if (!title) return '';
      if (title.length <= maxLength) return title;
      return title.substring(0, maxLength) + '...';
    },
    
    goToNoticeDetail(noticeId) {
      if (!noticeId) {
        console.warn('공지사항 ID가 없습니다.');
        return;
      }
      this.$router.push(`/notice/${noticeId}`);
    },
    
    sortedNotices() {
      if (!this.notices.length) return { urgent: [], normal: [] };
      
      const urgent = this.notices.filter(notice => 
        notice.isTop === true || notice.isUrgent === true || 
        notice.top === true || notice.urgent === true
      );
      const normal = this.notices.filter(notice => 
        !notice.isTop && !notice.isUrgent && 
        !notice.top && !notice.urgent
      );
      
      return { urgent, normal };
    },
    
    async handleSearch() {
      await this.fetchNotices();
    }
  },
  
  computed: {
    urgentNotices() {
      return this.sortedNotices().urgent;
    },
    
    normalNotices() {
      return this.sortedNotices().normal;
    }
  }
};
</script>

<template>
  <div class="notice-container">
    <div class="notice-header">
      <h2 class="notice-title">
        공지사항
      </h2>
      <router-link to="/notice" class="view-all-link">
        전체보기
      </router-link>
    </div>
    
    <div class="notice-content">
      <!-- 검색 기능 -->
      <!-- <div class="search-section">
        <div class="search-box">
          <input 
            v-model="search" 
            type="text" 
            class="search-input" 
            placeholder="공지사항 검색..."
            @keyup.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            <font-awesome-icon :icon="['fas', 'search']" />
          </button>
        </div>
      </div> -->

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-state">
        <font-awesome-icon :icon="['fas', 'spinner']" spin />
        <p>공지사항을 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-state">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
        <p>{{ error }}</p>
        <button @click="fetchNotices" class="retry-btn">
          <font-awesome-icon :icon="['fas', 'redo']" /> 다시 시도
        </button>
      </div>

      <!-- 공지사항이 없는 경우 -->
      <div v-else-if="!urgentNotices.length && !normalNotices.length" class="empty-state">
        <font-awesome-icon :icon="['fas', 'inbox']" />
        <p>등록된 공지사항이 없습니다.</p>
      </div>

      <!-- 공지사항 목록 -->
      <div v-else>
        <!-- 고정 공지 -->
        <div v-if="urgentNotices.length > 0" class="urgent-section">
          <div 
            v-for="notice in urgentNotices" 
            :key="notice.noticeId" 
            class="notice-item urgent-notice"
            @click="goToNoticeDetail(notice.noticeId)"
          >
            <div class="notice-info">
              <div class="notice-meta">
                <span v-if="notice.isTop" class="top-badge">
                  <font-awesome-icon :icon="['fas', 'star']" /> 고정공지
                </span>
              </div>
              <h4 class="notice-item-title urgent-title">
                <span class="title-text">{{ truncateTitle(notice.title) }}</span>
                <span class="notice-date-inline">{{ formatDate(notice.createdAt) }}</span>
              </h4>

            </div>
          </div>
        </div>

        <!-- 일반 공지 -->
        <div v-if="normalNotices.length > 0" class="normal-section">
          <div 
            v-for="notice in normalNotices.slice(0, 5)" 
            :key="notice.noticeId" 
            class="notice-item"
            @click="goToNoticeDetail(notice.noticeId)"
          >
            <div class="notice-info">
              <h4 class="notice-item-title">
                <font-awesome-icon :icon="['fas', 'file-alt']" class="notice-item-icon"/>
                <span class="title-text">{{ truncateTitle(notice.title) }}</span>
                <span class="notice-date-inline">{{ formatDate(notice.createdAt) }}</span>
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notice-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border: 1.5px solid #e5e7eb;
  height: 560px;
  display: flex;
  flex-direction: column;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.notice-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notice-item-icon {
  color: #667eea;
}

.view-all-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.3s ease;
}

.view-all-link:hover {
  opacity: 0.8;
}

.notice-content {
  padding: 2rem;
}

.search-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem;
  flex: 1;
  transition: border-color 0.3s ease;
}

.search-box:focus-within {
  border-color: #667eea;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  width: 100%;
  color: #2d3748;
}

.search-input::placeholder {
  color: #a0aec0;
}

.search-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  background: #5a67d8;
}

.search-btn i {
  font-size: 0.75rem;
}

.notice-list {
  margin-top: 0.7rem;
}

.notice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.notice-item:hover {
  background-color: #f7fafc;
}

.notice-info {
  flex: 1;
}

.notice-item-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}

.notice-item-title i {
  color: #667eea;
  flex-shrink: 0;
}

.title-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.notice-date-inline {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 400;
  margin-left: 0.7rem;
  flex-shrink: 0;
  white-space: nowrap;
}

.urgent-title .notice-date-inline {
  color: #dc2626;
  opacity: 0.8;
}

.urgent-badge {
  background: #dc2626;
  color: white;
  padding: 0.175rem 0.35rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.175rem;
}

.notice-item:hover .arrow-icon {
  transform: translateX(4px);
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.notice-date {
  color: #718096;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.top-badge {
  background: #fef3c7;
  color: #d97706;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.urgent-notice {
  background: #fef2f2;
  border-left: 4px solid #dc2626;
}

.urgent-title {
  color: #dc2626 !important;
  font-weight: 700 !important;
}

.urgent-title i {
  color: #dc2626 !important;
}

.urgent-section {
  margin-bottom: 0.7rem;
  /* border-bottom: 2px solid #fecaca; */
  padding-bottom: 0.7rem;
}

.normal-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 0.7rem;
}

/* 반응형 디자인 */
@media (max-width: 900px) {
  .notice-container {
    height: auto;
    min-height: 320px;
  }
}

/* 상태별 스타일 */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.4rem;
  text-align: center;
  color: #718096;
}

.loading-state i,
.error-state i,
.empty-state i {
  font-size: 1.4rem;
  margin-bottom: 0.7rem;
  color: #667eea;
}

.error-state i {
  color: #e53e3e;
}

.empty-state i {
  color: #a0aec0;
}

.retry-btn {
  margin-top: 0.7rem;
  padding: 0.35rem 0.7rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background: #5a67d8;
}

.retry-btn i {
  font-size: 0.75rem;
}
</style>