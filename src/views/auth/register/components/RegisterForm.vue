<template>
  <div class="register-container">
    <div class="register-form">
      <h2 class="text-center mb-4">회원가입</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group mb-3">
          <label for="uid" class="form-label">아이디 <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-user"></i>
            </span>
            <input
              type="text"
              class="form-control"
              id="uid"
              v-model="formData.uid"
              required
              placeholder="아이디를 입력하세요"
              pattern="^[a-zA-Z0-9]{4,20}$"
              @input="validateId"
            />
          </div>
          <small class="form-text text-muted">4~20자의 영문 대소문자와 숫자만 사용 가능합니다.</small>
          <div v-if="validationErrors.uid" class="text-danger mt-1">
            {{ validationErrors.uid }}
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="upw" class="form-label">비밀번호 <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-lock"></i>
            </span>
            <input
              type="password"
              class="form-control"
              id="upw"
              v-model="formData.upw"
              required
              placeholder="비밀번호를 입력하세요"
              @input="validatePassword"
            />
          </div>
          <small class="form-text text-muted">8자 이상의 영문 대소문자와 숫자를 포함해야 합니다.</small>
          <div v-if="validationErrors.upw" class="text-danger mt-1">
            {{ validationErrors.upw }}
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="confirmPassword" class="form-label">비밀번호 확인 <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-lock"></i>
            </span>
            <input
              type="password"
              class="form-control"
              id="confirmPassword"
              v-model="formData.confirmPassword"
              required
              placeholder="비밀번호를 다시 입력하세요"
              @input="validatePasswordConfirm"
            />
          </div>
          <div v-if="validationErrors.confirmPassword" class="text-danger mt-1">
            {{ validationErrors.confirmPassword }}
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="uname" class="form-label">이름 <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-user"></i>
            </span>
            <input
              type="text"
              class="form-control"
              id="uname"
              v-model="formData.uname"
              required
              placeholder="이름을 입력하세요"
              @input="validateName"
            />
          </div>
          <div v-if="validationErrors.uname" class="text-danger mt-1">
            {{ validationErrors.uname }}
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="email" class="form-label">이메일 <span class="text-danger">*</span></label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-envelope"></i>
            </span>
            <input
              type="text"
              class="form-control"
              id="emailId"
              v-model="formData.emailId"
              required
              placeholder="이메일"
            />
            <span class="input-group-text">@</span>
            <select class="form-select" v-model="formData.emailDomain">
              <option value="">선택하세요</option>
              <option value="naver.com">naver.com</option>
              <option value="gmail.com">gmail.com</option>
              <option value="daum.net">daum.net</option>
              <option value="hanmail.net">hanmail.net</option>
              <option value="custom">직접입력</option>
            </select>
          </div>
          <div v-if="formData.emailDomain === 'custom'" class="mt-2">
            <input
              type="text"
              class="form-control"
              v-model="formData.customEmailDomain"
              placeholder="도메인을 입력하세요"
            />
          </div>
          <div v-if="validationErrors.email" class="text-danger mt-1">
            {{ validationErrors.email }}
          </div>
        </div>

        <div class="form-group mb-4">
          <label for="phone" class="form-label">전화번호 <span class="text-danger">*</span></label>
          <div class="input-group">
            <select class="form-select" style="max-width: 100px;" v-model="formData.phone1">
              <option value="010">010</option>
              <option value="011">011</option>
              <option value="016">016</option>
              <option value="017">017</option>
              <option value="018">018</option>
              <option value="019">019</option>
            </select>
            <span class="input-group-text">-</span>
            <input
              type="text"
              class="form-control"
              v-model="formData.phone2"
              maxlength="4"
              required
              placeholder="1234"
              @input="validatePhone"
            />
            <span class="input-group-text">-</span>
            <input
              type="text"
              class="form-control"
              v-model="formData.phone3"
              maxlength="4"
              required
              placeholder="5678"
              @input="validatePhone"
            />
          </div>
          <div v-if="validationErrors.phone" class="text-danger mt-1">
            {{ validationErrors.phone }}
          </div>
        </div>

        <!-- 약관 동의 체크박스 -->
        <div class="form-group mb-3">
          <div class="form-check">
            <input type="checkbox" id="agreeTerms" v-model="agreeTerms" class="form-check-input" />
            <label for="agreeTerms" class="form-check-label">
              <span class="link-text" @click.prevent="openTermsModal">이용약관</span> 동의 (필수)
            </label>
          </div>
          <div class="form-check">
            <input type="checkbox" id="agreePrivacy" v-model="agreePrivacy" class="form-check-input" />
            <label for="agreePrivacy" class="form-check-label">
              <span class="link-text" @click.prevent="openPrivacyModal">개인정보처리방침</span> 동의 (필수)
            </label>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="!isFormValid || !agreeTerms || !agreePrivacy">회원가입</button>
        <div class="text-center">
          <router-link to="/login" class="text-decoration-none">이미 계정이 있으신가요? 로그인하기</router-link>
        </div>
      </form>

      <!-- 약관/방침 모달 -->
      <div v-if="showTermsModal" class="custom-modal-overlay" @click.self="closeModal">
        <div class="custom-modal-content">
          <div class="custom-modal-header">
            <span>이용약관</span>
            <button class="custom-modal-close" @click="closeModal">&times;</button>
          </div>
          <div class="custom-modal-body">
            <div class="modal-scroll terms-content" v-html="termsHtml"></div>
          </div>
        </div>
      </div>
      <div v-if="showPrivacyModal" class="custom-modal-overlay" @click.self="closeModal">
        <div class="custom-modal-content">
          <div class="custom-modal-header">
            <span>개인정보처리방침</span>
            <button class="custom-modal-close" @click="closeModal">&times;</button>
          </div>
          <div class="custom-modal-body">
            <div class="modal-scroll terms-content" v-html="privacyHtml"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/lib/axios';

