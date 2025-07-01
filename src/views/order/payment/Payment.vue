<template>
  <div class="payment-container">
    <div class="payment-header">
      <h1>예약 결제</h1>
    </div>

    <!-- 회원 예약 정보 섹션 (로그인 상태) -->
    <div v-if="reservationInfo && isLoggedIn">
      <h4 class="section-title">선택 상품 정보</h4>
      <div class="user-reservation-info-section">
        <div class="user-reservation-info-grid">
          <div class="user-reservation-info-item">
            <span class="label">상품명:</span>
            <span class="value">{{ reservationInfo.prodName || '상품명 없음' }}</span>
          </div>
          <div class="user-reservation-info-item">
            <span class="label">상품ID:</span>
            <span class="value">{{ reservationInfo.prodId || '-' }}</span>
          </div>
          <div class="user-reservation-info-item">
            <span class="label">상품 주소:</span>
            <span class="value">{{ reservationInfo.prodAddress || '-' }}</span>
          </div>
        </div>
      </div>
      <div class="section-divider"></div>
      <h4 class="section-title">회원 예약 정보</h4>
      <div class="user-reservation-info-section">
        <div class="user-reservation-info-grid">
          <div class="user-reservation-info-item">
            <span class="label">예약자명:</span>
            <span class="value">{{ userInfo.buyer_name || '미입력' }}</span>
          </div>
          <div class="user-reservation-info-item">
            <span class="label">이메일:</span>
            <span class="value">{{ userInfo.buyer_email || '미입력' }}</span>
          </div>
          <div class="user-reservation-info-item">
            <span class="label">연락처:</span>
            <span class="value">{{ userInfo.buyer_tel || '미입력' }}</span>
          </div>
          <div class="user-reservation-info-item">
            <span class="label">예약 날짜:</span>
            <span class="value">{{ formatDate(reservationInfo.fishingAt) }}</span>
          </div>
          <div class="user-reservation-info-item">
            <span class="label">인원수:</span>
            <span class="value">{{ reservationInfo.totalPeople }}명</span>
          </div>
          <div class="user-reservation-info-item">
            <span class="label">옵션1:</span>
            <span class="value">{{ reservationInfo.optionName || '-' }} ({{ reservationInfo.optionCount || 0 }}개)</span>
          </div>
          <div class="user-reservation-info-item" v-if="reservationInfo.optionName2">
            <span class="label">옵션2:</span>
            <span class="value">{{ reservationInfo.optionName2 }} ({{ reservationInfo.optionCount2 }}개)</span>
          </div>
          <div class="user-reservation-info-item" v-if="reservationInfo.optionName3">
            <span class="label">옵션3:</span>
            <span class="value">{{ reservationInfo.optionName3 }} ({{ reservationInfo.optionCount3 }}개)</span>
          </div>
        </div>
      </div>
      <div class="summary-item total-price">
        <span class="label">결제 금액:</span>
        <span class="value">{{ reservationInfo.estimatedPrice?.toLocaleString() }}원</span>
      </div>
    </div>

    <!-- 비회원 예약 정보 섹션 (비로그인 상태) -->
    <div class="reservation-summary" v-if="reservationInfo && !isLoggedIn">
      <!-- 상품 정보 섹션 -->
      <div class="product-info-section">
        <h4>상품 정보</h4>
        <div class="product-info">
          <p><strong>상품명:</strong> {{ reservationInfo.prodName || '상품명 없음' }}</p>
          <p><strong>상품ID:</strong> {{ reservationInfo.prodId || '-' }}</p>
          <p><strong>상품 주소:</strong> {{ reservationInfo.prodAddress || '-' }}</p>
        </div>
      </div>
      <h4>비회원 예약 정보</h4>
      <br>
      
      <!-- 비회원 예약자 정보 입력 섹션 -->
      <div class="user-info-section">
        <h4>예약자 정보 (직접 입력)</h4>
        <div class="user-input-grid">
          <div class="user-input-item">
            <label>예약자명:</label>
            <input type="text" v-model="userInfo.buyer_name" placeholder="예약자명을 입력하세요" required>
          </div>
          <div class="user-input-item">
            <label>이메일:</label>
            <input type="email" v-model="userInfo.buyer_email" placeholder="이메일을 입력하세요" required>
          </div>
          <div class="user-input-item">
            <label>연락처:</label>
            <input type="tel" v-model="userInfo.buyer_tel" placeholder="연락처를 입력하세요" required>
          </div>
        </div>
      </div>

      <!-- 예약 정보 섹션 (자동 입력) -->
      <div class="reservation-info-section">
        <h4>예약 정보</h4>
        <div class="reservation-info-grid">
          <div class="reservation-info-item">
            <span class="label">예약 날짜:</span>
            <span class="value">{{ formatDate(reservationInfo.fishingAt) }}</span>
          </div>
          <div class="reservation-info-item">
            <span class="label">인원수:</span>
            <span class="value">{{ reservationInfo.totalPeople }}명</span>
          </div>
          <div class="reservation-info-item">
            <span class="label">옵션1:</span>
            <span class="value">{{ reservationInfo.optionName || '-' }} ({{ reservationInfo.optionCount || 0 }}개)</span>
          </div>
          <div class="reservation-info-item" v-if="reservationInfo.optionName2">
            <span class="label">옵션2:</span>
            <span class="value">{{ reservationInfo.optionName2 }} ({{ reservationInfo.optionCount2 }}개)</span>
          </div>
          <div class="reservation-info-item" v-if="reservationInfo.optionName3">
            <span class="label">옵션3:</span>
            <span class="value">{{ reservationInfo.optionName3 }} ({{ reservationInfo.optionCount3 }}개)</span>
          </div>
        </div>
      </div>

      <!-- 결제 금액 항상 표시 -->
      <div class="summary-item total-price">
        <span class="label">결제 금액:</span>
        <span class="value">{{ reservationInfo.estimatedPrice?.toLocaleString() }}원</span>
      </div>
    </div>

    <div class="payment-actions">
      <div class="agreement-check">
        <input type="checkbox" id="agreeCheck" v-model="isAgreed">
        <label for="agreeCheck">위 상품 정보와 예약 정보를 확인하였고 결제에 동의합니다.</label>
      </div>
    </div>
    <div class="payment-buttons">
      <button class="btn-payment" @click="handlePayment" :disabled="!reservationInfo || !isUserInfoValid || !isAgreed">
        결제하기
      </button>
      <button class="btn-cancel" @click="goBack">
        취소
      </button>
    </div>
  </div>
