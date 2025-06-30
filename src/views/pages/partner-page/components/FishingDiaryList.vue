<template>
  <div class="fishing-diary-list">
    <div class="list-header">
      <h2>나의 조행기 목록</h2>
      <div class="search-sort-bar">
        <input v-model="search" @input="onSearch" placeholder="제목, 내용, 작성자 검색..." />
        <select v-model="sortBy" @change="fetchDiaries">
          <option value="createdAt">최신순</option>
          <option value="fishingAt">낚시일순</option>
          <option value="commentCount">댓글 많은 순</option>
        </select>
      </div>
    </div>
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> 로딩 중...
    </div>
    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-circle"></i> {{ error }}
    </div>
    <div v-else>
      <div v-if="filteredDiaries.length === 0" class="no-data">
        <i class="fas fa-book-dead"></i> 등록된 조행기가 없습니다.
      </div>
      <div v-else class="diary-card-list">
        <div
          v-for="diary in paginatedDiaries"
          :key="diary.fdId"
          class="diary-card"
          @click="goToPublicDetail(diary.fdId)"
        >
          <div class="diary-image-wrapper">
            <img
              v-if="diary.images && diary.images.length > 0"
              :src="getDiaryThumbnail(diary)"
              :alt="diary.images[0].imageName"
              class="diary-image"
            />
            <div v-else class="no-image">
              <i class="fas fa-image"></i>
            </div>
            <span v-if="diary.status === 'PRIVATE'" class="badge badge-private">비공개</span>
            <span v-if="diary.reported" class="badge badge-reported">신고됨</span>
          </div>
          <div class="diary-info">
            <div class="diary-title">{{ diary.title }}</div>
            <div class="diary-meta">
              <span><i class="fas fa-user"></i> {{ diary.user?.nickname || diary.user?.uname || '알 수 없음' }}</span>
              <span><i class="fas fa-calendar-day"></i> {{ formatDate(diary.fishingAt) }}</span>
              <span><i class="fas fa-clock"></i> {{ formatDateTime(diary.createdAt) }}</span>
              <span><i class="fas fa-comments"></i> {{ diary.comments?.length || 0 }}</span>
              <span v-if="diary.likes !== undefined"><i class="fas fa-heart"></i> {{ diary.likes }}</span>
            </div>
            <div class="diary-preview">{{ getPreview(diary.content) }}</div>
            <div class="diary-actions">
              <button @click.stop="goDetail(diary.fdId)"><i class="fas fa-eye"></i> 상세</button>
              <button @click="deleteDiary(diary.fdId)"><i class="fas fa-trash fa-fw"></i> 삭제</button>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination">
        <button :disabled="page === 1" @click="page--">이전</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button :disabled="page === totalPages" @click="page++">다음</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { partnerService } from '@/api/partner.js';
import { BASE_URL } from '@/constants/baseUrl.js';

const diaries = ref([]);
const loading = ref(true);
const error = ref(null);
const router = useRouter();

// 검색, 정렬, 페이지네이션
const search = ref('');
const sortBy = ref('createdAt');
const page = ref(1);
const pageSize = 8;

// 이미지 URL 생성 함수
function getImageUrl(image) {
  if (!image) return '/images/default-product.jpg';
  
  if (image.imageData) {
    // base64 데이터가 있으면 직접 사용
    return `data:image/jpeg;base64,${image.imageData}`;
  } else if (image.imageUrl) {
    // imageUrl이 상대 경로인 경우 base URL과 결합
    if (image.imageUrl.startsWith('/')) {
      return `${BASE_URL}${image.imageUrl}`;
    }
    return image.imageUrl;
  }
  return '/images/default-product.jpg';
}

// 조행기 썸네일 이미지 가져오기
function getDiaryThumbnail(diary) {
  if (diary.images && diary.images.length > 0) {
    return getImageUrl(diary.images[0]);
  }
  return '/images/default-product.jpg';
}

onMounted(async () => {
  await fetchDiaries();
  console.log('diaries:', diaries.value);
  console.log('filteredDiaries:', filteredDiaries.value);
  console.log('paginatedDiaries:', paginatedDiaries.value);
});

async function fetchDiaries() {
  loading.value = true;
  error.value = null;
  try {
    const res = await partnerService.getMyFishingDiaries();
    diaries.value = res.data || [];
  } catch (err) {
    error.value = err.message || '조행기 목록을 불러오지 못했습니다.';
  } finally {
    loading.value = false;
  }
}

