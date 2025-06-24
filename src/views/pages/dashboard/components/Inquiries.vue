<template>
  <div class="inquiries">
    <h1>1:1 문의 관리</h1>

    <div class="expand-controls">
      <button @click="expandAllCategories" title="전체 펼치기"><span class="expand-icon">▼</span></button>
      <button @click="collapseAllCategories" title="전체 접기"><span class="expand-icon">▲</span></button>
    </div>

    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="제목 또는 작성자로 검색">
      <select v-model="statusFilter">
        <option value="">전체 상태</option>
        <option value="대기중">대기중</option>
        <option value="답변완료">답변완료</option>
      </select>
      <button @click="searchInquiries">검색</button>
    </div>

    <!-- 문의 유형별 탭 -->
    <div class="inquiry-tabs">
      <button
        v-for="type in inquiryTypes"
        :key="type.value"
        :class="['tab-button', { active: selectedType === type.value }]"
        @click="selectType(type.value)"
      >
        {{ type.label }}
        <span class="tab-count">({{ getTypeCount(type.value) }})</span>
      </button>
    </div>

    <!-- 문의 목록 -->
    <div class="inquiries-list">
      <div v-for="inquiry in paginatedInquiries" :key="inquiry.id" class="inquiry-item">
            <div class="inquiry-header" @click="toggleInquiry(inquiry.id)">
              <span class="inquiry-status" :class="inquiry.status">{{ inquiry.status }}</span>
              <h3>{{ inquiry.title }}</h3>
          <span class="inquiry-author">{{ inquiry.userName || inquiry.author }}</span>
              <span class="inquiry-date">{{ formatDate(inquiry.createdAt) }}</span>
              <span class="inquiry-toggle">{{ expandedInquiries.includes(inquiry.id) ? '▼' : '▶' }}</span>
            </div>
            <!-- 문의 상세 펼침 영역 -->
            <div v-if="expandedInquiries.includes(inquiry.id)" class="inquiry-content">
              <div class="inquiry-message">
                <h4>문의 내용</h4>
                <p>{{ inquiry.content }}</p>
              </div>
              <!-- 답변이 있을 경우 -->
              <div v-if="inquiry.answerContent" class="inquiry-reply">
                <h4>답변</h4>
                <p class="reply-label">[관리자 답변]</p>
                <p class="reply-content">{{ inquiry.answerContent }}</p>
                <p class="reply-date">{{ formatDate(inquiry.answeredAt) }}</p>
                <div class="reply-actions">
                  <button @click="editReply(inquiry.id)">수정</button>
                  <button @click="deleteReply(inquiry.id)">삭제</button>
                </div>
              </div>
              <!-- 답변이 없을 경우 -->
              <div v-else class="inquiry-actions">
                <button @click="openReplyModal(inquiry.id)">답변하기</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이징 -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">이전</button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <span class="total-info">총 {{ totalItems }}개 문의</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">다음</button>
    </div>

    <!-- 답변 작성/수정 모달 -->
    <div v-if="showReplyModal" class="modal">
      <div class="modal-content">
        <h2>{{ editingReply ? '답변 수정' : '답변 작성' }}</h2>
        <form @submit.prevent="submitReply">
          <div class="form-group">
            <label>답변 내용</label>
            <textarea v-model="replyForm.content" required></textarea>
          </div>
          <div class="form-actions">
            <button type="submit">저장</button>
            <button type="button" @click="closeModal">취소</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import {inquiryApi} from '@/api/inquiry'
import { useInquiryStore } from '@/store/inquiries/inquiryStore'

