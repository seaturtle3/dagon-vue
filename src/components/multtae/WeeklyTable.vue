<template>
  <div class="data-section" v-if="weeklyData && weeklyData.length > 0">
    <h5>주간 물때 정보</h5>
    <div class="table-container">
      <table class="weekly-table">
        <thead>
          <tr>
            <th>날짜</th>
            <th>물이름</th>
            <th>일출</th>
            <th>일몰</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, index) in weeklyData" :key="index">
            <td>{{ week.date }}</td>
            <td>{{ week.mulName }}</td>
            <td>{{ week.sunrise }}</td>
            <td>{{ week.sunset }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeeklyTable',
  props: {
    weeklyData: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.data-section {
  background: white;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.data-section h5 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.3rem;
  border-bottom: 2px solid #0d6efd;
  padding-bottom: 10px;
}

.table-container {
  overflow-x: auto;
}

.weekly-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.weekly-table th, .weekly-table td {
  padding: 10px;
  text-align: center;
  border: 1px solid #dee2e6;
}

.weekly-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.weekly-table td {
  background: white;
}

@media (max-width: 768px) {
  .weekly-table {
    font-size: 0.9rem;
  }
  
  .weekly-table th, .weekly-table td {
    padding: 8px 5px;
  }
}
</style> 