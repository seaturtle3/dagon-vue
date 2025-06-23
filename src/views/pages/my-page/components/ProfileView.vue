<template>
  <ModalDialog
    :show="showLoginModal"
    title="로그인 필요"
    message="회원정보 조회는 로그인 후 이용 가능합니다."
    confirmText="로그인 페이지로 이동"
    :onConfirm="goToLogin"
  />
  <ModalDialog
    :show="showErrorModal"
    title="오류"
    :message="errorMessage"
    :onConfirm="() => showErrorModal = false"
  />
  <ModalDialog
    :show="showSuccessModal"
    title="성공"
    message="회원정보가 성공적으로 수정되었습니다."
    :onConfirm="handleSuccessConfirm"
  />
  <div class="profile-container">
    <h2 class="page-title">회원정보</h2>
    <div class="profile-form">
      <div class="profile-image" @click="triggerFileInput">
        <img :src="getProfileImageUrl(userInfo.profile_image)" alt="프로필 이미지" />
        <div class="image-upload-overlay" v-if="isEditing">
          <i class="fas fa-camera"></i>
          <span>이미지 변경</span>
        </div>
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleImageChange" 
          accept="image/*" 
          style="display: none"
        />
      </div>

      <div class="form-group">
        <label>아이디</label>
        <input type="text" v-model="userInfo.uid" disabled class="form-control" />
      </div>
      
      <div class="form-group">
        <label>이름</label>
        <input type="text" v-model="userInfo.uname" :disabled="!isEditing" class="form-control" />
      </div>

      <div class="form-group">
        <label>닉네임</label>
        <input 
          type="text" 
          v-model="userInfo.nickname" 
          :disabled="!isEditing" 
          class="form-control" 
          :placeholder="userInfo.nickname ? '' : '닉네임을 입력하세요'"
        />
      </div>

      <div class="form-group">
        <label>이메일</label>
        <input type="email" v-model="userInfo.email" :disabled="!isEditing" class="form-control" />
      </div>

      <div class="form-group">
        <label>전화번호</label>
        <div class="input-group">
          <select v-model="phoneNumbers.phone1" :disabled="!isEditing" class="form-select">
            <option value="010">010</option>
            <option value="011">011</option>
            <option value="016">016</option>
            <option value="017">017</option>
            <option value="018">018</option>
            <option value="019">019</option>
          </select>
          <span class="input-group-text">-</span>
          <input type="text" v-model="phoneNumbers.phone2" maxlength="4" :disabled="!isEditing" class="form-control" />
          <span class="input-group-text">-</span>
          <input type="text" v-model="phoneNumbers.phone3" maxlength="4" :disabled="!isEditing" class="form-control" />
        </div>
      </div>

      <div class="button-group">
        <button v-if="!isEditing" class="btn btn-primary" @click="startEditing">정보 수정</button>
        <template v-else>
          <button class="btn btn-secondary" @click="cancelEditing">취소</button>
          <button class="btn btn-primary" @click="handleSubmit">수정 완료</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { myPageAPI } from '@/api/mypage.js';
import {BASE_URL} from "@/constants/baseUrl.js";
import { useRouter } from 'vue-router';
import ModalDialog from '@/components/common/ModalDialog.vue';

const defaultProfileImage = '/img/default-profile.png';
const API_BASE_URL = `${BASE_URL}`; // API 서버 기본 URL

const isEditing = ref(false);
const fileInput = ref(null);
const originalUserInfo = ref(null);
const showLoginModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref('');
const showSuccessModal = ref(false);

const userInfo = ref({
  uid: '',
  uname: '',
  nickname: '',
  email: '',
  profile_image: defaultProfileImage,
  phone: ''
});

const phoneNumbers = ref({
  phone1: '010',
  phone2: '',
  phone3: ''
});

const selectedImage = ref(null);
const router = useRouter();

const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return defaultProfileImage;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('blob:')) return imagePath;
  return `${API_BASE_URL}/uploads/${imagePath}`;
};

