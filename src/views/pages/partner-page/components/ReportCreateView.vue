<!-- ReportCreateView.vue -->
<template>
  <div class="report-create-page">
    <h2>{{ productName }} 조황정보 등록</h2>
    <ReportFormView
        :dto="reportDto"
        :loading="reportLoading"
        :error="reportError"
        @submit-success="handleSuccess"
        @submit-error="handleError"
    />
  </div>
</template>

<script>
import ReportFormView from '/src/views/community/fishing-report/ReportForm.vue'
import { partnerService } from '@/api/partner'

export default {
  name: 'ReportCreateView',
  components: { ReportFormView },
  data() {
    return {
      reportDto: {
        title: '',
        content: '',
        fishingAt: '',
        product: null
      },
      reportLoading: false,
      reportError: null,
      productName: '',
    }
  },
  async mounted() {
    const prodId = this.$route.params.prodId
    try {
      const res = await partnerService.getProductById(prodId)
      this.productName = res.data.prodName
      this.reportDto.product = {
        prodId: res.data.prodId,
        prodName: res.data.prodName
      }
    } catch (err) {
      this.reportError = '상품 정보를 불러오는 데 실패했습니다.'
    }
  },
  methods: {
    handleSuccess(data) {
      console.log('=== 전송할 데이터 ===')
      console.log('제목:', this.reportDto.title)
      console.log('내용:', this.reportDto.content)
      console.log('낚시일자:', this.reportDto.fishingAt)
      console.log('상품:', this.reportDto.product)
      
      alert('조황정보 등록 성공')
      this.$router.push('/partner/products')
    },
    handleError(err) {
      console.log('=== 전송할 데이터 ===')
      console.log('제목:', this.reportDto.title)
      console.log('내용:', this.reportDto.content)
      console.log('낚시일자:', this.reportDto.fishingAt)
      console.log('상품:', this.reportDto.product)
      
      this.reportError = err.message || '등록 실패'
    }
  }
}
</script>