</template>

<script>
import {BASE_URL} from "@/constants/baseUrl.js";
import { useAuthStore } from '@/store/login/loginStore.js';
import { myPageAPI } from '@/api/mypage.js';
import { partnerService } from '@/api/partner.js';
import api from '@/lib/axios';
import { useUserStore } from '@/store/inquiries/userStore.js';

export default {
  name: "Payments",
  data() {
    return {
      reservationInfo: null,
      userInfo: {
        buyer_name: '',
        buyer_email: '',
        buyer_tel: ''
      },
      authStore: null,
      isLoggedIn: false,
      isAgreed: false
    }
  },
  computed: {
    isUserInfoValid() {
      // 모든 필드가 비어있지 않은지 체크
      return this.userInfo.buyer_name && this.userInfo.buyer_email && this.userInfo.buyer_tel;
    }
  },
  async mounted() {
    // Auth store 초기화
    this.authStore = useAuthStore();

    console.log('authStore.user:', this.authStore.user);
    
    // 로그인 상태 확인 및 사용자 정보 동기화
    await this.checkAuthStatus();
    
    console.log('=== URL 쿼리 파라미터 확인 ===');
    console.log('전체 쿼리:', this.$route.query);
    console.log('optionId 쿼리값:', this.$route.query.optionId);
    console.log('optionId2 쿼리값:', this.$route.query.optionId2);
    console.log('optionId3 쿼리값:', this.$route.query.optionId3);
    
    // URL 쿼리 파라미터에서 예약 및 상품 정보 가져오기
    this.reservationInfo = {
      fishingAt: this.$route.query.fishingAt,
      adultCount: parseInt(this.$route.query.adultCount) || 0,
      childCount: parseInt(this.$route.query.childCount) || 0,
      totalPeople: parseInt(this.$route.query.totalPeople) || 0,
      estimatedPrice: 0,
      prodId: this.$route.query.prodId || '',
      prodName: this.$route.query.prodName || '',
      prodAddress: this.$route.query.prodAddress || '',
      prodPostcode: this.$route.query.prodPostcode || '',
      optionId: this.$route.query.optionId || '',
      optionName: this.$route.query.optionName || '',
      optionPrice: parseInt(this.$route.query.optionPrice) || 0,
      optionCount: parseInt(this.$route.query.optionCount) || 0,
    }

    console.log('=== 초기 reservationInfo 설정 ===');
    console.log('설정된 optionId:', this.reservationInfo.optionId);
    console.log('설정된 optionName:', this.reservationInfo.optionName);
    console.log('설정된 optionCount:', this.reservationInfo.optionCount);

    // prodId가 있으면 상품 상세 정보 DB에서 가져오기 (우선순위 높음)
    if (this.reservationInfo.prodId) {
      try {
        console.log('상품 정보 조회 시작 - prodId:', this.reservationInfo.prodId);
        const res = await partnerService.getProductDetail(this.reservationInfo.prodId);
        console.log('상품 정보 조회 결과:', res);
        
        if (res.data) {
          // DB에서 가져온 정보로 상품 정보 업데이트
          this.reservationInfo.prodName = res.data.prod_name || res.data.name || this.reservationInfo.prodName;
          this.reservationInfo.prodId = res.data.prod_id || res.data.id || this.reservationInfo.prodId;
          this.reservationInfo.prodAddress = res.data.prod_address || res.data.address || this.reservationInfo.prodAddress;
          this.reservationInfo.prodPostcode = res.data.prod_postcode || res.data.postcode || this.reservationInfo.prodPostcode;
          this.reservationInfo.boatName = res.data.boatName || res.data.boat_name || '';

          // 옵션 자동 세팅: 옵션이 1개 이상 있으면 첫 번째 옵션의 opt_id를 자동 세팅
          if (res.data.options && res.data.options.length > 0) {
            this.reservationInfo.optionId = res.data.options[0].opt_id || res.data.options[0].id;
            this.reservationInfo.optionName = res.data.options[0].opt_name || res.data.options[0].name || '';
            this.reservationInfo.optionPrice = res.data.options[0].opt_price || 0;
          } else {
            // 옵션이 없으면 예약 불가
            alert('이 상품은 예약 가능한 옵션이 없습니다. 관리자에게 문의하세요.');
            this.$router.push('/reservation-calendar');
            return;
          }

          console.log('DB에서 업데이트된 상품 정보:', {
            prodName: this.reservationInfo.prodName,
            prodId: this.reservationInfo.prodId,
            prodAddress: this.reservationInfo.prodAddress,
            prodPostcode: this.reservationInfo.prodPostcode,
            optionId: this.reservationInfo.optionId,
            optionName: this.reservationInfo.optionName,
            optionPrice: this.reservationInfo.optionPrice
          });
        }
      } catch (e) {
        console.error('상품 정보 조회 실패:', e);
        // DB 조회 실패 시 쿼리 파라미터의 정보를 유지
        console.log('쿼리 파라미터의 상품 정보를 사용합니다.');
      }
    } else {
      console.log('prodId가 없어 상품 정보를 가져올 수 없습니다.');
    }

    // 옵션 가격 합산하여 estimatedPrice 재계산
    const adultCount = parseInt(this.$route.query.adultCount) || 0;
    const childCount = parseInt(this.$route.query.childCount) || 0;
    const ADULT_PRICE = 100; // 실제 단가로 교체
    const CHILD_PRICE = 50;  // 실제 단가로 교체

    const optionCount = parseInt(this.$route.query.optionCount) || 0;
    const optionPrice = parseInt(this.$route.query.optionPrice) || 0;
    const optionCount2 = parseInt(this.$route.query.optionCount2) || 0;
    const optionPrice2 = parseInt(this.$route.query.optionPrice2) || 0;
    const optionCount3 = parseInt(this.$route.query.optionCount3) || 0;
    const optionPrice3 = parseInt(this.$route.query.optionPrice3) || 0;

    const peoplePrice = (adultCount * ADULT_PRICE) + (childCount * CHILD_PRICE);
    const optionsPrice = (optionCount * optionPrice) + (optionCount2 * optionPrice2) + (optionCount3 * optionPrice3);

    this.reservationInfo.estimatedPrice = peoplePrice + optionsPrice;

    // 예약 정보가 없으면 이전 페이지로 이동
    if (!this.reservationInfo.fishingAt) {
      alert("예약 정보가 없습니다.");
      this.$router.push('/reservation-calendar');
      return;
    }

    // 로그인된 사용자 정보만 자동 입력, 비회원은 빈 값 유지
    if (this.isLoggedIn) {
      await this.loadUserInfo();
    } else {
      this.userInfo = {
        buyer_name: '',
        buyer_email: '',
        buyer_tel: ''
      };
    }

    if (!window.IMP) {
      const script = document.createElement("script");
      script.src = "https://cdn.iamport.kr/v1/iamport.js";
      script.onload = () => {
        window.IMP.init("imp64386158");
      };
      document.head.appendChild(script);
    } else {
      window.IMP.init("imp64386158");
    }

    this.reservationInfo.optionName2 = this.$route.query.optionName2 || '';
    this.reservationInfo.optionCount2 = parseInt(this.$route.query.optionCount2) || 0;
    this.reservationInfo.optionName3 = this.$route.query.optionName3 || '';
    this.reservationInfo.optionCount3 = parseInt(this.$route.query.optionCount3) || 0;

    console.log('=== 최종 reservationInfo 설정 완료 ===');
    console.log('최종 optionId:', this.reservationInfo.optionId);
    console.log('최종 optionName:', this.reservationInfo.optionName);
    console.log('최종 optionCount:', this.reservationInfo.optionCount);
  },
  methods: {
    async loadUserInfo() {
      try {
        console.log('사용자 정보 로드 시작...');
        
        // 1. 먼저 Auth store에서 사용자 정보 확인
        if (this.authStore.isAuthenticated && this.authStore.user) {
          console.log('Auth store에서 사용자 정보 확인:', this.authStore.user);
          const user = this.authStore.user;
          this.userInfo.buyer_name = user.uname || user.name || '';
          this.userInfo.buyer_email = user.email || '';
          this.userInfo.buyer_tel = user.phone || user.tel || '';
          
          // 로그인된 사용자는 항상 API에서 최신 정보를 가져옴
          await this.loadUserInfoFromAPI();
          this.isLoggedIn = true;
        } else {
          // 2. localStorage에서 사용자 정보 확인
          const storedUserInfo = localStorage.getItem('userInfo');
          if (storedUserInfo) {
            console.log('localStorage에서 사용자 정보 확인');
            const user = JSON.parse(storedUserInfo);
            this.userInfo.buyer_name = user.uname || user.name || '';
            this.userInfo.buyer_email = user.email || '';
            this.userInfo.buyer_tel = user.phone || user.tel || '';
            
            // 토큰이 있으면 API에서 최신 정보를 가져옴
            const token = localStorage.getItem('token');
            if (token) {
              await this.loadUserInfoFromAPI();
              this.isLoggedIn = true;
            } else {
              this.isLoggedIn = false;
            }
          } else {
            // 3. 토큰이 있으면 API를 통해 사용자 정보 가져오기
            const token = localStorage.getItem('token');
            if (token) {
              await this.loadUserInfoFromAPI();
              this.isLoggedIn = true;
            } else {
              this.isLoggedIn = false;
            }
          }
        }
        
        console.log('최종 사용자 정보:', this.userInfo);
        console.log('로그인 상태:', this.isLoggedIn);
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
        this.isLoggedIn = false;
      }
    },

    async loadUserInfoFromAPI() {
      try {
        console.log('API를 통해 사용자 정보 가져오기 시작...');
        const response = await myPageAPI.getMyInfo();
        console.log('API 응답3:', response);
        
        if (response.data) {
          const userData = response.data;
          console.log('API에서 받은 사용자 데이터:', userData);
          
          // DB에서 받은 정보로 사용자 정보 업데이트
          this.userInfo.buyer_name = userData.uname || userData.name || '';
          this.userInfo.buyer_email = userData.email || '';
          this.userInfo.buyer_tel = userData.phone || userData.tel || '';
          
          console.log('DB에서 업데이트된 사용자 정보:', this.userInfo);
          
          // 로그인 상태 확인
          if (this.userInfo.buyer_name) {
            this.isLoggedIn = true;
            console.log('DB 정보로 로그인 상태 확인됨');
          }
        }
      } catch (error) {
        console.error('API를 통한 사용자 정보 로드 실패:', error);
        console.log('기존 정보를 유지합니다.');
        
        // API 호출 실패 시 토큰이 있으면 로그인 상태로 간주
        const token = localStorage.getItem('token');
        if (token && this.userInfo.buyer_name) {
          this.isLoggedIn = true;
        }
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      // YYYY-MM-DD 형식의 문자열을 Date 객체로 변환
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month는 0부터 시작하므로 -1
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    },

    handlePayment() {
      const IMP = window.IMP;
      if (!IMP) {
        alert("결제 모듈이 아직 로드되지 않았습니다.");
        return;
      }

      if (!this.reservationInfo) {
        alert("예약 정보가 없습니다.");
        return;
      }
      if (!this.isUserInfoValid) {
        alert("예약자 정보를 모두 입력해주세요.");
        return;
      }

      const userStore = useUserStore();
      const uid = userStore.user?.uid;

      IMP.request_pay(
          {
            pg: "html5_inicis.INIpayTest",
            pay_method: "card",
            merchant_uid: "RESV-" + new Date().getTime(),
            name: `낚시 예약 (${this.formatDate(this.reservationInfo.fishingAt)})`,
            amount: this.reservationInfo.estimatedPrice,
            buyer_email: this.userInfo.buyer_email,
            buyer_name: this.userInfo.buyer_name,
            buyer_tel: this.userInfo.buyer_tel,
            buyer_addr: this.reservationInfo.prodAddress,
            buyer_postcode: this.reservationInfo.prodPostcode,
            m_redirect_url: `${BASE_URL}/payments/result`,
          },
          (rsp) => {
            if (rsp.success) {
              // 결제 성공 시 처리
              this.handlePaymentSuccess(rsp);
            } else {
              // 결제 실패 시 처리
              this.handlePaymentFailure(rsp);
            }
          }
      );
    },

    handlePaymentSuccess(rsp) {
      console.log("결제 성공:", rsp);
      alert("결제가 성공했습니다!");

      // 1. 결제 검증(백엔드) 진행
      this.verifyAndSavePayment(rsp);
    },

    async verifyAndSavePayment(rsp) {
      try {
        // 백엔드 결제 검증 API 호출
        const verifyRes = await myPageAPI.verifyPayment({
          impUid: rsp.imp_uid,
          merchantUid: rsp.merchant_uid,
          amount: rsp.paid_amount,
          buyerName: rsp.buyer_name,
          status: rsp.status,
          payMethod: this.getPaymentsMethod(rsp.pay_method),
          paidAt: rsp.paid_at
        });
        
        console.log('결제 검증 응답:', verifyRes.data);
        
        if (verifyRes.data && verifyRes.data.success === true) {
          // 검증 성공 시 예약 저장 (paymentId 전달)
          this.saveReservation(rsp, verifyRes.data.paymentId);
        } else {
          alert("결제 검증에 실패했습니다. 관리자에게 문의하세요.");
        }
      } catch (error) {
        alert("결제 검증 중 오류가 발생했습니다. 관리자에게 문의하세요.");
        console.error("결제 검증 오류:", error);
      }
    },

    handlePaymentFailure(rsp) {
      console.log("결제 실패:", rsp);
      alert(`결제에 실패했습니다: ${rsp.error_msg}`);
    },

    async saveReservation(paymentResult, paymentId) {
      try {
        console.log('=== 예약 데이터 처리 시작 ===');
        console.log('원본 reservationInfo:', this.reservationInfo);
        console.log('optionId 원본값:', this.reservationInfo.optionId);
        console.log('optionId 타입:', typeof this.reservationInfo.optionId);
        console.log('백엔드에서 받은 paymentId:', paymentId);
        
        // Long 타입 필드는 반드시 Number로 변환, 'default'나 빈 값이면 null
        const productId = this.reservationInfo.prodId && this.reservationInfo.prodId !== 'default' ? Number(this.reservationInfo.prodId) : null;
        const productOptionId = this.reservationInfo.optionId && this.reservationInfo.optionId !== 'default' && this.reservationInfo.optionId !== '' ? Number(this.reservationInfo.optionId) : null;
        // 백엔드에서 받은 paymentId 사용
        const finalPaymentId = paymentId ? Number(paymentId) : null;
        const numPerson = this.reservationInfo.totalPeople ? Number(this.reservationInfo.totalPeople) : 0;

        console.log('처리된 productId:', productId);
        console.log('처리된 productOptionId:', productOptionId);
        console.log('처리된 paymentId:', finalPaymentId);
        console.log('처리된 numPerson:', numPerson);

        // 옵션이 없으면 예약 진행 불가
        if (!productOptionId) {
          alert('예약 가능한 옵션이 없습니다. 옵션을 선택해주세요.');
          return;
        }

        // fishingAt을 LocalDateTime 형식으로 수정 (시간 포함)
        const fishingAt = this.reservationInfo.fishingAt + 'T00:00:00';

        const reservationData = {
          prodId : productId,
          optionId : productOptionId,
          numPerson : numPerson,
          fishingAt: fishingAt, // LocalDateTime 형식
          paidAt: this.toLocalDateTimeString(new Date(paymentResult.paid_at * 1000)),
          reservationStatus: 'PAID',
          paymentsMethod: this.getPaymentsMethod(paymentResult.pay_method),
          paymentId: finalPaymentId
        };

        // 실제 서버로 보내는 데이터 구조를 명확하게 콘솔에 출력
        console.log('=== 서버로 전송할 reservationData ===');
        console.log(JSON.stringify(reservationData, null, 2));
        console.log('===================================');

        const token = localStorage.getItem('token');
        const response = await api.post(
          `${BASE_URL}/api/reservation`,
          reservationData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        this.$router.push({
          name: 'PaymentResult',
          query: {
            success: 'true',
            reservationId: response.data.reservationId || 'temp-id',
            productName: this.reservationInfo.prodName,
            productId: this.reservationInfo.prodId,
            productAddress: this.reservationInfo.prodAddress,
            userName: this.userInfo.buyer_name,
            email: this.userInfo.buyer_email,
            phone: this.userInfo.buyer_tel,
            fishingAt: this.reservationInfo.fishingAt,
            totalPeople: this.reservationInfo.totalPeople,
            optionName: this.reservationInfo.optionName,
            optionCount: this.reservationInfo.optionCount,
            estimatedPrice: this.reservationInfo.estimatedPrice
          }
        });
      } catch (error) {
        console.error("예약 저장 실패:", error);
        if (error.response) {
          console.error("서버 응답:", error.response.data);
        }
        alert("예약 정보 저장에 실패했습니다.");
      }
    },

    getPaymentsMethod(payMethod) {
      if (payMethod === 'card') return 'CARD';
      if (payMethod === 'kakaopay') return 'KAKAO_PAY';
      if (payMethod === 'trans' || payMethod === 'bank_transfer') return 'BANK_TRANSFER';
      return 'CARD';
    },

    goBack() {
      this.$router.push('/reservation-calendar');
    },

    async checkAuthStatus() {
      try {
        console.log('로그인 상태 확인 시작...');
        
        // Auth store에서 로그인 상태 확인
        if (!this.authStore.isAuthenticated) {
          console.log('Auth store에서 인증되지 않음, 토큰 확인 중...');
          
          // 토큰이 있는지 확인
          const token = localStorage.getItem('token');
          if (token) {
            console.log('토큰 발견, 인증 상태 복원 시도...');
            await this.authStore.checkAuth();
          } else {
            console.log('토큰이 없음, 로그인 필요');
          }
        } else {
          console.log('이미 인증된 상태');
        }
        
        console.log('최종 인증 상태:', this.authStore.isAuthenticated);
        console.log('사용자 정보:', this.authStore.user);
        
        // 로그인 상태에 따라 isLoggedIn 설정
        if (this.authStore.isAuthenticated && this.authStore.user) {
          this.isLoggedIn = true;
          console.log('로그인 상태로 설정됨');
        } else {
          this.isLoggedIn = false;
          console.log('비로그인 상태로 설정됨');
        }
      } catch (error) {
        console.error('인증 상태 확인 실패:', error);
        this.isLoggedIn = false;
      }
    },

    toLocalDateTimeString(date) {
      const pad = n => n.toString().padStart(2, '0');
      return (
        date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds())
      );
    },
  },
};
</script>

<style scoped>
.payment-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.payment-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.payment-header h1 {
  color: #333;
  margin: 0;
}

.reservation-summary {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.reservation-summary h3 {
  margin: 0 0 1rem 0;
  color: #333;
  text-align: center;
}

/* 예약자 정보 섹션 스타일 */
.user-info-section {
  background: #e8f4fd;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #007BFF;
}

.user-info-section h4 {
  margin: 0 0 0.75rem 0;
  color: #007BFF;
  font-size: 1rem;
  font-weight: 600;
}

.user-info-grid {
  display: grid;
  gap: 0.5rem;
}

.user-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid #d1ecf1;
}

.user-info-item:last-child {
  border-bottom: none;
}

.user-info-item .label {
  font-weight: 600;
  color: #495057;
  min-width: 80px;
}

.user-info-item .value {
  color: #333;
  font-weight: 500;
  text-align: right;
}

/* 예약 정보 섹션 스타일 */
.reservation-info-section {
  background: #e8f4fd;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #007BFF;
}

.reservation-info-section h4 {
  margin: 0 0 0.75rem 0;
  color: #007BFF;
  font-size: 1rem;
  font-weight: 600;
}

.reservation-info-grid {
  display: grid;
  gap: 0.5rem;
}

.reservation-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid #d1ecf1;
}

