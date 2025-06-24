<template>
  <div class="additional-info-container">
    <div class="additional-info-box">
      <!-- 로고 -->
      <div class="logo-section">
        <h1 class="logo">DAGON</h1>
        <p class="subtitle">낚시의 모든 것</p>
      </div>

      <div class="form-container">
        <h2 class="form-title">회원정보 입력 및 수정</h2>
        <form @submit.prevent="handleSubmit" class="additional-info-form">
          <div class="profile-image" @click="triggerFileInput">
            <img :src="getProfileImageUrl(userInfo.profile_image)" alt="프로필 이미지" />
            <div class="image-upload-overlay">
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
            <label>이름 *</label>
            <input v-model="userInfo.uname" type="text" required :disabled="loading" />
          </div>

          <div class="form-group">
            <label>닉네임 *</label>
            <input v-model="userInfo.nickname" type="text" required :disabled="loading" />
            </div>

          <div class="form-group">
            <label>이메일</label>
            <input v-model="userInfo.email" type="email" disabled />
          </div>

          <div class="form-group">
            <label>전화번호 *</label>
            <div class="input-group">
              <select v-model="phoneNumbers.phone1" :disabled="loading">
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="016">016</option>
                <option value="017">017</option>
                <option value="018">018</option>
                <option value="019">019</option>
              </select>
              <span class="input-group-text">-</span>
              <input type="text" v-model="phoneNumbers.phone2" maxlength="4" :disabled="loading" />
              <span class="input-group-text">-</span>
              <input type="text" v-model="phoneNumbers.phone3" maxlength="4" :disabled="loading" />
            </div>
          </div>

          <button type="submit" class="submit-button" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span>{{ loading ? '처리 중...' : '수정 완료' }}</span>
          </button>
        </form>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BASE_URL } from '@/constants/baseUrl.js';
import { useRouter } from 'vue-router';
import axios from '@/lib/axios'; // 실제 axios 인스턴스 경로에 맞게 수정
import { myPageAPI } from '@/api/mypage.js';

const defaultProfileImage = '/img/default-profile.png';
const API_BASE_URL = `${BASE_URL}`;
const router = useRouter();

const loading = ref(false);
const errorMessage = ref('');
const fileInput = ref(null);
const selectedImage = ref(null);

const userInfo = ref({
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

const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return defaultProfileImage;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('blob:')) return imagePath;
  return `${API_BASE_URL}/uploads/${imagePath}`;
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImage.value = file;
    userInfo.value.profile_image = URL.createObjectURL(file);
  }
};

onMounted(async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/mypage', {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    userInfo.value = {
      uname: response.data.uname || '',
      nickname: response.data.nickname || '',
      email: response.data.email || '',
      profile_image: response.data.profile_image || defaultProfileImage,
      phone: response.data.phone || ''
    };
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
  } catch (error) {
    errorMessage.value = '회원 정보를 불러오지 못했습니다.';
  }
});

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = '';
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
    router.push('/');
  } catch (error) {
    console.error('회원정보 수정 에러:', error, error.response);
    errorMessage.value = error.response?.data?.error || '회원정보 수정에 실패했습니다.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.additional-info-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #f8fafc 100%);
}

.additional-info-box {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem 2rem 2rem;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(25, 118, 210, 0.10);
  position: relative;
}

.logo-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo {
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 0.2rem;
  color: #1976d2;
  letter-spacing: 2px;
}

.subtitle {
  color: #90caf9;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.form-container {
  animation: fadeIn 0.3s ease;
}

.form-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  text-align: center;
  color: #1976d2;
  letter-spacing: 1px;
}

.profile-image {
  position: relative;
  width: 110px;
  height: 110px;
  margin: 0 auto 1.5rem auto;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.13);
  cursor: pointer;
  border: 3px solid #90caf9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  transition: border-color 0.2s;
}
.profile-image:hover {
  border-color: #1976d2;
}
.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-upload-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(25, 118, 210, 0.55);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 1.1rem;
  pointer-events: none;
}
.profile-image:hover .image-upload-overlay {
  opacity: 1;
  pointer-events: auto;
}
.image-upload-overlay i {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.additional-info-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  margin-bottom: 0.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: #1976d2;
  font-size: 1rem;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid #bbdefb;
  border-radius: 7px;
  font-size: 1rem;
  background: #f8fafc;
  transition: border-color 0.2s;
}
.form-group input:focus,
.form-group select:focus {
  border-color: #1976d2;
  outline: none;
}
.form-group input:disabled {
  background: #f0f2f5;
  color: #aaa;
}
.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}
.input-group select,
.input-group input {
  flex: 1 1 0;
  min-width: 0;
}
.input-group select {
  max-width: 90px;
}
.input-group input[type="text"] {
  max-width: 110px;
  text-align: center;
}
.input-group-text {
  color: #1976d2;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0 4px;
}

.submit-button {
  padding: 0.85rem;
  background: linear-gradient(90deg, #1976d2 60%, #64b5f6 100%);
  color: white;
  border: none;
  border-radius: 7px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.10);
  transition: background 0.2s, transform 0.2s;
}
.submit-button:hover:not(:disabled) {
  background: linear-gradient(90deg, #1565c0 60%, #42a5f5 100%);
  transform: translateY(-2px);
}
.submit-button:disabled {
  background: #b0bec5;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  margin-top: 1.2rem;
  padding: 0.85rem;
  background-color: #fff2f0;
  border: 1.5px solid #ffbdbd;
  border-radius: 6px;
  color: #e53935;
  font-size: 0.97rem;
  text-align: center;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .additional-info-box {
    padding: 1.2rem 0.5rem 1.5rem 0.5rem;
    max-width: 98vw;
  }
  .profile-image {
    width: 80px;
    height: 80px;
  }
  .form-title {
    font-size: 1.05rem;
  }
  .input-group {
    flex-direction: row;
    gap: 0.3rem;
  }
  .input-group select {
    max-width: 70px;
  }
  .input-group input[type="text"] {
    max-width: 70px;
  }
}
</style> 