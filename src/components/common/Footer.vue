<template>
  <footer class="fishing-footer">
    <div class="container-fluid">
      <div class="row g-3">
        <!-- 로고 및 사이트 설명 -->
        <div class="col-md-4 text-center text-md-start">
          <h3 class="fw-bold fs-4 mb-3">DΛGON</h3>
          <p class="footer-desc">낚시의 모든 것!</p>
        </div>

        <!-- 빠른 링크 -->
        <div class="col-md-4 text-center">
          <h5 class="fw-bold mb-3">Legal & Terms</h5>
          <!-- <ul class="quick-links">
            <li><a href="/about">소개</a></li>
            <li><a href="/tips">낚시 팁</a></li>
            <li><a href="/spots">낚시터 찾기</a></li>
          </ul> -->
          <ul class="quick-links">
            <li><a href="/terms">이용약관</a></li>
            <li><a href="/finance-terms">전자금융거래 이용약관</a></li>
            <li><a href="/privacy-policy">개인정보처리방침</a></li>
          </ul>
        </div>

        <!-- 연락처 -->
        <div class="col-md-4 text-center text-md-end contact-info">
          <h5 class="fw-bold mb-3">Contact</h5>
          <p>
            <font-awesome-icon :icon="faEnvelope" class="footer-icon" />
            <span class="footer-label">contact@fishinghaven.com</span>
          </p>
          <p>
            <font-awesome-icon :icon="faPhone" class="footer-icon" />
            <span class="footer-label">123-456-7890</span>
          </p>
          <p>
            <font-awesome-icon :icon="faMapMarkerAlt" class="footer-icon" />
            <span class="footer-label">서울특별시 강남구 낚시로 123</span>
          </p>
        </div>
      </div>

      <!-- 저작권 -->
      <div class="row mt-3">
        <div class="col text-center">
          <p class="copyright mb-0">&copy; 2025 Fishing Haven. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
</script>

<style scoped>
.fishing-footer {
  background:rgb(43, 43, 44);
  color: #b0bed9;
  width: 100%;
  padding: 80px 0 40px 0;
  border-radius: 0;
  box-shadow: 0 -2px 16px rgba(24,49,83,0.04);
}

.fishing-footer .container-fluid {
  width: 100%;
  max-width: calc(1200px + 5rem);
  margin: 0 auto;
  padding: 0 2.5rem
}

.fishing-footer .row {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem 0;
}

.fishing-footer .col-md-4 {
  flex: 1 1 260px;
  min-width: 220px;
  max-width: 100%;
  box-sizing: border-box;
}

.fishing-footer h3, .fishing-footer h5 {
  color: #fff;
  font-weight: 700;
  margin-bottom:2rem;
  letter-spacing: -0.01em;
  line-height: 1.5rem;
}
.fishing-footer h5 {
  font-size: 1.1rem;
}

.fishing-footer p, .fishing-footer ul {
  font-size: 1rem;
  margin-bottom: 0.5em;
  color: #cbcccf;
}
.fishing-footer p strong {
  color: #fff;
  font-weight: 600;
}

.fishing-footer .quick-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  row-gap: 0.5rem;
    column-gap: 1.5rem;
  padding-left: 0;
  margin-bottom: 0.5rem;
}
.fishing-footer .quick-links li {
  display: block;
  white-space: nowrap;
}

.fishing-footer a {
  color: #cbcccf;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}
.fishing-footer a:hover {
  color: #fff;
  text-decoration: none;
}

.fishing-footer .contact-info p {
  color: #cbcccf;
  margin-bottom: 0.2em;
}
.fishing-footer .contact-info p strong {
  color: #fff;
}

.fishing-footer .copyright {
  color: #cbcccf;
  font-size: 0.97rem;
  margin-top: 2.5rem;
  letter-spacing: 0.01em;
}

@media (max-width: 1024px) {
  .fishing-footer .row {
    flex-direction: column;
    align-items: center;
    gap: 2.5rem 0;
  }
  .fishing-footer .col-md-4 {
    text-align: center !important;
    padding: 0 1rem;
  }
  .fishing-footer .container-fluid {
    padding: 0 1rem;
  }
}

@media (max-width: 600px) {
  .fishing-footer {
    padding: 24px 0 10px 0;
  }
  .fishing-footer .container-fluid {
    padding: 0 0.5rem;
  }
  .fishing-footer .quick-links {
    flex-direction: column;
    gap: 0.7rem;
    align-items: center;
  }
  .fishing-footer .col-md-4 {
    padding: 0 0.3rem;
  }
  .fishing-footer h3, .fishing-footer h5 {
    margin-bottom: 0.7em;
  }
}

.footer-icon {
  color: #b0bed9;
  margin-right: 0.4em;
}
</style>