function goDetail(fdId) {
  router.push(`/partner/fishing-diaries/${fdId}`);
}
function editDiary(fdId) {
  alert('수정 기능은 준비 중입니다.');
}
async function deleteDiary(fdId) {
  if (confirm('정말로 삭제하시겠습니까?')) {
    try {
      await partnerService.deleteFishingDiary(fdId);
      alert('조행기가 삭제되었습니다.');
      await fetchDiaries(); // 목록 새로고침
    } catch (err) {
      console.error('조행기 삭제 실패:', err);
      alert('조행기 삭제에 실패했습니다.');
    }
  }
}
function reportDiary(fdId) {
  alert('신고 기능은 준비 중입니다.');
}
function onSearch() {
  page.value = 1;
}
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR');
}
function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR');
}
function getPreview(html) {
  if (!html) return '';
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > 50 ? text.slice(0, 50) + '...' : text;
}

// 검색/정렬/필터링된 목록
const filteredDiaries = computed(() => {
  let result = diaries.value;
  if (search.value) {
    const s = search.value.toLowerCase();
    result = result.filter(d =>
      (d.title && d.title.toLowerCase().includes(s)) ||
      (d.content && d.content.toLowerCase().includes(s)) ||
      (d.user && (d.user.nickname?.toLowerCase().includes(s) || d.user.uname?.toLowerCase().includes(s)))
    );
  }
  if (sortBy.value === 'createdAt') {
    result = result.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy.value === 'fishingAt') {
    result = result.slice().sort((a, b) => new Date(b.fishingAt) - new Date(a.fishingAt));
  } else if (sortBy.value === 'commentCount') {
    result = result.slice().sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
  }
  return result;
});

// 페이지네이션
const totalPages = computed(() => Math.max(1, Math.ceil(filteredDiaries.value.length / pageSize)));
const paginatedDiaries = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredDiaries.value.slice(start, start + pageSize);
});

function goToPublicDetail(fdId) {
  router.push(`/fishing-diary/${fdId}`);
}
</script>

<style scoped>
.fishing-diary-list {
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
  background-color: #e3f2fd;
  min-height: 100vh;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.search-sort-bar {
  display: flex;
  gap: 0.7rem;
  align-items: center;
}
.search-sort-bar input {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1.5px solid #e0e0e0;
  font-size: 1rem;
  min-width: 220px;
}
.search-sort-bar select {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1.5px solid #e0e0e0;
  font-size: 1rem;
}
.loading, .error, .no-data {
  text-align: center;
  color: #888;
  margin-top: 3rem;
  font-size: 1.2rem;
}
.diary-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
}
.diary-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.08);
  display: flex;
  flex-direction: row;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  overflow: hidden;
  border: 1.5px solid #e3eaf3;
  min-height: 140px;
  position: relative;
}
.diary-card:hover {
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.18);
  transform: translateY(-2px) scale(1.02);
  border-color: #3498db;
}
.diary-image-wrapper {
  width: 120px;
  height: 100%;
  background: #f4f8fb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.diary-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  min-height: 120px;
  min-width: 120px;
}
.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b0bec5;
  font-size: 2.5rem;
}
.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 0.3em 0.7em;
  border-radius: 8px;
  font-size: 0.85em;
  font-weight: 600;
  color: #fff;
}
.badge-private {
  background: #b0bec5;
}
.badge-reported {
  background: #e74c3c;
}
.diary-info {
  flex: 1;
  padding: 1.2rem 1.2rem 1.2rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.diary-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  word-break: break-all;
  cursor: pointer;
}
.diary-meta {
  font-size: 0.93rem;
  color: #7f8c8d;
  margin-bottom: 0.7rem;
  display: flex;
  gap: 1.2rem;
  align-items: center;
}
.diary-meta i {
  margin-right: 0.3em;
  color: #b0bec5;
}
.diary-preview {
  color: #444;
  font-size: 0.98rem;
  line-height: 1.5;
  margin-top: 0.2rem;
  word-break: break-all;
}
.diary-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.7rem;
}
.diary-actions button {
  background: #f4f8fb;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.1rem;
  font-size: 0.97rem;
  color: #3498db;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4em;
}
.diary-actions button:hover {
  background: #3498db;
  color: #fff;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  margin-top: 2.5rem;
}
.pagination button {
  background: #f4f8fb;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  color: #3498db;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.pagination button:disabled {
  background: #e0e0e0;
  color: #b0bec5;
  cursor: not-allowed;
}
@media (max-width: 600px) {
  .diary-card-list {
    grid-template-columns: 1fr;
  }
  .diary-card {
    flex-direction: column;
    min-height: unset;
  }
  .diary-image-wrapper {
    width: 100%;
    height: 160px;
  }
  .diary-image, .no-image {
    min-width: unset;
    min-height: unset;
    width: 100%;
    height: 100%;
  }
  .diary-info {
    padding: 1rem;
  }
}
</style> 