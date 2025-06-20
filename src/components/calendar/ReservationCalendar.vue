<template>
  <div class="calendar-container">
    <h2>예약 캘린더</h2>

    <div class="month-nav">
      <button class="month-control-btn" @click="prevMonth">< 이전</button>
      <div class="month-btns">
        <button
            v-for="i in 12"
            :key="i"
            :class="['month-btn', {
            selected: currentMonth === i - 1,
            disabled: i - 1 < today.getMonth()
          }]"
            :disabled="i - 1 < today.getMonth()"
            @click="selectMonth(i - 1)"
        >
          {{ i }}월
        </button>
      </div>
      <button class="month-control-btn" @click="nextMonth">다음 ></button>
    </div>

    <div class="date-nav">
      <button
          v-for="day in datesInMonth"
          :key="day.date"
          :class="['date-btn', {
          selected: isSelectedDate(day.date),
          disabled: day.disabled
        }]"
          :disabled="day.disabled"
          :style="day.style"
          @click="selectDate(day.date)"
      >
        {{ day.label }}
      </button>
    </div>

    <div class="slider" ref="sliderRef" @scroll="handleScroll">
      <div v-if="!selectedDate">날짜를 선택하세요.</div>
      <div v-else>
        <div class="slider-header">
          <h4>{{ formatDate(selectedDate) }} 예약자 ({{ reservations.length }}명)</h4>
          <button class="btn-reserve" @click="alert('예약 화면으로 이동')">바로예약</button>
        </div>
        <div v-for="(resv, idx) in reservations" :key="idx" class="reservation">
          <span>{{ idx + 1 }}. {{ resv.name }} ({{ resv.phone }})</span>
          <button class="btn-reserve" @click="alert('예약 처리!')">바로 예약</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import ReservationCalendar from '@/components/calendar/ReservationCalendar.vue'

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = ref(today.getMonth());
const selectedDate = ref(null);
const reservations = ref([]);
const loading = ref(false);
const sliderRef = ref(null);

const datesInMonth = ref([]);

const formatDate = (date) => date.toISOString().split('T')[0];

const isSelectedDate = (date) => {
  return selectedDate.value && formatDate(date) === formatDate(selectedDate.value);
};

const loadReservations = async (dateObj, reset = true) => {
  if (loading.value) return;
  loading.value = true;

  const dateStr = formatDate(dateObj);
  const res = await fetch(`/api/reservations?date=${dateStr}`);
  const data = await res.json();

  if (reset) {
    reservations.value = data;
  } else {
    reservations.value.push(...data);
  }
  loading.value = false;
};

const selectMonth = (month) => {
  currentMonth.value = month;
  selectedDate.value = null;
  generateDates();
};

const selectDate = (date) => {
  selectedDate.value = date;
  reservations.value = [];
  loadReservations(date);
};

const prevMonth = () => {
  if (currentMonth.value > today.getMonth()) {
    currentMonth.value--;
    generateDates();
    selectedDate.value = null;
    reservations.value = [];
  }
};

const nextMonth = () => {
  if (currentMonth.value < 11) {
    currentMonth.value++;
    generateDates();
    selectedDate.value = null;
    reservations.value = [];
  }
};

const generateDates = () => {
  const days = [];
  const firstDay = new Date(currentYear, currentMonth.value, 1);
  const lastDay = new Date(currentYear, currentMonth.value + 1, 0);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(currentYear, currentMonth.value, d);
    const dayOfWeek = date.getDay();
    const disabled = date < new Date().setHours(0, 0, 0, 0);
    const style = {};
    if (dayOfWeek === 0) style.color = 'red';
    else if (dayOfWeek === 6) style.color = 'blue';
    days.push({ label: d, date, disabled, style });
  }
  datesInMonth.value = days;
};

const handleScroll = () => {
  const el = sliderRef.value;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5 && selectedDate.value) {
    const nextDate = new Date(selectedDate.value);
    nextDate.setDate(nextDate.getDate() + 1);
    selectedDate.value = nextDate;
    loadReservations(nextDate, false);
  }
};

onMounted(() => {
  generateDates();
});
</script>

<style scoped>
.bottom-buttons {
  margin-top: 50px;
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.bottom-buttons button {
  padding: 12px 24px;
  color: black;
  border: none;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.bottom-buttons button:hover {
  background-color: #007BFF;
  color: white;
}

.bottom-buttons button.selected {
  background-color: #007BFF;
  color: white;
}

body {
  font-family: sans-serif;
  padding: 20px;
}

.month-nav, .date-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  align-items: center;
}

.month-btn, .month-control-btn {
  padding: 20px 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #eee;
}

.month-nav {
  position: relative;
  padding: 30px 0;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  justify-content: center;
}

.month-btn:hover {
  background-color: #007BFF;
  color: white;
}

.date-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  text-align: center;
  line-height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 37.5px;
  border: none;
  cursor: pointer;
  background: #eee;
  transition: background 0.2s ease;
}

.date-btn:hover {
  background-color: #007BFF;
  color: white;
}

/* 클릭(선택)된 상태 */
.date-btn.selected {
  background-color: #007BFF;
  color: white;
}

.month-btn.disabled, .date-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
}

.selected {
  background: #007BFF;
  color: white;
}

.slider {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;
  background: #f9f9f9;
  max-height: 300px;
  overflow-y: auto;
}

.reservation {
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
}

.reservation:last-child {
  border-bottom: none;
}

.btn-reserve {
  background: lightgray;
  color: black;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  float: right;
}

.btn-reserve:hover {
  background-color: #007BFF;
  color: white;
}
</style>