export default {
  name: 'Inquiries',
  data() {
    return {
      searchQuery: '',
      statusFilter: '',
      inquiries: [],
      expandedInquiries: [],
      currentPage: 1,
      itemsPerPage: 10,
      showReplyModal: false,
      editingReply: false,
      replyForm: {
        inquiryId: null,
        content: ''
      },
      inquiryTypes: [
        { value: 'PRODUCT', label: '상품 문의' },
        { value: 'PARTNERSHIP', label: '제휴 문의' },
        { value: 'SYSTEM', label: '시스템 문의' },
        { value: 'RESERVATION', label: '예약 문의' },
        { value: 'RESERVATION_CANCEL', label: '예약 취소 문의' }
      ],
      selectedType: 'PRODUCT' // 기본값으로 상품 문의 선택
    }
  },
  computed: {
    groupedInquiries() {
      const groups = {
        'PRODUCT': [],
        'PARTNERSHIP': [],
        'SYSTEM': [],
        'RESERVATION': [],
        'RESERVATION_CANCEL': []
      };

      for (const inquiry of this.inquiries) {
        const type = inquiry.inquiryType || this.getInquiryTypeFromTitle(inquiry.title);
        if (groups[type]) {
          groups[type].push(inquiry);
        } else {
          groups['SYSTEM'].push(inquiry); // 기본값
        }
      }
      return groups;
    },
    filteredInquiries() {
      let filtered = this.inquiries;

      // 문의 유형 필터링
      if (this.selectedType) {
        filtered = filtered.filter(inquiry => {
          const type = inquiry.inquiryType || this.getInquiryTypeFromTitle(inquiry.title);
          return type === this.selectedType;
        });
      }

      // 검색어 필터링
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(inquiry =>
          inquiry.title.toLowerCase().includes(query) ||
          (inquiry.userName || inquiry.author || '').toLowerCase().includes(query)
        );
      }

      // 상태 필터링
      if (this.statusFilter) {
        filtered = filtered.filter(inquiry => inquiry.status === this.statusFilter);
      }

      return filtered;
    },
    paginatedInquiries() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredInquiries.slice(startIndex, endIndex);
    },
    totalItems() {
      return this.filteredInquiries.length;
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    }
  },
  methods: {
    async searchInquiries() {
      try {
        // TODO: 실제 API 호출 시 아래 주석 해제
        // const params = {
        //   keyword: this.searchQuery || '',
        //   status: this.statusFilter || '',
        //   inquiryType: this.selectedType || '',
        //   page: this.currentPage - 1,
        //   size: this.itemsPerPage
        // };
        // const response = await inquiryApi.getInquiryList(params);
        // this.inquiries = response.data.content;
        // this.totalPages = response.data.totalPages;

        // 임시 데이터 생성
        const generatedData = this.generateInquiryData();

        // store의 데이터와 생성된 데이터 합치기
        const storeData = this.inquiryStore ? this.inquiryStore.inquiries : [];
        this.inquiries = [...storeData, ...generatedData];

        // 펼침 상태 초기화
        this.expandedInquiries = [];
      } catch (error) {
        console.error('문의 목록 조회 실패:', error);
        alert('문의 목록 조회 중 오류가 발생했습니다.');
      }
    },
    toggleInquiry(id) {
      const index = this.expandedInquiries.indexOf(id)
      if (index === -1) {
        this.expandedInquiries.push(id)
      } else {
        this.expandedInquiries.splice(index, 1)
      }
    },
    openReplyModal(inquiryId) {
      this.editingReply = false
      this.replyForm.inquiryId = inquiryId
      this.replyForm.content = ''
      this.showReplyModal = true
    },
    editReply(inquiryId) {
      const inquiry = this.inquiries.find(i => i.id === inquiryId)
      if (inquiry && inquiry.answerContent) {
        this.editingReply = true
        this.replyForm.inquiryId = inquiryId
        this.replyForm.content = inquiry.answerContent
        this.showReplyModal = true
      }
    },
    async deleteReply(inquiryId) {
      if (!confirm('정말 삭제하시겠습니까?')) return;
      try {
        // TODO: 실제 API 호출 시 아래 주석 해제
        // await inquiryApi.deleteReply(inquiryId);
        // alert('답변이 삭제되었습니다.');
        // this.searchInquiries();

        // 임시 처리 - 실제 데이터 업데이트
        const inquiry = this.inquiries.find(i => i.id === inquiryId);
        if (inquiry) {
          inquiry.answerContent = null;
          inquiry.status = '대기중';
          inquiry.answeredAt = null;
        alert('답변이 삭제되었습니다.');
        }

      } catch (error) {
        console.error('답변 삭제 실패:', error);
        alert('답변 삭제 중 오류가 발생했습니다.');
      }
    },
    async submitReply() {
      try {
        const {inquiryId, content} = this.replyForm;

        // TODO: 실제 API 호출 시 아래 주석 해제
        // if (this.editingReply) {
        //   await inquiryApi.updateReply(inquiryId, {answerContent: content});
        //   alert('답변이 수정되었습니다.');
        // } else {
        //   await inquiryApi.createReply(inquiryId, {answerContent: content});
        //   alert('답변이 등록되었습니다.');
        // }

        // 임시 처리 - 실제 데이터 업데이트
        const inquiry = this.inquiries.find(i => i.id === inquiryId);
        if (inquiry) {
        if (this.editingReply) {
            inquiry.answerContent = content;
          alert('답변이 수정되었습니다.');
        } else {
            inquiry.answerContent = content;
            inquiry.status = '답변완료';
            inquiry.answeredAt = new Date().toISOString();
          alert('답변이 등록되었습니다.');
          }
        }

        this.showReplyModal = false;
        this.replyForm = { inquiryId: null, content: '' };

        // 목록 새로고침 (실제 API 사용 시)
        // await this.searchInquiries();

      } catch (error) {
        console.error('답변 저장 실패:', error);
        alert('답변 저장 중 오류가 발생했습니다.');
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    },
    selectType(type) {
      this.selectedType = type;
      this.currentPage = 1; // 페이지 초기화
      this.searchInquiries();
    },
    closeModal() {
      this.showReplyModal = false;
      this.replyForm = { inquiryId: null, content: '' };
      this.editingReply = false;
    },
    getTypeCount(type) {
      return this.groupedInquiries[type]?.length || 0;
    },
    getInquiryTypeFromTitle(title) {
      const words = title.split(' ');
      if (words.length > 0) {
        const firstWord = words[0].toLowerCase();
        if (firstWord === '상품') return 'PRODUCT';
        if (firstWord === '제휴') return 'PARTNERSHIP';
        if (firstWord === '시스템') return 'SYSTEM';
        if (firstWord === '예약') return 'RESERVATION';
        if (firstWord === '취소') return 'RESERVATION_CANCEL';
      }
      return 'SYSTEM'; // 기본값
    },
    generateInquiryData() {
      const data = [];
      let id = 1;

      // 상품 문의 데이터 (30개)
      const productInquiries = [
        { title: '낚시대 추천 부탁드립니다', content: '초보자에게 적합한 낚시대를 추천해주세요. 바다낚시용으로 사용할 예정이고, 예산은 20만원 정도입니다.' },
        { title: '미끼 종류에 대해 문의드립니다', content: '민물낚시용 미끼 중에서 가장 효과적인 종류가 무엇인지 알려주세요. 잉어 낚시를 주로 합니다.' },
        { title: '낚시복 사이즈 문의', content: '키 175cm, 몸무게 70kg인데 어떤 사이즈의 낚시복을 구매해야 할까요?' },
        { title: '릴 종류 추천', content: '바다낚시용 스피닝릴을 구매하려고 하는데, 어떤 브랜드와 모델을 추천하시나요?' },
        { title: '낚시가방 보관법', content: '낚시가방을 오래 사용하려면 어떻게 보관해야 하나요? 겨울철 보관법도 알려주세요.' },
        { title: '낚시줄 교체 주기', content: '낚시줄은 얼마나 자주 교체해야 하나요? 사용 빈도에 따른 교체 주기를 알려주세요.' },
        { title: '낚시바늘 선택법', content: '물고기 종류별로 어떤 낚시바늘을 사용해야 하나요? 바늘 크기 선택 기준을 알려주세요.' },
        { title: '낚시용품 세척법', content: '낚시용품들을 어떻게 세척해야 하나요? 특히 릴과 낚시대 세척법을 알려주세요.' },
        { title: '낚시복 재질 문의', content: '여름철 낚시복은 어떤 재질이 좋나요? 통기성과 방수 기능을 모두 갖춘 제품을 찾고 있습니다.' },
        { title: '낚시대 길이 선택', content: '바다낚시용 낚시대 길이는 얼마가 적당한가요? 제트티에서 사용할 예정입니다.' },
        { title: '낚시용품 브랜드 추천', content: '초보자에게 적합한 낚시용품 브랜드를 추천해주세요. 가성비가 좋은 브랜드가 좋습니다.' },
        { title: '낚시대 강도 문의', content: '낚시대 강도는 어떻게 선택해야 하나요? 물고기 크기에 따른 강도 선택 기준을 알려주세요.' },
        { title: '낚시용품 보관함', content: '낚시용품을 체계적으로 보관할 수 있는 보관함을 추천해주세요.' },
        { title: '낚시대 접이식 vs 원피스', content: '접이식 낚시대와 원피스 낚시대 중 어떤 것이 더 좋나요? 장단점을 알려주세요.' },
        { title: '낚시용품 가격대', content: '초보자가 구매해야 할 필수 낚시용품들의 적정 가격대를 알려주세요.' },
        { title: '낚시대 무게 문의', content: '낚시대 무게는 얼마나 가벼워야 하나요? 장시간 사용해도 피곤하지 않은 무게를 추천해주세요.' },
        { title: '낚시용품 세트 추천', content: '초보자를 위한 낚시용품 세트를 추천해주세요. 모든 필수 용품이 포함된 세트가 좋습니다.' },
        { title: '낚시대 재질 문의', content: '카본 낚시대와 글라스 낚시대 중 어떤 것이 더 좋나요? 각각의 장단점을 알려주세요.' },
        { title: '낚시용품 보증기간', content: '낚시용품들의 일반적인 보증기간은 얼마나 되나요? A/S 정책도 함께 알려주세요.' },
        { title: '낚시대 튜닝 문의', content: '낚시대 튜닝이 무엇인가요? 언제 필요한지와 튜닝 방법을 알려주세요.' },
        { title: '낚시용품 할인 정보', content: '낚시용품을 구매할 때 할인을 받을 수 있는 방법이 있나요? 시즌별 할인 정보도 알려주세요.' },
        { title: '낚시대 커스텀 문의', content: '낚시대를 커스텀으로 제작할 수 있나요? 커스텀 제작 과정과 비용을 알려주세요.' },
        { title: '낚시용품 중고거래', content: '중고 낚시용품 거래 시 주의사항을 알려주세요. 위조품 구별법도 함께 알려주세요.' },
        { title: '낚시대 수리 문의', content: '낚시대가 부러졌는데 수리가 가능한가요? 수리 가능한 범위와 비용을 알려주세요.' },
        { title: '낚시용품 렌탈 서비스', content: '낚시용품 렌탈 서비스가 있나요? 렌탈 가능한 용품과 비용을 알려주세요.' },
        { title: '낚시대 교체 시기', content: '낚시대는 언제 교체해야 하나요? 교체가 필요한 시점을 알려주세요.' },
        { title: '낚시용품 보험 문의', content: '낚시용품에 대한 보험 상품이 있나요? 보험 가입 조건과 보장 범위를 알려주세요.' },
        { title: '낚시대 수집 문의', content: '낚시대 수집에 관심이 있습니다. 수집 가치가 있는 낚시대 종류를 알려주세요.' },
        { title: '낚시용품 기부 문의', content: '사용하지 않는 낚시용품을 기부할 수 있나요? 기부 가능한 곳과 방법을 알려주세요.' },
        { title: '낚시대 대여 서비스', content: '낚시대 대여 서비스가 있나요? 대여 가능한 종류와 비용을 알려주세요.' }
      ];

      // 제휴 문의 데이터 (30개)
      const partnershipInquiries = [
        { title: '낚시터 파트너 등록', content: '강원도에 위치한 민물낚시터를 운영하고 있습니다. 파트너 등록 절차와 필요한 서류를 알려주세요.' },
        { title: '수수료 정책 문의', content: '파트너 등록 후 수수료는 어떻게 되나요? 예약 건당 수수료인가요, 월 정액인가요?' },
        { title: '낚시용품점 제휴', content: '낚시용품점을 운영하고 있는데 제휴가 가능한가요? 온라인 판매도 함께 진행하고 싶습니다.' },
        { title: '낚시 배 대여업체', content: '낚시 배 대여업체를 운영하고 있습니다. 제휴 조건과 등록 절차를 알려주세요.' },
        { title: '낚시 강사 등록', content: '낚시 강사 자격증을 가지고 있습니다. 강사 등록도 가능한가요?' },
        { title: '낚시터 운영 허가', content: '낚시터를 새로 운영하려고 합니다. 필요한 허가와 등록 절차를 알려주세요.' },
        { title: '파트너 수익 정산', content: '파트너 수익 정산은 언제 이루어지나요? 정산 방법과 수수료를 알려주세요.' },
        { title: '낚시터 마케팅 지원', content: '파트너 등록 후 마케팅 지원을 받을 수 있나요? 어떤 지원이 가능한지 알려주세요.' },
        { title: '낚시용품 제조업체', content: '낚시용품 제조업체입니다. 제휴 조건과 판매 채널을 알려주세요.' },
        { title: '낚시터 시설 개선', content: '낚시터 시설을 개선하려고 합니다. 지원 프로그램이 있나요?' },
        { title: '파트너 등급 제도', content: '파트너 등급 제도가 있나요? 등급별 혜택과 승급 조건을 알려주세요.' },
        { title: '낚시터 보험 문의', content: '낚시터 운영을 위한 보험 상품을 추천해주세요. 책임보험도 포함해서 알려주세요.' },
        { title: '파트너 교육 프로그램', content: '파트너를 위한 교육 프로그램이 있나요? 운영 노하우와 마케팅 방법을 배우고 싶습니다.' },
        { title: '낚시터 홍보 지원', content: '낚시터 홍보를 위한 지원 프로그램이 있나요? 온라인 마케팅 지원도 가능한가요?' },
        { title: '파트너 커뮤니티', content: '파트너들 간의 커뮤니티가 있나요? 정보 공유와 네트워킹을 하고 싶습니다.' },
        { title: '낚시터 시설 인증', content: '낚시터 시설 인증 제도가 있나요? 인증 기준과 절차를 알려주세요.' },
        { title: '파트너 성과 분석', content: '파트너 성과를 분석할 수 있는 도구가 있나요? 매출 분석과 고객 분석을 원합니다.' },
        { title: '낚시터 운영 컨설팅', content: '낚시터 운영 컨설팅 서비스를 제공하나요? 전문가의 조언을 받고 싶습니다.' },
        { title: '파트너 전용 앱', content: '파트너 전용 앱이 있나요? 예약 관리와 매출 확인이 가능한지 알려주세요.' },
        { title: '낚시터 브랜딩 지원', content: '낚시터 브랜딩을 위한 지원 프로그램이 있나요? 로고 디자인과 홍보물 제작을 도와주나요?' },
        { title: '파트너 리뷰 관리', content: '고객 리뷰 관리 시스템이 있나요? 부정적인 리뷰에 대한 대응 방법도 알려주세요.' },
        { title: '낚시터 시설 임대', content: '낚시터 시설을 임대할 수 있나요? 임대 조건과 비용을 알려주세요.' },
        { title: '파트너 법률 지원', content: '파트너를 위한 법률 지원 서비스가 있나요? 계약서 검토와 분쟁 해결을 도와주나요?' },
        { title: '낚시터 환경 인증', content: '환경 친화적인 낚시터 인증 제도가 있나요? 인증 기준과 절차를 알려주세요.' },
        { title: '파트너 세무 지원', content: '파트너를 위한 세무 지원 서비스가 있나요? 세무 신고와 절세 방법을 알려주세요.' },
        { title: '낚시터 안전 인증', content: '낚시터 안전 인증 제도가 있나요? 안전 기준과 인증 절차를 알려주세요.' },
        { title: '파트너 기술 지원', content: '파트너를 위한 기술 지원이 있나요? 시스템 사용법과 문제 해결을 도와주나요?' },
        { title: '낚시터 품질 관리', content: '낚시터 품질 관리 시스템이 있나요? 품질 기준과 관리 방법을 알려주세요.' },
        { title: '파트너 재정 지원', content: '파트너를 위한 재정 지원 프로그램이 있나요? 시설 개선 자금이나 운영 자금을 지원하나요?' },
        { title: '낚시터 인증 마크', content: '낚시터 인증 마크를 사용할 수 있나요? 인증 마크 사용 조건과 방법을 알려주세요.' }
      ];

      // 시스템 문의 데이터 (30개)
      const systemInquiries = [
        { title: '로그인이 안됩니다', content: '아이디와 비밀번호를 정확히 입력했는데도 로그인이 되지 않습니다. 어떻게 해야 하나요?' },
        { title: '예약 취소가 안됩니다', content: '예약 취소 버튼을 눌렀는데 취소가 되지 않습니다. 시스템 오류인가요?' },
        { title: '포인트 적립이 안됩니다', content: '예약 완료 후 포인트가 적립되지 않았습니다. 확인 부탁드립니다.' },
        { title: '앱 업데이트 후 오류', content: '앱을 최신 버전으로 업데이트한 후 예약 페이지가 로딩되지 않습니다.' },
        { title: '결제 오류', content: '결제 과정에서 "결제 정보를 확인해주세요"라는 오류가 발생합니다.' },
        { title: '비밀번호 재설정 오류', content: '비밀번호 재설정 이메일을 받았는데 링크가 작동하지 않습니다.' },
        { title: '회원가입 인증 오류', content: '회원가입 시 휴대폰 인증이 되지 않습니다. 인증번호를 받지 못했습니다.' },
        { title: '예약 확인서 출력 오류', content: '예약 확인서를 출력하려고 하는데 PDF 파일이 열리지 않습니다.' },
        { title: '앱 로딩 속도 문제', content: '앱이 너무 느리게 로딩됩니다. 인터넷 연결은 정상입니다.' },
        { title: '푸시 알림 수신 안됨', content: '예약 관련 푸시 알림을 받지 못합니다. 알림 설정은 모두 켜져 있습니다.' },
        { title: '리뷰 작성 오류', content: '리뷰를 작성하려고 하는데 저장이 되지 않습니다.' },
        { title: '이미지 업로드 실패', content: '프로필 이미지를 업로드하려고 하는데 계속 실패합니다.' },
        { title: '검색 기능 오류', content: '낚시터 검색 시 원하는 지역이 검색되지 않습니다.' },
        { title: '예약 달력 오류', content: '예약 달력에서 날짜가 잘못 표시됩니다.' },
        { title: '결제 내역 조회 오류', content: '결제 내역을 조회하려고 하는데 데이터가 표시되지 않습니다.' },
        { title: '회원정보 수정 오류', content: '회원정보를 수정하려고 하는데 저장이 되지 않습니다.' },
        { title: '앱 크래시 문제', content: '앱을 사용하다가 자주 크래시가 발생합니다.' },
        { title: '로그아웃 오류', content: '로그아웃 버튼을 눌렀는데 로그아웃이 되지 않습니다.' },
        { title: '예약 알림 중복', content: '같은 예약에 대해 알림이 여러 번 오고 있습니다.' },
        { title: '포인트 사용 오류', content: '포인트를 사용하려고 하는데 적용이 되지 않습니다.' },
        { title: '리뷰 삭제 오류', content: '작성한 리뷰를 삭제하려고 하는데 삭제가 되지 않습니다.' },
        { title: '예약 변경 오류', content: '예약을 변경하려고 하는데 변경이 되지 않습니다.' },
        { title: '앱 다운로드 실패', content: '앱을 다운로드하려고 하는데 계속 실패합니다.' },
        { title: '회원 탈퇴 오류', content: '회원 탈퇴를 시도했는데 탈퇴가 되지 않습니다.' },
        { title: '예약 취소 수수료 오류', content: '예약 취소 시 수수료가 잘못 계산되었습니다.' },
        { title: '앱 로그인 상태 오류', content: '로그인 상태가 제대로 표시되지 않습니다.' },
        { title: '예약 확인 이메일 오류', content: '예약 확인 이메일을 받지 못했습니다.' },
        { title: '포인트 적립 내역 오류', content: '포인트 적립 내역이 정확하지 않습니다.' },
        { title: '앱 권한 설정 오류', content: '앱 권한 설정에서 문제가 발생합니다.' },
        { title: '예약 중복 오류', content: '같은 시간에 중복 예약이 되었습니다.' },
        { title: '결제 취소 오류', content: '결제 취소를 시도했는데 취소가 되지 않습니다.' },
        { title: '앱 백업 오류', content: '앱 데이터 백업이 되지 않습니다.' },
        { title: '회원 인증 오류', content: '회원 인증 과정에서 오류가 발생합니다.' }
      ];

      // 예약 문의 데이터 (30개)
      const reservationInquiries = [
        { title: '예약 변경 가능한가요?', content: '다음 주 토요일로 예약했는데 일요일로 변경하고 싶습니다. 가능한가요?' },
        { title: '인원 추가 가능한가요?', content: '2명으로 예약했는데 4명으로 늘리고 싶습니다. 가능한가요?' },
        { title: '예약 시간 변경', content: '오전 9시로 예약했는데 오후 2시로 변경하고 싶습니다.' },
        { title: '예약 확인 방법', content: '예약을 했는데 확인 방법을 모르겠습니다. 이메일로 확인서를 받을 수 있나요?' },
        { title: '단체 예약 문의', content: '회사 단체로 20명 정도 예약하고 싶습니다. 단체 할인이 있나요?' },
        { title: '예약 대기 신청', content: '원하는 날짜가 모두 예약 마감인데 대기 신청이 가능한가요?' },
        { title: '예약 연기 문의', content: '개인 사정으로 예약을 연기하고 싶습니다. 가능한가요?' },
        { title: '예약 분할 문의', content: '하루 종일 예약했는데 반나절만 사용하고 싶습니다.' },
        { title: '예약 확인서 재발송', content: '예약 확인서를 분실했습니다. 재발송이 가능한가요?' },
        { title: '예약 현황 조회', content: '특정 낚시터의 예약 현황을 조회할 수 있나요?' },
        { title: '예약 알림 설정', content: '예약 관련 알림을 문자로 받고 싶습니다. 설정 방법을 알려주세요.' },
        { title: '예약 패키지 문의', content: '낚시용품 대여와 함께 예약할 수 있는 패키지가 있나요?' },
        { title: '예약 선착순 문의', content: '예약은 선착순인가요? 예약 시간이 정해져 있나요?' },
        { title: '예약 취소 정책', content: '예약 취소 정책을 자세히 알려주세요. 언제까지 취소 가능한가요?' },
        { title: '예약 중복 확인', content: '같은 시간에 다른 낚시터 예약이 가능한가요?' },
        { title: '예약 수수료 문의', content: '예약 시 수수료가 있나요? 얼마인가요?' },
        { title: '예약 우선순위', content: '예약 우선순위가 있나요? VIP 회원 혜택이 있나요?' },
        { title: '예약 연장 문의', content: '예약 시간을 연장하고 싶습니다. 가능한가요?' },
        { title: '예약 분할 결제', content: '예약 금액을 분할해서 결제할 수 있나요?' },
        { title: '예약 대리 신청', content: '다른 사람을 대신해서 예약할 수 있나요?' },
        { title: '예약 현장 변경', content: '예약한 낚시터를 현장에서 다른 곳으로 변경할 수 있나요?' },
        { title: '예약 패키지 할인', content: '여러 낚시터를 묶어서 예약하면 할인이 있나요?' },
        { title: '예약 선물하기', content: '예약을 다른 사람에게 선물할 수 있나요?' },
        { title: '예약 공유하기', content: '예약 정보를 다른 사람과 공유할 수 있나요?' },
        { title: '예약 리마인더', content: '예약 전날 알림을 받을 수 있나요?' },
        { title: '예약 통계 조회', content: '내 예약 통계를 조회할 수 있나요?' },
        { title: '예약 패턴 분석', content: '내 예약 패턴을 분석해주는 기능이 있나요?' },
        { title: '예약 추천 서비스', content: '내 취향에 맞는 낚시터를 추천해주나요?' },
        { title: '예약 히스토리', content: '과거 예약 내역을 조회할 수 있나요?' },
        { title: '예약 즐겨찾기', content: '자주 가는 낚시터를 즐겨찾기로 등록할 수 있나요?' },
        { title: '예약 공지사항', content: '예약 관련 공지사항을 어디서 확인할 수 있나요?' },
        { title: '예약 문의 전화', content: '예약 관련 문의 전화번호를 알려주세요.' }
      ];

      // 예약 취소 문의 데이터 (30개)
      const reservationCancelInquiries = [
        { title: '취소 수수료', content: '예약을 취소하려고 하는데 수수료가 얼마나 나오나요?' },
        { title: '날씨 때문에 취소', content: '예약한 날 비가 올 예정이라 취소하고 싶습니다. 수수료 면제 가능한가요?' },
        { title: '긴급 취소', content: '갑작스러운 일정 변경으로 예약을 취소해야 합니다. 긴급 취소는 어떻게 하나요?' },
        { title: '환불 기간', content: '예약을 취소했는데 환불이 언제 들어오나요?' },
        { title: '부분 취소', content: '4명으로 예약했는데 2명만 취소하고 싶습니다. 가능한가요?' },
        { title: '취소 신청 방법', content: '예약 취소 신청은 어떻게 하나요? 온라인으로만 가능한가요?' },
        { title: '취소 확인', content: '취소 신청을 했는데 확인 방법을 모르겠습니다.' },
        { title: '취소 수수료 면제', content: '취소 수수료 면제 조건이 있나요? 어떤 경우에 면제되나요?' },
        { title: '취소 후 재예약', content: '취소한 후 같은 날 다른 시간으로 재예약이 가능한가요?' },
        { title: '취소 이력 조회', content: '취소 이력을 조회할 수 있나요?' },
        { title: '취소 사유 등록', content: '취소 사유를 등록해야 하나요? 어떤 사유가 있나요?' },
        { title: '취소 수수료 계산', content: '취소 수수료는 어떻게 계산되나요? 정확한 계산 방법을 알려주세요.' },
        { title: '취소 후 포인트', content: '취소 후 적립된 포인트는 어떻게 되나요?' },
        { title: '취소 후 쿠폰', content: '취소 후 사용한 쿠폰은 환불되나요?' },
        { title: '취소 후 할인', content: '취소 후 할인 혜택은 어떻게 되나요?' },
        { title: '취소 후 재사용', content: '취소한 예약은 재사용할 수 있나요?' },
        { title: '취소 후 변경', content: '취소 후 다른 낚시터로 변경할 수 있나요?' },
        { title: '취소 후 환불', content: '취소 후 환불은 언제 처리되나요?' },
        { title: '취소 후 알림', content: '취소 완료 알림을 받을 수 있나요?' },
        { title: '취소 후 확인서', content: '취소 확인서를 발급받을 수 있나요?' },
        { title: '취소 후 문의', content: '취소 후 추가 문의사항이 있습니다.' },
        { title: '취소 후 리뷰', content: '취소한 예약에 대해서도 리뷰를 작성할 수 있나요?' },
        { title: '취소 후 추천', content: '취소 후 다른 낚시터를 추천받을 수 있나요?' },
        { title: '취소 후 할인', content: '취소 후 재예약 시 할인 혜택이 있나요?' },
        { title: '취소 후 포인트 적립', content: '취소 후 포인트 적립이 가능한가요?' },
        { title: '취소 후 쿠폰 발급', content: '취소 후 쿠폰을 다시 발급받을 수 있나요?' },
        { title: '취소 후 예약 우선순위', content: '취소 후 재예약 시 우선순위가 있나요?' },
        { title: '취소 후 단체 할인', content: '취소 후 단체 예약 시 할인이 있나요?' },
        { title: '취소 후 패키지 할인', content: '취소 후 패키지 예약 시 할인이 있나요?' },
        { title: '취소 후 VIP 혜택', content: '취소 후 VIP 회원 혜택이 적용되나요?' },
        { title: '취소 후 이벤트 참여', content: '취소 후 이벤트 참여가 가능한가요?' },
        { title: '취소 후 추천인 혜택', content: '취소 후 추천인 혜택이 적용되나요?' },
        { title: '취소 후 생일 할인', content: '취소 후 생일 할인이 적용되나요?' },
        { title: '취소 후 기념일 할인', content: '취소 후 기념일 할인이 적용되나요?' }
      ];

      // 모든 문의 데이터를 하나의 배열로 합치기
      const allInquiries = [
        ...productInquiries.map(item => ({ ...item, inquiryType: 'PRODUCT' })),
        ...partnershipInquiries.map(item => ({ ...item, inquiryType: 'PARTNERSHIP' })),
        ...systemInquiries.map(item => ({ ...item, inquiryType: 'SYSTEM' })),
        ...reservationInquiries.map(item => ({ ...item, inquiryType: 'RESERVATION' })),
        ...reservationCancelInquiries.map(item => ({ ...item, inquiryType: 'RESERVATION_CANCEL' }))
      ];

      // 각 문의에 고유 ID와 생성일시 추가
      allInquiries.forEach((inquiry, index) => {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30)); // 최근 30일 내

        const status = Math.random() < 0.5 ? '대기중' : '답변완료';
        const answerContent = status === '답변완료' ? `${inquiry.title}에 대한 답변입니다. 문의해주셔서 감사합니다.` : null;
        const answeredAt = status === '답변완료' ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null;

        data.push({
          id: id++,
          title: inquiry.title,
          content: inquiry.content,
          status,
          createdAt: createdAt.toISOString(),
          answeredAt,
          answerContent,
          userName: `사용자${Math.floor(Math.random() * 100) + 1}`,
          author: `사용자${Math.floor(Math.random() * 100) + 1}`,
          inquiryType: inquiry.inquiryType
        });
      });

      return data;
    }
  },
  created() {
    this.searchInquiries()
  },
  mounted() {
    // store 초기화
    this.inquiryStore = useInquiryStore()

    // 라우터 쿼리 파라미터에서 문의 유형 확인
    const queryType = this.$route.query.type;
    if (queryType && this.inquiryTypes.some(type => type.value === queryType)) {
      this.selectedType = queryType;
      this.searchInquiries();
    }
  }
}
</script>