// 약관/방침 내용 샘플 (실제 서비스에서는 import 하거나 fetch)
import termsContent from '@/components/common/TermsView.vue';
import privacyContent from '@/components/common/PrivacyPolicyView.vue';

export default {
  name: 'RegisterForm',
  data() {
    return {
      formData: {
        uid: '',
        upw: '',
        confirmPassword: '',
        uname: '',
        emailId: '',
        emailDomain: '',
        customEmailDomain: '',
        phone1: '010',
        phone2: '',
        phone3: ''
      },
      validationErrors: {
        uid: '',
        upw: '',
        confirmPassword: '',
        uname: '',
        email: '',
        phone: ''
      },
      agreeTerms: false,
      agreePrivacy: false,
      showTermsModal: false,
      showPrivacyModal: false,
      termsHtml: `<div class="terms-content">
      <p>제1조 (목적)본 약관은 'DAGON'(이하 '회사'라 함)이 운영하는 인터넷 사이트 및 모바일 애플리케이션(이하 'DAGON'이라 함)에서 제공하는 전자상거래 관련 서비스 및 기타 서비스(이하 '예약 시스템'이라 함)를 이용하는 자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
      <p>제2조 (정의)</p>
      <p>①'DAGON'이란 '회사'가 컴퓨터 등 정보통신설비를 이용하여 '예약 시스템'을 제공할 수 있도록 설정한 가상의 영업장을 말합니다.</p>
      <p>② '회원'이라 함은 '회사'에 개인정보를 제공하여 회원등록을 한 자로서, 'DAGON'의 정보를 지속적으로 제공받으며, '회사'가 제공하는 '예약 시스템'을 계속적으로 이용할 수 있는 자를 말합니다.</p>
      <p>③ '비회원'이라 함은 '회원'에 가입하지 않고 '회사'가 제공하는 '예약 시스템'을 이용하는 자를 말합니다.</p>
      <p>④ '이용자'란 'DAGON'에 접속하여 본 약관에 따라 '회사'가 제공하는 '예약 시스템'을 이용하는 '회원' 및 '비회원'을 말합니다.</p>
      <p>⑤ '판매자'라 함은 'DAGON'에 본인의 재화 및 용역(이하 '서비스'이라 함)을 등록하여 판매하거나 또는 제공할 의사로 '예약 시스템'을 이용하는 자를 말합니다.</p>
      <p>⑥ '구매자'라 함은 'DAGON'에 등록된 '판매자'의 '서비스'를 구매하거나 또는 제공받을 의사로 '예약 시스템'을 이용하는 자를 말합니다.</p>
      <p>⑦ 'DAGON 현금 포인트(이하 'DAGON 포인트'라 함)'라 함은 DAGON 내에서 서비스 구매를 위한 결제 시 할인쿠폰처럼 사용하실 수 있는 가상의 포인트입니다.</p>
      <br/>
      <p>제3조 (약관 등의 명시와 설명 및 개정)</p>
      <p>① '회사'는 본 약관의 내용을 '이용자'가 쉽게 알 수 있도록 인터넷 사이트 및 모바일 어플리케이션에 공지합니다. 다만, 약관의 내용은 '이용자'가 연결화면을 통하여 볼 수 있도록 할 수 있습니다.</p>
      <p>② '회사'는 전자상거래등에서의소비자보호에관한법률, 약관의규제에관한법률, 전자거래기본법, 전자서명법, 정보통신망이용촉진등에관한법률, 방문판매등에관한법률, 소비자보호법 등 관련법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
      <p>③ '회사'가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 '이용자'가 알기 쉽도록 표시하여 공지합니다.</p>
      <p>④ '회사'가 약관을 개정할 경우에는 변경된 약관은 공지된 시점부터 그 효력이 발생하며, '이용자'는 약관이 변경된 후에도 본 '예약 시스템'을 계속 이용함으로써 변경 후의 약관에 대해 동의를 한 것으로 간주됩니다.</p>
      <p>⑤ 본 약관에서 정하지 아니한 사항과 본 약관의 해석에 관하여는 전자상거래등에서의소비자보호에관한법률, 약관의규제등에관한법률, 공정거래위원회가 정하는 전자상거래등에서의 소비자보호지침 및 관계법령 또는 상관례에 따릅니다.</p>
      <br/>
      <p>제4조 (서비스의 제공 및 변경)</p>
      <p>① '회사'가 제공하는 '예약 시스템'은 다음과 같습니다.</p>
      <p>가. 전자상거래 플랫폼 개발 및 운영서비스</p>
      <p>나. '서비스' 정보검색서비스 및 마케팅 프로모션서비스</p>
      <p>다. 전자상거래 관련 지원서비스</p>
      <p>라. 기타 '회사'가 정하는 업무</p>
      <p>② '회사'는 원활하고 편리한 '예약 시스템'을 위한 시스템을 운영 및 관리하며, '이용자' 사이에 성립된 거래 및 '이용자'가 제공하고 등록한 정보에 대해서는 해당 '이용자'가 그에 대한 직접적인 책임을 부담하여야 합니다. 이와 관련해서 '회사'는 어떠한 책임도 지지 않습니다.</p>
      <p>③ '회사'가 제공하는 '예약 시스템' 내용을 기술적 사양의 변경 등의 이유로 변경할 경우에는 그 사유를 '이용자'에게 통지하거나, '이용자'가 알아볼 수 있도록 공지사항으로 게시합니다.</p>
      <br/>
      <p>제5조 (서비스의 중단)</p>
      <p>① '회사'는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 '서비스'의 제공을 일시적으로 중단할 수 있습니다.</p>
      <p>② 사업종목의 전환, 사업의 포기, 업체간의 통합 등의 이유로 '서비스'를 제공할 수 없게 되는 경우에는 '회사'는 '이용자'에게 통지하거나, '이용자'가 알아볼 수 있도록 공지사항으로 게시합니다.</p>
      <br/>
      <p>제6조 (예약 시스템 이용료)회사'는 'DAGON' 와 관련된 다양한 관련 '예약 시스템'을 제공하고, '회사'의 내부 정책에 따라 그에 대한 이용료(예약 시스템 이용료)를 부과할 수 있습니다.</p>
      <br/>
      <p>제7조 (회원가입 및 회원정보의 변경)</p>
      <p>① '이용자'는 '회사'가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.</p>
      <p>② 회원가입계약의 성립시기는 '회사'의 승낙이 '회원'에게 도달한 시점으로 합니다. '회사'는 이용승낙의 의사표시를 해당 서비스화면에 게시하거나 e-mail 또는 기타 방법으로 통지할 수 있습니다.</p>
      <p>③ '회사'는 '회원'으로 가입할 것을 신청한 '이용자' 중 다음에 해당하는 경우에는 '회원'으로 등록하는 것을 거부할 수 있습니다.</p>
      <p>가. 가입신청자가 이전에 회원자격을 상실한 적이 있는 경우, 다만 회원자격 상실 후 '회사'가 필요하다고 판단하여 회원재가입 승낙을 얻은 경우에는 예외로 합니다.</p>
      <p>나. 등록 내용에 허위, 기재누락, 오기가 있는 경우</p>
      <p>다. 기타 '회원'으로 등록하는 것이 '회사'의 운영상 또는 기술상 현저히 지장이 있다고 판단되는 경우</p>
      <p>④ '회원'은 '예약 시스템' 이용계약 신청 시 허위의 정보를 제공하여서는 아니 되며, 기재한 사항이 변경되었을 경우에는 즉시 변경사항을 최신의 정보로 수정하여야 합니다.</p>
      <p>⑤ '회원'이 수정하지 않은 정보로 인하여 발생하는 손해는 해당 '회원'이 전적으로 부담하며, '회사'는 이와 관련해서 어떠한 책임도 지지 않습니다.</p>
      <br/>
      <p>제8조 (회원 탈퇴 및 자격 상실 등)'회원'이 다음의 사유에 해당하는 경우, '회사'는 사전 통보없이 해당 '회원'이 등록한 내용을 삭제 조치하고, '회사'의 판단에 따라 경고, 'DAGON 포인트' 사용제한, 이용정지, '회원'의 자격을 상실시킬 수 있습니다. 또한 '회원'이 탈퇴한 경우 또는 '회원' 자격이 상실된 경우에는 해당 '회원'이 보유한 모든 'DAGON 포인트'가 소멸되며, '회원'은 'DAGON 포인트'로 인해 발생한 일체의 권리를 행사할 수 없습니다.</p>
      <p>가. 허위 내용을 등록한 경우</p>
      <p>나. 다른 '이용자'의 '서비스' 이용을 방해하거나 정보를 도용하는 등 타인의 권리나 명예, 신용 기타 정당한 이익을 침해하는 경우</p>
      <p>다. '회사'가 제공하는 '예약 시스템'을 방해하는 행위를 하거나 시도하는 경우</p>
      <p>라. '회사'가 제공하는 '예약 시스템'을 이용하여 법령 또는 본 약관이 금지하거나 공공의 질서와 선량한 풍속에 반하는 행위를 하는 경우</p>
      <p>마. 기타 '회사'가 판단하는 경우</p>
      <br/>
      <p>제15조 (DAGON 포인트)</p>
      <p>① 'DAGON 포인트'는 '이용자'가 결제한 서비스에 대해서 '회사'로부터 정산받은 판매대금으로 현금처럼 사용하실 수 있습니다.</p>
      <p>② 'DAGON 포인트'는 DAGON 내에서 예약시스템 이용시 사용할 수 있으며, '회사'가 정한 한도 내에서 사용할 수 있습니다.</p>
      <p>③ 'DAGON 포인트'는 서비스 예약을 위한 결제 시 할인쿠폰처럼 사용하실 수 있습니다. 결제대금 일부를 'DAGON 포인트'로 결제하거나, 다른 결제수단(간편계좌이체, 신용카드결제, 휴대폰결제 등)과 함께 혼용하여 결제할 수 있습니다.</p>
      <p>④ 'DAGON 포인트'는 DAGON 내에서 서비스 예약시에만 사용할 수 있으며, 본인이 지정한 계좌로 현금인출할 수는 없습니다.</p>
      <p>⑤ 'DAGON 포인트'는 유효기간 만료일자가 가까운 포인트부터 사용되며, 유효기간 1년이 지나면 소멸됩니다.</p>
      <p>⑥ "회사"는 서비스의 효율적 이용 및 운영을 위해 사전 공지 후 '헬로포인트'의 일부 또는 전부를 조정할 수 있으며, '헬로포인트'는 회사가 정한 기간에 따라 주기적으로 소멸할 수 있습니다</p>
      <br/>
      <p>제17조 (DAGON 포인트 사용시 금지사항)</p>
      <p>'회사'는 '회원'이 'DAGON포인트' 사용시 다음의 금지사항에 해당하는 경우, 사전 통보없이 해당 '회원'이 등록한 내용을 삭제 조치하고, '회사'의 판단에 따라 경고, 'DAGON 포인트' 출금보류 및 사용제한, 이용정지, 회원'의 자격을 상실시킬 수 있습니다. 또한 '회원'이 탈퇴한 경우 또는 '회원' 자격이 상실된 경우에는 해당 '회원'이 보유한 모든 'DAGON 포인트'가 소멸되며, '회원'은 'DAGON 포인트'로 인해 발생한 일체의 권리를 행사할 수 없습니다.</p>
      <p>가. 허위거래</p>
      <p>나. 'DAGON 포인트' 자체를 사고파는 행위</p>
      <p>다. 타인의 명의를 이용한 거래</p>
      <p>라. 중복계정 사용</p>
      <p>마. 'DAGON 포인트' 사용금지 서비스 거래 (티켓, 상품권, 쿠폰, 게임계정, 전자아이템 등)</p>
      <p>바. 비정상적/무의미한 서비스를 등록하는 행위</p>
      <p>사. 기타 비정상적이고 부정한 방법으로 'DAGON 포인트' 사용</p>
      <br/>
      <p>제18조 (저작권 보호정책)</p>
      <p>① '이용자'는 저작권 관련 규정을 준수하기 위해 충분한 주의를 기울여야만 합니다. 만약 '이용자'가 등록한 게시물이 제3자의 저작권을 침해한 경우, 민형사상 모든 책임은 '이용자' 당사자에게 있으며, 이와 관련해서 회사'는 어떠한 책임도 지지 않습니다.</p>
      <p>② '회사'는 '회원'이 작성한 각종 게시물을 판촉, 홍보 등의 목적으로 타 사이트에 복제, 배포, 전송, 전시할 수 있으며, 본질적인 내용에 변경을 가하지 않는 범위 내에서 수정, 편집될 수 있습니다.</p>
      <p>③ '회사'가 작성한 저작물에 대한 저작권 및 기타 지적재산권은 '회사'에 귀속합니다.</p>
      <p>④ '이용자'는 'DAGON'를 이용함으로써 얻은 정보 중 '회사'에게 지적재산권이 귀속된 정보를 '회사'의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</p>
      <br/>
      <p>제19조 (회사의 의무 및 면책)</p>
      <p>① '회사'는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로 '이용자' 상호간에 '서비스' 거래가 이루어질 수 있도록 온라인 거래장소를 원활하게 제공하는데 최선을 다합니다.</p>
      <p>② '회사'는 '이용자' 상호간 거래행위에서 발생되는 '서비스' 결함, 사기행위 등 문제 및 손실에 대해서 일체의 책임을 부담하지 않으며, 거래당사자간에 직접 해결해야합니다.</p>
      <br/>
      <p>제20조 (분쟁해결)</p>
      <p>① '회사'는 '이용자' 상호간 분쟁에서 발생하는 문제에 대해서 일체의 책임을 지지 않습니다. '이용자' 상호간 분쟁은 당사자간에 직접 해결해야합니다.</p>
      <p>② '이용자' 상호간에 발생한 전자상거래 분쟁과 관련하여 '이용자'의 피해구제신청이 있는 경우에는 공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다.</p>
      <br/>
      <p>제21조 (관할법원 및 준거법)</p>
      <p>① 'DAGON'에서 발생하는 회원간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 '이용자'의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다. 다만, 제소 당시 '이용자'의 주소 또는 거소가 분명하지 않거나 외국 거주자의 경우에는 민사소송법상의 관할법원에 제기합니다.</p>
      <p>② 'DAGON'의 회원간에 제기된 전자상거래 소송에는 한국법을 적용합니다.</p>
      <br/>
      <p>제22조 (적용일자)이 약관은 2017.07.12일부터 적용됩니다.</p>
      </div>`,
      privacyHtml: `<h2>개인정보처리방침</h2>
      <div class="terms-content">
        <p>'DAGON'는 서비스 제공을 위해 '이용자'의 개인정보를 아래와 같이 수집하고자 합니다.</p>
        <br/>
        <p>1. 개인정보의 수집항목 및 이용목적</p>
        <p>①'회사'가 개인정보를 수집하는 목적은 '이용자'의 개인식별과 '예약 시스템' 이용의사를 확인하여 최적화되고 맞춤화된 '서비스'를 제공하기 위함입니다.</p>
        <p>②'회사'는 수집한 개인정보를 다음과 같은 목적으로 활용할 수 있습니다. '회사'는 '회원'의 주민번호를 원칙적으로 수집 또는 이용하지 않으며, 휴대폰 문자 전송을 통한 단말기 인증 절차를 활용하여 이용자 인증을 합니다.</p>
        <p>수집항목 및 이용목적<br/>
        - 휴대폰번호, 이메일, ID, 비밀번호 : 회원가입 시 개인식별 및 부정 이용 방지<br/>
        - 계좌번호 : '이용자'간 거래의 신뢰도 확보를 위한 '서비스' 제공 및 부정 이용 방지와 정산관리<br/>
        - IP Address, 쿠키, 방문 일시, 서비스 이용기록, 불량 이용기록 : '서비스' 이용 및 처리 과정에서 자동으로 생성되어 수집</p>
        <p>③'회원'이 제공한 모든 정보는 상기 목적에 필요한 용도 이외로는 사용되지 않으며, 수집정보의 범위나 사용목적, 용도가 변경될 시에는 반드시 '회원'에게 사전 동의를 구합니다.</p>
        <p>④'회사'는 인터넷사이트 및 모바일 애플리케이션, 서면, 전화 등의 형태로 개인 정보를 수집합니다.</p>
        <br/>
        <p>2. 개인정보의 제3자 제공 및 목적<br/>
        원칙적으로 '회사'는 이용자들의 개인정보를 '개인정보의 수집항목 및 이용목적'에서 고지한 범위내에서 사용하며, '이용자'의 사전 동의 없이는 동 범위를 초과하여 이용하거나 원칙적으로 '이용자'의 개인정보를 외부에 공개하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.</p>
        <p>①'회원'이 사전에 공개에 동의한 경우<br/>
        ②'DAGON'의 이용약관을 위배하거나 'DAGON'의 '예약 시스템'을 이용하여 타인에게 피해를 주거나 미풍양속을 해치는 위법행위를 한 사람 등에게 법적인 조치를 취하기 위해 개인 정보를 공개해야 한다고 판단되는 경우<br/>
        ③법령의 규정에 의하거나, 수사상의 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</p>
        <br/>
        <p>3. 개인정보의 취급 위탁</p>
        <p>①'회사'는 원활하고 향상된 서비스를 위하여 개인정보 취급을 타인에게 위탁할 수 있습니다.</p>
        <p>②'회사'는 개인정보의 처리와 관련하여 아래와 같이 업무를 위탁하고 있으며, 관계법령에 따라 위탁 계약 시 개인정보가 안전하게 관리될 수 있도록 필요한 조치를 하고 있습니다. 또한 위탁처리하는 정보는 원활한 '서비스'를 제공하기 위하여 필요한 최소한의 정보에 국한됩니다.</p>
        <p>수탁업체 및 위탁 목적<br/>
        - 더치트(주) : 사기피해사례 검색<br/>
        - (주)다우기술 : 휴대폰인증<br/>
        - 케이티하이텔(주) : 휴대폰인증<br/>
        - SK텔레콤(주) : 본인확인서비스<br/>
        - (주) KT :본인확인서비스<br/>
        - (주) 다날: 본인확인서비스<br/>
        - (주) LG U+ : 휴대폰인증, 계좌인증, 본인확인서비스, DAGON 결제서비스<br/>
        - 세틀뱅크(주) : 휴대폰인증, 계좌인증, 본인확인서비스, DAGON 결제서비스<br/>
        - (주)케이지이니시스 : 휴대폰인증, 계좌인증, 본인확인서비스, DAGON 결제서비스</p>
        <br/>
        <p>4. 개인정보 보유기간 및 이용기간</p>
        <p>①'회원'이 'DAGON'에서 제공하는 '예약 시스템'을 이용하는 동안 회원가입시 등록한 '회원'의 개인정보는 'DAGON'에서 계속 보유하며 다른 용도로는 사용되지 않습니다.</p>
        <p>②'회원'의 개인정보는 원칙적으로 수집목적 또는 제공받은 목적이 달성되거나, 탈퇴를 요청하거나 표명된 회원자격상실사유에 의해 '회원'의 자격을 제한 및 정지시키는 경우에는 해당 개인의 정보는 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.</p>
        <p>가. '회사' 내부 방침에 의한 정보보유 사유<br/>
        - 부정이용기록<br/>
           보존 이유 : 부정 이용 방지<br/>
           보존 기간 : 5년<br/>
        - 사기 예방을 위해 필요한 기록<br/>
           보존 이유 : 사기 예방<br/>
           보존 기간 : 3년</p>
        <p>나. 관련법령에 의한 정보보유 사유<br/>
        상법, 전자상거래 등에서의 소비자보호에 관한 법률 등 관계법령의 규정에 의하여 보존할 필요가 있는 경우 '회사'는 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다. 이 경우 '회사'는 보관하는 정보를 그 보관의 목적으로만 이용하며 보존기간은 아래와 같습니다.<br/>
        - 계약 또는 청약철회 등에 관한 기록<br/>
           보존 이유 : 전자상거래 등에서의 소비자보호에 관한 법률<br/>
           보존 기간 : 5년<br/>
        - 대금결제 및 재화 등의 공급에 관한 기록<br/>
           보존 이유 : 전자상거래 등에서의 소비자보호에 관한 법률<br/>
           보존 기간 : 5년<br/>
        - 전자금융 거래에 관한 기록<br/>
           보존 이유 : 전자금융거래법<br/>
           보존 기간 : 5년<br/>
        - 소비자의 불만 또는 분쟁처리에 관한 기록<br/>
           보존 이유 : 전자상거래 등에서의 소비자보호에 관한 법률<br/>
           보존 기간 : 3년<br/>
        - 방문에 관한 기록<br/>
           보존 이유 : 통신비밀보호법<br/>
           보존 기간 : 3개월</p>
        <br/>
        <p>5. 개인정보의 파기절차 및 방법</p>
        <p>'회원'의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다.</p>
        <p>① 파기절차<br/>
        - '회원'이 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 파기됩니다. - 별도DB로 옮겨진 개인정보는 법률에 의한 경우를 제외하고는 다른 목적으로 이용되지 않습니다.<br/>
        ② 파기방법<br/>
        - 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.<br/>
        - 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</p>
        <br/>
        <p>6. 개인정보의 기술적／관리적 보호 대책</p>
        <p>'회사'는 '이용자'의 개인정보를 취급함에 있어 개인정보가 분실, 도난, 누출, 변조 또는 훼손되지 않도록 안전성 확보를 위하여 다음과 같은 기술적/관리적 대책을 강구하고 있습니다.</p>
        <p>① 해킹 등에 대비한 대책<br/>
        회사'는 해킹이나 컴퓨터 바이러스 등에 의해 '회원'의 개인정보가 유출되거나 훼손되는 것을 막기 위해 최선을 다하고 있습니다. 개인정보의 훼손에 대비해서 자료를 수시로 백업하고 있고, 최신 백신프로그램을 이용하여 '이용자'의 개인정보나 자료가 누출되거나 손상되지 않도록 방지하고 있으며, 암호화통신 등을 통하여 네트워크상에서 개인정보를 안전하게 전송할 수 있도록 하고 있습니다. 그리고 침입차단시스템을 이용하여 외부로부터의 무단 접근을 통제하고 있으며, 기타 시스템적으로 보안성을 확보하기 위한 가능한 모든 기술적 장치를 갖추려 노력하고 있습니다.<br/>
        ② 취급 직원의 최소화 및 교육<br/>
        '회사'의 개인정보관련 취급 직원은 담당자에 한정시키고 있고 이를 위한 별도의 비밀번호를 부여하여 정기적으로 갱신하고 있으며, 담당자에 대한 수시 교육을 통하여 'DAGON' 개인정보취급방침의 준수를 항상 강조하고 있습니다.<br/>
        ③ 개인정보보호전담기구의 운영<br/>
        회사'의 사내 개인정보보호전담기구 등을 통하여 'DAGON' 개인정보취급방침의 이행사항 및 담당자의 준수여부를 확인하여 문제가 발견될 경우 즉시 수정하고 바로 잡을 수 있도록 노력하고 있습니다. 단, '이용자' 본인의 부주의나 인터넷상의 문제로 개인정보가 유출되어 발생한 문제에 대해 '회사'는 일체의 책임을 지지 않습니다.</p>
        <br/>
        <p>7. 이용자의 권리</p>
        <p>'회원'은 언제든지 본인의 개인정보를 열람 및 정정 삭제할 수 있습니다. '회원'이 입력한 부정확한 정보로 인해 발생하는 사고의 책임은 본인에게 있으며 타인 정보의 도용 등 허위정보를 입력할 경우 회원자격이 상실될 수 있습니다.</p>
        <br/>
        <p>8. 이용자의 의무</p>
        <p>'회원'은 스스로 개인정보를 보호하고 타인의 정보를 침해하지 않을 의무도 가지고 있습니다. 비밀번호를 포함한 개인정보가 유출되지 않도록 주의를 필요로 하고 게시물을 포함한 타인의 개인정보를 훼손하지 않도록 유의해야합니다. 만약 이 같은 책임을 다하지 못하고 타인의 정보를 훼손할 시에는『정보통신망 이용촉진 및 정보보호 등에 관한 법률』등에 의해 처벌받을 수 있습니다.</p>
        <br/>
        <p>9. 쿠키(Cookie)의 운용 및 거부</p>
        <p>① 쿠키의 사용 목적<br/>
        가. '회사'는 개인 맞춤 서비스를 제공하기 위해서 '이용자'에 대한 정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다. 쿠키는 'DAGON' 서버가 이용자의 브라우저에게 전송하는 소량의 정보로서 '이용자' 컴퓨터의 하드디스크에 저장됩니다.<br/>
        나. 회사는 쿠키의 사용을 통해서만 가능한 특정된 맞춤형 서비스를 제공할 수 있습니다.<br/>
        다. 회사는 회원을 식별하고 회원의 로그인 상태를 유지하기 위해 쿠키를 사용할 수 있습니다.<br/>
        ② 쿠키의 설치/운용 및 거부<br/>
        가. '이용자'는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서 '이용자'는 웹브라우저에서 옵션을 조정함으로써 모든 쿠키를 허용/거부하거나, 쿠키가 저장될 때마다 확인을 거치도록 할 수 있습니다.<br/>
        나. 쿠키의 저장을 거부할 경우에는 개인 맞춤서비스 등 '회사'가 제공하는 일부 서비스는 이용이 어려울 수 있습니다.</p>
        <br/>
        <p>10. 링크 사이트에 대한 책임</p>
        <p>회사'는 '이용자'에게 다른 웹사이트에 대한 링크를 제공할 수 있습니다. 이 경우 '회사'는 외부사이트 및 자료에 대한 아무런 통제권이 없으므로 그로부터 제공받는 서비스나 자료의 진실성, 유용성 등에 대해서는 당사자간 귀책사항으로 '회사'는 어떠한 책임도 지지 않으며, 어떠한 보증도 하지 않습니다. 또한 링크되어 있는 웹사이트들이 개인정보를 수집하는 행위에 대해서는 본 "개인정보취급방침"이 적용되지 않으므로 새로 방문한 사이트의 정책을 반드시 검토해 보시기 바랍니다.</p>
        <br/>
        <p>11. 고지의 의무</p>
        <p>가. 개인정보취급방침은 정부의 정책 또는 회사의 필요에 따라 변경될 수 있으며, 내용의 추가 삭제 및 수정이 있을 시에는 시행 7일 전 인터넷 홈페이지 및 모바일을 통해 사전 고지할 것입니다. 사전공지가 곤란할 경우 지체없이 공지하며, 이 정책은 공지한 날로부터 시행됩니다.<br/>
        - 개인정보취급방침 공고일자 : 2017년 7월 14일<br/>
        - 개인정보취급방침 시행일자 : 2017년 7월 21일</p>
        <br/>
        <p>12. 개인정보 관리 책임자</p>
        <p>'회사'는 정보통신부 지정 개인정보지침에 의거 관리책임자 및 담당부서를 아래와 같이 지정합니다.<br/>
        ① 개인정보관리책임자<br/>
        - 성명 : 박준하<br/>
        - 전화번호 : 010-5473-4401<br/>
        - 이메일 : asd020712a@naer.com</p>
        <p>② 기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.<br/>
        - 개인정보침해신고센터 (www.118.or.kr / 118)<br/>
        - 정보보호마크인증위원회 (www.eprivacy.or.kr / 02-580-0533~4)<br/>
        - 대검찰청 첨단범죄수사과 (http://www.spo.go.kr / 02-3480-2000)<br/>
        - 경찰청 사이버테러대응센터 (www.ctrc.go.kr / 02-392-0330)</p>
      </div>`,
    }
  },
  computed: {
    isFormValid() {
      return !Object.values(this.validationErrors).some(error => error !== '') &&
             this.formData.uid &&
             this.formData.upw &&
             this.formData.confirmPassword &&
             this.formData.uname &&
             this.formData.emailId &&
             this.formData.emailDomain &&
             this.formData.phone1 &&
             this.formData.phone2 &&
             this.formData.phone3;
    }
  },
  methods: {
    validateId() {
      const idRegex = /^[a-zA-Z0-9]{4,20}$/;
      if (!idRegex.test(this.formData.uid)) {
        this.validationErrors.uid = '아이디는 4~20자의 영문 대소문자와 숫자만 사용 가능합니다.';
      } else {
        this.validationErrors.uid = '';
      }
    },
    validatePassword() {
      // 특수기호 포함 8자 이상
      const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:";'<>?,./]).{8,}$/;
      if (!pwRegex.test(this.formData.upw)) {
        this.validationErrors.upw = '비밀번호는 8자 이상의 영문, 숫자, 특수기호를 포함해야 합니다.';
      } else {
        this.validationErrors.upw = '';
      }
      this.validatePasswordConfirm();
    },
    validatePasswordConfirm() {
      if (this.formData.upw !== this.formData.confirmPassword) {
        this.validationErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      } else {
        this.validationErrors.confirmPassword = '';
      }
    },
    validateName() {
      const nameRegex = /^[가-힣]{2,10}$/;
      if (!nameRegex.test(this.formData.uname)) {
        this.validationErrors.uname = '이름은 2~10자의 한글만 사용 가능합니다.';
      } else {
        this.validationErrors.uname = '';
      }
    },
    validatePhone() {
      const phoneRegex = /^\d{3,4}$/;
      if (!phoneRegex.test(this.formData.phone2) || !phoneRegex.test(this.formData.phone3)) {
        this.validationErrors.phone = '전화번호 형식이 올바르지 않습니다.';
      } else {
        this.validationErrors.phone = '';
      }
    }, 
    async handleSubmit() {
      try {
        const params = new URLSearchParams();
        params.append('uid', this.formData.uid);
        params.append('upw', this.formData.upw);
        params.append('uname', this.formData.uname);
        params.append('email', `${this.formData.emailId}@${this.formData.emailDomain === 'custom' ? this.formData.customEmailDomain : this.formData.emailDomain}`);
        params.append('phone1', this.formData.phone1);
        params.append('phone2', this.formData.phone2);
        params.append('phone3', this.formData.phone3);

        const response = await api.post('/api/users/register', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        if (response.data === "회원가입 성공") {
          alert('회원가입이 완료되었습니다.');
          this.$router.push('/login');
        } else {
          alert(response.data || '회원가입에 실패했습니다.');
        }
      } catch (error) {
        console.error('회원가입 에러:', error);
        if (error.response?.data) {
          alert(error.response.data);
        } else if (error.message.includes('Network Error')) {
          alert('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else {
          alert('회원가입 처리 중 오류가 발생했습니다.');
        }
      }
    },
    openTermsModal() {
      this.showTermsModal = true;
      this.showPrivacyModal = false;
    },
    openPrivacyModal() {
      this.showPrivacyModal = true;
      this.showTermsModal = false;
    },
    closeModal() {
      this.showTermsModal = false;
      this.showPrivacyModal = false;
    }
  }
}
</script>

<script setup>
// Font Awesome CDN 추가
const fontAwesomeScript = document.createElement('link');
fontAwesomeScript.rel = 'stylesheet';
fontAwesomeScript.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
document.head.appendChild(fontAwesomeScript);
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #ffffff;
  padding: 20px;
  position: relative;
}

.register-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23f0f0f0" opacity="0.3"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.register-form {
  background: #ffffff;
  padding: 3rem 4rem;
  width: 100%;
  max-width: 800px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  border: 1px solid #e2e8f0;
}

