<template>
  <div class="data-section" v-if="hourlyData && hourlyData.length > 0">
    <h5>시간대별 조위 그래프</h5>
    <div class="chart-container">
      <canvas ref="tideChart" height="100"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

export default {
  name: 'TideChart',
  props: {
    hourlyData: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const tideChartRef = ref(null)
    let tideChartInstance = null

    const updateChart = async () => {
      if (!props.hourlyData || !tideChartRef.value) return
      
      // Chart.js가 설치되어 있지 않으면 차트 생성 건너뛰기
      if (typeof Chart === 'undefined') {
        console.warn('Chart.js가 설치되지 않았습니다. 차트를 표시할 수 없습니다.')
        return
      }
      
      if (tideChartInstance) {
        tideChartInstance.destroy()
      }
      
      await nextTick()
      
      const ctx = tideChartRef.value.getContext('2d')
      const tideLabels = props.hourlyData.map(h => h.time)
      const tideValues = props.hourlyData.map(h => h.tide_level)
      
      tideChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: tideLabels,
          datasets: [{
            label: '조위 (cm)',
            data: tideValues,
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13,110,253,0.2)',
            tension: 0.3,
            fill: true,
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'cm'
              }
            }
          }
        }
      })
    }

    // 데이터가 변경될 때마다 차트 업데이트
    watch(() => props.hourlyData, updateChart, { deep: true })

    onMounted(() => {
      updateChart()
    })

    onUnmounted(() => {
      if (tideChartInstance) {
        tideChartInstance.destroy()
      }
    })

    return {
      tideChartRef
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

.chart-container {
  margin-top: 15px;
  height: 300px;
  position: relative;
}
</style> 