.reservation-info-item:last-child {
  border-bottom: none;
}

.reservation-info-item .label {
  font-weight: 600;
  color: #495057;
  min-width: 80px;
}

.reservation-info-item .value {
  color: #333;
  font-weight: 500;
  text-align: right;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total-price {
  border-top: 2px solid #007BFF;
  border-bottom: none;
  margin-top: 1rem;
  padding-top: 1rem;
  font-weight: bold;
  font-size: 1.1rem;
}

.label {
  font-weight: 600;
  color: #555;
}

.value {
  color: #333;
  font-weight: 500;
}

.total-price .value {
  color: #007BFF;
  font-size: 1.2rem;
}

.payment-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-payment, .btn-cancel {
  padding: 12px 30px;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn-payment {
  background: #007BFF;
  color: white;
}

.btn-payment:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}

.btn-payment:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #545b62;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108,117,125,0.3);
}

/* 비회원 예약자 정보 입력 스타일 */
.user-input-grid {
  display: grid;
  gap: 0.75rem;
}

.user-input-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-input-item label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.user-input-item input {
  padding: 0.5rem;
  border: 1px solid #d1ecf1;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
}

.user-input-item input:focus {
  outline: none;
  border-color: #007BFF;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.user-input-item input::placeholder {
  color: #999;
  font-size: 0.85rem;
}

