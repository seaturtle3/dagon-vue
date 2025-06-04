<template>
  <div class="container">
    <div class="form-box">
      <h2>문의 등록</h2>

      <!-- 문의 유형 -->
      <div class="form-group">
        <label for="inquiryType">문의 유형</label>
        <select v-model="form.inquiryType" id="inquiryType">
          <option value="PRODUCT">상품 관련</option>
          <option value="BUSINESS">제휴 관련</option>
          <option value="SYSTEM">시스템 관련</option>
          <option value="RESERVATION">예약 관련</option>
          <option value="CANCEL">예약 취소 관련</option>
        </select>
      </div>

      <!-- 폼 -->
      <form @submit.prevent="submitForm">
        <!-- 수신자 -->
        <div class="form-group">
          <label for="receiverType">수신자</label>
          <select v-model="form.receiverType" id="receiverType" required>
            <option value="">-- 선택 --</option>
            <option value="PARTNER">파트너</option>
            <option value="ADMIN">관리자</option>
          </select>
        </div>

        <!-- 업체명 -->
        <div class="form-group" v-if="form.receiverType === 'PARTNER'">
          <label for="partnerName">업체명</label>
          <input
              type="text"
              id="partnerName"
              v-model="form.partnerName"
              placeholder="예: 만선2호"
              required
          />
        </div>

        <!-- 제목 -->
        <div class="form-group">
          <label for="title">제목</label>
          <input type="text" id="title" v-model="form.title" required />
        </div>

        <!-- 내용 -->
        <div class="form-group">
          <label for="content">내용</label>
          <textarea id="content" v-model="form.content" rows="5" required></textarea>
        </div>

        <button type="submit" class="submit-btn">문의 등록</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  inquiryType: 'PRODUCT',
  receiverType: '',
  partnerName: '',
  title: '',
  content: ''
})

const submitForm = async () => {
  try {
    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      },
      body: JSON.stringify(form)
    });

    if (response.ok) {
      alert('문의가 등록되었습니다.');
      location.reload();
    } else {
      const text = await response.text();
      let message = '문의 등록 실패';

      try {
        const error = JSON.parse(text);
        message = '문의 등록 실패: ' + (error.message || text);
      } catch {
        message = '문의 등록 실패: ' + text;
      }

      alert(message);
    }
  } catch (err) {
    alert('오류 발생: ' + err.message);
  }
}
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: 'Segoe UI', sans-serif;
  background-color: #f0f8ff;
}

.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f8ff;
}

.form-box {
  background-color: #ffffff;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 128, 255, 0.15);
  width: 100%;
  max-width: 500px;
}

h2 {
  text-align: center;
  color: #007acc;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
}

input,
select,
textarea {

  width: 100%;
  padding: 10px;
  border: 1px solid #cce6ff;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f9fcff;
}

textarea {
  resize: vertical;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #007acc;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-btn:hover {
  background-color: #005fa3;
}
</style>
