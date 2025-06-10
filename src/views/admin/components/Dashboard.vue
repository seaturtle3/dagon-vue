<template>
  <div class="dashboard">
    <h1>대시보드</h1>
    
    <div class="stats-grid">
      <div class="stat-card">
        <i class="fas fa-users"></i>
        <div class="stat-info">
          <h3>전체 회원</h3>
          <p>{{ stats.totalMembers }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-ship"></i>
        <div class="stat-info">
          <h3>전체 파트너</h3>
          <p>{{ stats.totalPartners }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-calendar-check"></i>
        <div class="stat-info">
          <h3>오늘의 예약</h3>
          <p>{{ stats.todayReservations }}</p>
        </div>
      </div>
      <div class="stat-card">
        <i class="fas fa-comments"></i>
        <div class="stat-info">
          <h3>미답변 문의</h3>
          <p>{{ stats.pendingInquiries }}</p>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="recent-activities">
        <h2>최근 활동</h2>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <span class="activity-icon" :class="activity.type">
              <i :class="getActivityIcon(activity.type)"></i>
            </span>
            <div class="activity-content">
              <p>{{ activity.description }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-stats">
        <h2>통계</h2>
        <div class="stats-list">
          <div class="stat-item">
            <h3>이번 달 예약 현황</h3>
            <div class="stat-chart">
              <!-- 차트 컴포넌트 추가 예정 -->
            </div>
          </div>
          <div class="stat-item">
            <h3>회원 가입 추이</h3>
            <div class="stat-chart">
              <!-- 차트 컴포넌트 추가 예정 -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      stats: {
        totalMembers: 0,
        totalPartners: 0,
        todayReservations: 0,
        pendingInquiries: 0
      },
      recentActivities: []
    }
  },
  methods: {
    getActivityIcon(type) {
      const icons = {
        reservation: 'fas fa-calendar-check',
        member: 'fas fa-user',
        partner: 'fas fa-ship',
        inquiry: 'fas fa-comments'
      }
      return icons[type] || 'fas fa-info-circle'
    },
    async fetchDashboardData() {
      // TODO: API 호출하여 대시보드 데이터 가져오기
      this.stats = {
        totalMembers: 1234,
        totalPartners: 56,
        todayReservations: 23,
        pendingInquiries: 5
      }
      this.recentActivities = [
        {
          id: 1,
          type: 'reservation',
          description: '새로운 예약이 등록되었습니다.',
          time: '10분 전'
        },
        {
          id: 2,
          type: 'member',
          description: '새로운 회원이 가입했습니다.',
          time: '30분 전'
        },
        {
          id: 3,
          type: 'partner',
          description: '새로운 파트너가 등록되었습니다.',
          time: '1시간 전'
        },
        {
          id: 4,
          type: 'inquiry',
          description: '새로운 문의가 등록되었습니다.',
          time: '2시간 전'
        }
      ]
    }
  },
  created() {
    this.fetchDashboardData()
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

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.recent-activities,
.quick-stats {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.recent-activities h2,
.quick-stats h2 {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  color: #2c3e50;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: #f8f9fa;
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

.activity-icon.partner {
  background-color: #f1c40f;
}

.activity-icon.inquiry {
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

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style> 