.product-info-section {
  background: #eaf6ff;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
  padding: 18px 24px 12px 24px;
  margin-bottom: 18px;
}
.product-info-section h4 {
  color: #0080ff;
  font-size: 1.08rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}
.product-info {
  font-size: 0.98rem;
  color: #222;
}
.product-info p {
  margin: 4px 0;
}
.product-info strong {
  color: #0080ff;
  font-weight: 600;
}

.user-reservation-info-section {
  background: #e8f4fd;
  border-radius: 8px;
  border-left: 4px solid #007BFF;
  padding: 18px 24px 12px 24px;
  margin-bottom: 18px;
}
.user-reservation-info-grid {
  display: grid;
  gap: 0.5rem;
}
.user-reservation-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid #d1ecf1;
  font-size: 16px;
  color: #222;
}
.user-reservation-info-item:last-child {
  border-bottom: none;
}
.user-reservation-info-item .label {
  font-weight: 600;
  color: #222;
  min-width: 80px;
  font-size: 16px;
}
.user-reservation-info-item .value {
  color: #222;
  font-weight: 400;
  text-align: right;
  font-size: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 10px;
}

.section-divider {
  border-bottom: 1.5px solid #e0e0e0;
  margin: 18px 0 18px 0;
}

.agreement-check {
  display: flex;
  align-items: center;
  margin-top: 40px;
  margin-bottom: 12px;
  font-size: 15px;
  color: #222;
}
.agreement-check input[type="checkbox"] {
  margin-right: 8px;
  width: 18px;
  height: 18px;
}
.payment-buttons {
  display: flex;
  gap: 12px;
  margin-top: 48px;
  justify-content: center;
}
</style>