.register-form::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
  border-radius: 20px;
  z-index: -1;
  opacity: 0.1;
}

h2 {
  color: #2d3748;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 1rem;
  margin-bottom: 0.75rem;
  display: block;
}

.input-group {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.input-group:focus-within {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.input-group-text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  padding: 1rem;
  font-size: 1.1rem;
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-control, .form-select {
  border: none;
  background: #f8fafc;
  padding: 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  background: white;
  box-shadow: none;
  outline: none;
}

.form-control::placeholder {
  color: #a0aec0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
  margin-top: 2rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  background: #cbd5e0;
  transform: none;
  box-shadow: none;
}

.form-text {
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.5rem;
}

.text-danger {
  color: #e53e3e !important;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

.text-center a {
  font-size: 1rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.text-center a:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-form {
  animation: fadeInUp 0.6s ease-out;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .register-form {
    padding: 2rem;
    margin: 1rem;
    border-radius: 15px;
  }
  
  h2 {
    font-size: 2rem;
  }
  
  .input-group-text {
    padding: 0.875rem;
    font-size: 1rem;
  }
  
  .form-control, .form-select {
    padding: 0.875rem;
  }
  
  .btn-primary {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .register-form {
    padding: 1.5rem;
  }
  
  h2 {
    font-size: 1.75rem;
  }
}

.link-text {
  color: #667eea;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}
.link-text:hover {
  color: #764ba2;
}
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.custom-modal-content {
  background: #fff;
  border-radius: 10px;
  max-width: 700px;
  width: 95%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 24px 20px 20px 20px;
  position: relative;
  max-height: 80vh;
  overflow: hidden;
}
.custom-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
}
.custom-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}
.custom-modal-body {
  font-size: 1rem;
  color: #222;
}
.modal-scroll {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 8px;
}
</style>