<style scoped>
.inquiries {
  padding: 1rem;
}

.search-bar {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
}

.search-bar input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.inquiry-tabs {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
  color: #666;
}

.tab-button:hover {
  background-color: #e9ecef;
  color: #333;
}

.tab-button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #007bff;
}

.tab-count {
  font-size: 0.875rem;
  margin-left: 0.5rem;
  opacity: 0.8;
}

.tab-button.active .tab-count {
  color: rgba(255, 255, 255, 0.8);
}

.inquiries-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.inquiry-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.inquiry-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  background-color: #f8f9fa;
}

.inquiry-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: white;
}

.inquiry-status.대기중 {
  background-color: #e74c3c;
}

.inquiry-status.답변완료 {
  background-color: #2ecc71;
}

.inquiry-header h3 {
  margin: 0;
  flex: 1;
}

.inquiry-author {
  color: #666;
  font-size: 0.875rem;
}

.inquiry-date {
  color: #666;
  font-size: 0.875rem;
}

.inquiry-toggle {
  font-size: 1.25rem;
  color: #666;
}

.inquiry-content {
  padding: 1rem;
  border-top: 1px solid #ddd;
}

.inquiry-message,
.inquiry-reply {
  margin-bottom: 1rem;
}

.inquiry-message h4,
.inquiry-reply h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.inquiry-message p,
.inquiry-reply p {
  margin: 0 0 1rem;
  color: #666;
}

.inquiry-attachments {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
}

.inquiry-attachments h4 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.inquiry-attachments ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.inquiry-attachments li {
  margin-bottom: 0.25rem;
}

.inquiry-attachments a {
  color: #3498db;
  text-decoration: none;
}

.reply-date {
  display: block;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.inquiry-actions,
.reply-actions {
  display: flex;
  gap: 0.5rem;
}

.inquiry-actions button,
.reply-actions button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.inquiry-actions button {
  background-color: #3498db;
}

.reply-actions button:first-child {
  background-color: #f1c40f;
}

.reply-actions button:last-child {
  background-color: #e74c3c;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.pagination button:disabled {
  background-color: #f8f9fa;
  color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #333;
  min-width: 60px;
  text-align: center;
}

.total-info {
  color: #666;
  font-size: 0.9rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 200px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.form-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background-color: #2ecc71;
  color: white;
}

.form-actions button[type="button"] {
  background-color: #95a5a6;
  color: white;
}
</style> 