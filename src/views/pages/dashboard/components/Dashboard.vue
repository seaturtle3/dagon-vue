<template>
  <div class="dashboard">
    <h1>대시보드</h1>
    
    <div class="stats-grid">
      <div class="stat-card">
        <i class="fas fa-circle-user"></i>
        <div class="stat-info">
          <h3>전체 회원</h3>
          <p>{{ userStats.totalUsers }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-handshake"></i>
        <div class="stat-info">
          <h3>전체 파트너</h3>
          <p>{{ userStats.totalPartners }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-thumbs-up"></i>
        <div class="stat-info">
          <h3>오늘 가입</h3>
          <p>{{ userStats.todayUserCount }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-circle-xmark"></i>
        <div class="stat-info">
          <h3>비활성 회원</h3>
          <p>{{ userStats.inactiveUserCount }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-flag"></i>
        <div class="stat-info">
          <h3>신고 회원</h3>
          <p>{{ userStats.reportedUserCount }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-circle-up"></i>
        <div class="stat-info">
          <h3>최근 로그인</h3>
          <p>{{ userStats.recentLoginUserCount }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-calendar-check"></i>
        <div class="stat-info">
          <h3>총 예약</h3>
          <p>{{ reservationStats.total }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-calendar-plus"></i>
        <div class="stat-info">
          <h3>오늘 예약</h3>
          <p>{{ reservationStats.todayReservationCount }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-calendar-alt"></i>
        <div class="stat-info">
          <h3>미래 예약</h3>
          <p>{{ reservationStats.futureReservationCount }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-hourglass-half"></i>
        <div class="stat-info">
          <h3>승인 대기 파트너</h3>
          <p>{{ pendingPartnerCount }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-flex">
      <div class="recent-activities wide">
        <h2>최근 활동</h2>
        <div class="activity-list">
          <div v-for="activity in recentActivities.slice(0, 5)" :key="activity.id" class="activity-item">
            <span class="activity-icon" :class="activity.type.toLowerCase()">
              <i :class="getActivityIcon(activity.type.toLowerCase())"></i>
            </span>
            <div class="activity-content">
              <p>{{ truncateText(activity.description, 40) }}</p>
              <span class="activity-time">{{ formatRelativeTime(activity.time) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="quick-stats narrow">
        <h2>예약 추이 (최근 7일)</h2>
        <canvas ref="reservationChart"></canvas>
        <ul class="daily-list">
          <li v-for="item in dailyReservation" :key="item.date">
            {{ item.date }}: {{ item.count }}건
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/lib/axios'
import Chart from 'chart.js/auto'

export default {
  name: 'Dashboard',
  data() {
    return {
      userStats: {
        totalUsers: 0,
        totalPartners: 0,
        todayUserCount: 0,
        inactiveUserCount: 0,
        reportedUserCount: 0,
        recentLoginUserCount: 0
      },
      reservationStats: {
        total: 0,
        todayReservationCount: 0,
        futureReservationCount: 0
      },
      pendingPartnerCount: 0,
      top3Partners: [],
      dailyReservation: [],
      recentActivities: [],
      reservationChart: null,
      reservationChartData: {
        labels: [],
        data: []
      },
      productCount: 0,
      unansweredInquiryCount: 0,
    }
  },
  methods: {
    getActivityIcon(type) {
      const icons = {
        reservation: 'fas fa-calendar-check',
        user: 'fas fa-user',
        member: 'fas fa-user',
        partner: 'fas fa-ship',
        inquiry: 'fas fa-comments',
        report: 'fas fa-flag',
      }
      return icons[type] || 'fas fa-info-circle'
    },
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length > maxLength) {
        return text.slice(0, maxLength) + '...';
      }
      return text;
    },
    formatRelativeTime(timestamp) {
      if (!timestamp) return '';

      const date = new Date(timestamp);
      const now = new Date();
      const diffSeconds = Math.floor((now - date) / 1000);

      const minute = 60;
      const hour = minute * 60;
      const day = hour * 24;
      // const week = day * 7; // 주 단위는 더 이상 사용하지 않으므로 주석 처리

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (date >= today) {
        return `오늘 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
      } else if (date >= yesterday) {
        return `어제 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
      } else {
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    },
    async fetchDashboardData() {
      try {
        // 1. 회원/파트너/지원자 수
        const countsRes = await axios.get('/api/admin/counts')
        this.userStats.totalUsers = countsRes.data.totalUsers || 0
        this.userStats.totalPartners = countsRes.data.approvedPartners || 0
        // 지원자 수 필요시: countsRes.data.totalApplications

        // 2. 회원 통계
        const statsRes = await axios.get('/api/admin/stats')
        this.userStats.todayUserCount = statsRes.data.todayUserCount || 0
        this.userStats.inactiveUserCount = statsRes.data.inactiveUserCount || 0
        this.userStats.reportedUserCount = statsRes.data.reportedUserCount || 0
        this.userStats.recentLoginUserCount = statsRes.data.recentLoginUserCount || 0
        this.unansweredInquiryCount = statsRes.data.unansweredInquiryCount || 0

        // 3. 예약 통계
        const reservationRes = await axios.get('/api/admin/reservations/counts')
        console.log('예약 통계 응답 데이터:', reservationRes.data);
        this.reservationStats.total = reservationRes.data.totalReservations || 0
        this.reservationStats.todayReservationCount = reservationRes.data.todayReservations || 0
        this.reservationStats.futureReservationCount = reservationRes.data.futureReservations || 0

        // 4. 승인 대기 파트너 수
        const pendingRes = await axios.get('/api/admin/pending/count')
        this.pendingPartnerCount = pendingRes.data || 0

        // 5. 전체 상품 수 조회
        try {
          const productCountResponse = await axios.get('/api/admin/product/counts')
          this.productCount = productCountResponse.data.totalProducts || 0
        } catch (productError) {
          console.error('전체 상품 수 조회 실패:', productError);
          this.productCount = 0; // 오류 발생 시 0으로 설정
        }

        // 6. 최근 7일 예약 추이
        const dailyRes = await axios.get('/api/admin/reservation/daily')
        console.log('최근 7일 예약 추이 응답 데이터:', dailyRes.data);
        this.dailyReservation = dailyRes.data
        this.reservationChartData.labels = dailyRes.data.map(d => d.date)
        this.reservationChartData.data = dailyRes.data.map(d => d.count)

        // 7. TOP3 파트너
        const top3Res = await axios.get('/api/admin/partner/top3')
        console.log('TOP3 파트너 응답 데이터:', top3Res.data);
        this.top3Partners = top3Res.data

        // 8. 최근 활동 조회
        try {
          const activitiesRes = await axios.get('/api/admin/activities');
          console.log('최근 활동 응답 데이터:', activitiesRes.data);
          this.recentActivities = activitiesRes.data.map(activity => ({
            id: activity.id,
            type: activity.type.toLowerCase(),
            description: activity.details,
            time: activity.createdAt
          })).slice(0, 4);
        } catch (activitiesError) {
          console.error('최근 활동 조회 실패:', activitiesError);
          this.recentActivities = [
            { id: 1, type: 'reservation', description: '새로운 예약이 등록되었습니다.', time: '데이터 로딩 실패' },
            { id: 2, type: 'member', description: '새로운 회원이 가입했습니다.', time: '데이터 로딩 실패' }
          ];
        }
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
        // 기본값 설정
        this.userStats = {
          totalUsers: 0,
          totalPartners: 0,
          todayUserCount: 0,
          inactiveUserCount: 0,
          reportedUserCount: 0,
          recentLoginUserCount: 0
        };
        this.reservationStats = {
          total: 0,
          todayReservationCount: 0,
          futureReservationCount: 0
        };
        this.pendingPartnerCount = 0;
        this.top3Partners = [];
        this.dailyReservation = [];
        this.recentActivities = [];
      }
    },
    renderReservationChart() {
      if (this.reservationChart) {
        this.reservationChart.destroy()
      }
      const ctx = this.$refs.reservationChart.getContext('2d')
      this.reservationChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.reservationChartData.labels,
          datasets: [{
            label: '예약 수',
            data: this.reservationChartData.data,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52,152,219,0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          }
        }
      })
    },
  },
  async created() {
    await this.fetchDashboardData()
    this.$nextTick(() => {
      this.renderReservationChart()
    })
  }
}
</script>

<style scoped>
.dashboard {
  padding: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card i {
  font-size: 2rem;
  color: #3498db;
}

.stat-info h3 {
  margin: 0;
  font-size: 1rem;
  color: #666;
}

.stat-info p {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.dashboard-flex {
  display: flex;
  gap: 1.2rem;
  align-items: stretch;
}

.recent-activities.wide {
  flex: 1.3;
  background: white;
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}

.quick-stats.narrow {
  flex: 1;
  background: white;
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}

.quick-stats.narrow canvas {
  display: block;
  margin: 0 auto 1rem auto;
  width: 100% !important;
  max-width: 100%;
  height: 320px !important;
  min-height: 220px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: #f8f9fa;
  min-height: 60px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.activity-icon.reservation {
  background-color: #2ecc71;
}

.activity-icon.member {
  background-color: #3498db;
}

.activity-icon.user {
  background-color: #6a8baf;
}

.activity-icon.partner {
  background-color: #f1c40f;
}

.activity-icon.inquiry {
  background-color: #8e44ad;
}

.activity-icon.report {
  background-color: #e74c3c;
}

.activity-content {
  flex: 1;
}

.activity-content p {
  margin: 0;
  color: #2c3e50;
}

.activity-time {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  padding: 1rem;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.stat-item h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #2c3e50;
}

.stat-chart {
  height: 200px;
  background-color: #fff;
  border-radius: 4px;
}
</style> 