<template>
  <div class="fullscreen-wrapper">
    <div class="card">
      <h1 class="header">문의 목록</h1>
      <table class="inquiry-table">
        <thead>
        <tr>
          <th>번호</th>
          <th>제목</th>
          <th>작성자</th>
          <th>문의유형</th>
          <th>등록일</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(inquiry, index) in inquiries" :key="inquiry.id">
          <td>{{ index + 1 }}</td>
          <td>{{ inquiry.title }}</td>
          <td>{{ inquiry.author }}</td>
          <td>{{ inquiry.type }}</td>
          <td>{{ inquiry.date }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "InquiryList",
  data() {
    return {
      inquiries: [
        { id: 1, title: "상품 문의", author: "홍길동", type: "상품 관련", date: "2025-06-03" },
        { id: 2, title: "예약 취소", author: "김영희", type: "예약 관련", date: "2025-06-01" },
        // 필요시 데이터 추가
      ],
    };
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.fullscreen-wrapper {
  width: 100vw;
  height: 100vh;
  background-color: #e6f3ff; /* skyblue 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  width: 90%;
  max-width: 1000px;
  background-color: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.header {
  font-size: 1.8rem;
  color: #007acc;
  margin-bottom: 20px;
  text-align: center;
}

.inquiry-table {
  width: 100%;
  border-collapse: collapse;
}

.inquiry-table th,
.inquiry-table td {
  padding: 12px 16px;
  border: 1px solid #ddd;
  text-align: left;
}

.inquiry-table th {
  background-color: #d0eaff;
  color: #333;
}

.inquiry-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.inquiry-table tr:hover {
  background-color: #f1faff;
}
</style>