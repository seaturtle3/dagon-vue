<template>
  <div class="fishing-diary-detail-container">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>조행기 정보를 불러오는 중입니다...</p>
    </div>

    <div v-else-if="!diary" class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <p>조행기를 찾을 수 없습니다.</p>
      <button @click="goBack" class="btn btn-primary">목록으로 돌아가기</button>
    </div>

    <div v-else class="fishing-diary-detail">
      <div class="header">
        <div class="header-content">
          <button @click="goBack" class="btn-back" title="목록으로">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div class="header-text">
            <h2>{{ diary.title }}</h2>
            <div class="author-info">
              <i class="fas fa-user-circle"></i>
              <span>{{ diary.user?.nickname || '알 수 없음' }}</span>
              <span class="separator">|</span>
              <i class="fas fa-calendar-alt"></i>
              <span>{{ formatDateTime(diary.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button @click="goBack" class="btn btn-back">
            <i class="fas fa-arrow-left"></i> 목록
          </button>
          <button @click="editDiary" class="btn btn-edit">
            <i class="fas fa-edit"></i> 수정
          </button>
          <button @click="deleteDiary" class="btn btn-danger">
            <i class="fas fa-trash"></i> 삭제
          </button>
        </div>
      </div>

      <!-- 내용 섹션 -->
      <div class="card content-section">
        <h3><i class="fas fa-file-alt"></i> 상세 내용</h3>
        <div class="content-body" v-html="diary.content"></div>
      </div>

      <!-- 이미지 섹션 -->
      <div v-if="diary.images && diary.images.length > 0" class="card images-section">
        <h3><i class="fas fa-images"></i> 이미지 ({{ diary.images.length }}장)</h3>
        <div class="image-gallery">
          <div v-for="image in diary.images" :key="image.id" class="image-item" @click="openImageModal(image)">
            <img 
              :src="
                image.thumbnail 
                  ? image.thumbnail 
                  : image.imageData 
                    ? `data:image/jpeg;base64,${image.imageData}`
                    : image.imageUrl
              " 
              :alt="image.imageName"
            >
            <div class="image-overlay">
              <i class="fas fa-search-plus"></i>
              <span v-if="image.thumbnail" class="thumbnail-badge">대표</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 댓글 섹션 -->
      <div class="card comments-section">
        <h3><i class="fas fa-comments"></i> 댓글 ({{ diary.comments?.length || 0 }}개)</h3>
        <div v-if="diary.comments && diary.comments.length > 0" class="comments-list">
          <div v-for="comment in diary.comments" :key="comment.fdCommentId" class="comment-item">
            <div class="comment-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-author">{{ comment.user?.nickname || '알 수 없음' }}</span>
                <span class="comment-date">{{ formatDateTime(comment.createdAt) }}</span>
              </div>
              <div class="comment-content">{{ comment.comment }}</div>
            </div>
            <div class="comment-actions">
              <button @click="deleteComment(comment.fdCommentId)" class="btn-delete-comment" title="댓글 삭제">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="no-comments">
          <p>등록된 댓글이 없습니다.</p>
        </div>
      </div>
    </div>

    <!-- 이미지 모달 -->
    <div v-if="showImageModal" class="image-modal-overlay" @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <button @click="closeImageModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
        <img :src="selectedImage?.imageUrl" :alt="selectedImage?.imageName">
      </div>
    </div>
    
    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content" @click.stop>
        <h3>삭제 확인</h3>
        <p>정말로 이 {{ deleteTarget === 'diary' ? '조행기' : '댓글' }}을(를) 삭제하시겠습니까?</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="btn-delete">삭제</button>
          <button @click="closeDeleteModal" class="btn-cancel">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '@/lib/axios';

const route = useRoute();
const router = useRouter();

const diary = ref(null);
const loading = ref(true);
const fdId = route.params.fdId;

const showImageModal = ref(false);
const selectedImage = ref(null);

const showDeleteModal = ref(false);
const deleteTarget = ref(''); // 'diary' or 'comment'
const deleteId = ref(null);

const loadDiary = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.get(`/api/admin/fishing-diary/get/${fdId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    diary.value = response.data
    console.log('로드된 조행기:', response.data)
  } catch (error) {
    console.error('조행기 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadDiary);

const goBack = () => {
  router.push('/admin/fishing-diaries');
};

const editDiary = () => {
  router.push(`/admin/fishing-diaries/${fdId}/edit`);
};

const deleteDiary = async () => {
  if (!confirm('정말로 이 조행기를 삭제하시겠습니까?')) {
    return
  }

  try {
    const token = localStorage.getItem('token')
    await axios.delete(`/api/admin/fishing-diary/delete/${fdId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    alert('조행기가 삭제되었습니다.')
    router.push('/admin/fishing-diaries')
  } catch (error) {
    console.error('조행기 삭제 실패:', error)
    alert('조행기 삭제에 실패했습니다: ' + error.response?.data || error.message)
  }
}

const deleteComment = (commentId) => {
  deleteTarget.value = 'comment';
  deleteId.value = commentId;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  try {
    if (deleteTarget.value === 'diary') {
      await axios.delete(`/api/fishing-diary/delete/${deleteId.value}`);
      router.push('/admin/fishing-diaries');
    } else if (deleteTarget.value === 'comment') {
      await axios.delete(`/api/fishing-diary/comments/${deleteId.value}`);
      loadDiary(); // Refresh diary details to show updated comments
    }
  } catch (error) {
    console.error(`Error deleting ${deleteTarget.value}:`, error);
    alert('삭제 중 오류가 발생했습니다.');
  } finally {
    closeDeleteModal();
  }
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deleteTarget.value = '';
  deleteId.value = null;
};

const openImageModal = (image) => {
  selectedImage.value = image;
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
  selectedImage.value = null;
};

const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.fishing-diary-detail-container {
  padding: 2rem;
  background-color: #f4f6f9;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: box-shadow 0.3s ease;
}
.card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 1rem 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.header-text h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #2c3e50;
}
.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #7f8c8d;
  margin-top: 0.5rem;
}
.author-info .separator {
  color: #bdc3c7;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}
.btn-back {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0.5rem;
}
.btn-back:hover {
  color: #2c3e50;
}
.btn-danger {
  background-color: #e74c3c;
  color: white;
}
.btn-danger:hover {
  background-color: #c0392b;
}
.btn-edit {
  background-color: #3498db;
  color: white;
}
.btn-edit:hover {
  background-color: #2980b9;
}

h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0;
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #34495e;
}

.content-body {
  line-height: 1.8;
  color: #34495e;
}
.content-body >>> img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}
.image-item {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
}
.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.image-item:hover img {
  transform: scale(1.1);
}
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.image-item:hover .image-overlay {
  opacity: 1;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
}
.comment-item {
  display: flex;
  gap: 1rem;
}
.comment-avatar {
  font-size: 2rem;
  color: #bdc3c7;
}
.comment-body {
  flex: 1;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
}
.comment-author {
  font-weight: 600;
  color: #2c3e50;
}
.comment-date {
  font-size: 0.8rem;
  color: #95a5a6;
}
.comment-content {
  font-size: 0.95rem;
  color: #34495e;
  line-height: 1.5;
}
.comment-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.comment-item:hover .comment-actions {
  opacity: 1;
}
.btn-delete-comment {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
}

.no-comments {
  text-align: center;
  color: #95a5a6;
  padding: 2rem 0;
}

/* 로딩 및 에러 */
.loading-overlay, .error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  color: #7f8c8d;
}
.spinner {
  border: 4px solid rgba(0,0,0,0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #3498db;
  animation: spin 1s ease infinite;
  margin-bottom: 1rem;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 