onMounted(async () => {
  await loadUserInfo();
});

const loadUserInfo = async () => {
  try {
    const response = await myPageAPI.getMyInfo();
    console.log('API Response:', response.data);
    
    // 응답 데이터를 userInfo에 매핑
    userInfo.value = {
      uid: response.data.uid || '',
      uname: response.data.uname || '',
      nickname: response.data.nickname || '',
      email: response.data.email || '',
      profile_image: response.data.profile_image || '',
      phone: response.data.phone || ''
    };
    
    // 로그인 정보가 없으면 모달 표시
    if (!userInfo.value.uid) {
      showLoginModal.value = true;
    }
    
    // 전화번호 파싱
    if (response.data.phone) {
      const phone = response.data.phone.replace(/-/g, '');
      if (phone.length >= 10) {
        phoneNumbers.value = {
          phone1: phone.substring(0, 3),
          phone2: phone.substring(3, 7),
          phone3: phone.substring(7)
        };
      }
    }

    // 원본 데이터 저장
    originalUserInfo.value = JSON.parse(JSON.stringify(userInfo.value));
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    showLoginModal.value = true;
  }
};

const triggerFileInput = () => {
  if (isEditing.value) {
    fileInput.value.click();
  }
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImage.value = file;
    userInfo.value.profile_image = URL.createObjectURL(file);
  }
};

const startEditing = () => {
  isEditing.value = true;
  // 현재 상태를 백업
  originalUserInfo.value = JSON.parse(JSON.stringify(userInfo.value));
};

const cancelEditing = () => {
  isEditing.value = false;
  // 원래 데이터로 복원
  userInfo.value = JSON.parse(JSON.stringify(originalUserInfo.value));
  selectedImage.value = null;
  if (userInfo.value.profile_image.startsWith('blob:')) {
    URL.revokeObjectURL(userInfo.value.profile_image);
    userInfo.value.profile_image = originalUserInfo.value.profile_image;
  }
};

const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append('uname', userInfo.value.uname);
    formData.append('nickname', userInfo.value.nickname);
    formData.append('email', userInfo.value.email);
    formData.append('phone1', phoneNumbers.value.phone1);
    formData.append('phone2', phoneNumbers.value.phone2);
    formData.append('phone3', phoneNumbers.value.phone3);
    
    if (selectedImage.value) {
      formData.append('profileImage', selectedImage.value);
    }

    await myPageAPI.updateMyInfo(formData);
    showSuccessModal.value = true;
  } catch (error) {
    errorMessage.value = error.response?.data?.error || '회원정보 수정에 실패했습니다.';
    showErrorModal.value = true;
  }
};

const goToLogin = () => {
  router.push('/login')
}

const handleSuccessConfirm = async () => {
  showSuccessModal.value = false;
  isEditing.value = false;
  selectedImage.value = null;
  await loadUserInfo();
};
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #0d47a1;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 1rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 105, 192, 0.15);
}

.profile-image {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 2rem;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  cursor: pointer;
  border: 4px solid #1976d2;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(13, 71, 161, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-image:hover .image-upload-overlay {
  opacity: 1;
}

.image-upload-overlay i {
  font-size: 24px;
  margin-bottom: 8px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #0d47a1;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #90caf9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.form-control:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2);
  outline: none;
}

.form-control:disabled {
  background: rgba(236, 239, 241, 0.9);
  border-color: #cfd8dc;
  cursor: not-allowed;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.input-group .form-control {
  flex: 1;
}

.input-group-text {
  color: #1565c0;
  font-weight: 500;
}

.form-select {
  padding: 0.75rem;
  border: 2px solid #90caf9;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #0d47a1;
  cursor: pointer;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #1976d2;
  color: white;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.btn-primary:hover {
  background: #1565c0;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #90caf9;
  color: #0d47a1;
}

.btn-secondary:hover {
  background: #64b5f6;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style> 