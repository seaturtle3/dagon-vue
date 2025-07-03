<template>
  <footer class="fishing-footer">
    <div class="container-fluid">
      <div class="row g-3">
        <!-- 로고 및 사이트 설명 -->
        <div class="col-md-4 text-center text-md-start">
          <h3 class="fw-bold fs-4 mb-3">Fishing Haven</h3>
          <p class="text-light">
            낚시의 모든 것!
          </p>
        </div>

        <!-- 빠른 링크 -->
        <div class="col-md-4 text-center">
          <h5 class="fw-bold mb-3">빠른 링크</h5>
          <ul class="quick-links">
            <li><a href="/about" class="text-light text-decoration-none">소개</a></li>
            <li><a href="/tips" class="text-light text-decoration-none">낚시 팁</a></li>
            <li><a href="/spots" class="text-light text-decoration-none">낚시터 찾기</a></li>
          </ul>
          <ul class="quick-links">
            <li><a href="/terms" class="text-light text-decoration-none">이용약관</a></li>
            <li><a href="/finance-terms" class="text-light text-decoration-none">전자금융거래 이용약관</a></li>
            <li><a href="/privacy-policy" class="text-light text-decoration-none">개인정보처리방침</a></li>
          </ul>
        </div>

        <!-- 연락처 -->
        <div class="col-md-4 text-center text-md-end">
          <h5 class="fw-bold mb-3">연락처</h5>
          <p class="text-light mb-1">이메일: contact@fishinghaven.com</p>
          <p class="text-light mb-1">전화: 123-456-7890</p>
          <p class="text-light">주소: 서울특별시 강남구 낚시로 123</p>
        </div>
      </div>

      <!-- 저작권 -->
      <div class="row mt-3">
        <div class="col text-center">
          <p class="text-light mb-0">&copy; 2025 Fishing Haven. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.fishing-footer {
  background-color: #1a3c5e; /* 낚시 테마에 어울리는 깊은 바다 색상 */
  color: #ffffff;
  margin-left: 0px;
  width: 100vw;
}

@media (max-width: 768px) {
  .fishing-footer {
    margin-left: 0;
  }
}

.fishing-footer a:hover {
  color: #4da8da; /* 링크 호버 시 밝은 바다 색상 */
  transition: color 0.3s ease;
}

.fishing-footer p, .fishing-footer ul {
  font-size: 0.9rem;
}

.fishing-footer .quick-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding-left: 0;
  margin-bottom: 0.3rem;
}

.fishing-footer .quick-links li {
  display: block;
  white-space: nowrap;
}
</style>