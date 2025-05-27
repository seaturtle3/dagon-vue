<script>
import api from '@/lib/axios.js'

export default {
  name: 'FishingReport',
  data() {
    return {
      reports: []
    }
  },
  mounted() {
    this.fetchReports();
  },
  methods: {
    async fetchReports() {
      try {
        const res = await api.get('/api/fishing-report/get-all');
        this.reports = res.data;
        console.log(this.reports);
      } catch (err) {
        console.error('조황정보 불러오기 실패', err);
      }
    }
  }
}

console.log('조황정보 api')
</script>

<template>
  <div class="fishing-report">
    <h1>조황센터 테스트</h1>
  </div>
</template>

<style scoped>
.fishing-report {
  width: 80%;
  margin: auto;
}
</style>