<template>
  <div class="calendar-container">
    <h2>예약 캘린더</h2>
    <br>

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

    <div class="reservation-section" v-if="selectedDate">
      <div class="selected-date-info">
        <h4>{{ formatDate(selectedDate) }} 예약</h4>
      </div>
      
      <div class="people-selection">
        <h5>예약 인원을 선택해주세요</h5>
        <div class="people-counter">
          <div class="counter-item">
            <label>성인</label>
            <div class="counter-controls">
              <button @click="decreaseAdult" :disabled="adultCount <= 0">-</button>
              <span>{{ adultCount }}</span>
              <button @click="increaseAdult" :disabled="adultCount >= 10">+</button>
            </div>
          </div>
        </div>
        
        <div v-if="props.product && props.product.options && props.product.options.length" class="option-select-section">
          <div>
            <p>localOptionId: {{ localOptionId }}</p>
            <p>options: {{ props.product && props.product.options ? props.product.options.length : 0 }}</p>
          </div>
          <label for="optionSelect"><b>옵션 선택</b></label>
          <select
            id="optionSelect"
            v-model="localOptionId"
            :key="props.product && props.product.options ? props.product.options.map(o => o.id).join(',') : ''"
            @change="e => console.log('[select change]', e.target.value, localOptionId)"
            style="margin-left: 12px;"
          >
            <option v-for="option in props.product.options" :key="option.id" :value="String(option.price)">
              {{ option.optName || option.option_name }} ({{ option.price ? option.price.toLocaleString() + '원' : '-' }})
            </option>
          </select>
        </div>
        
        <div class="total-info">
          <p>총 인원: {{ totalPeople }}명</p>
          <p v-if="totalPeople > 0">예상 금액: {{ estimatedPrice.toLocaleString() }}원</p>
        </div>
        
        <div class="action-buttons">
          <button 
            class="btn-reserve" 
            @click="goToPayment"
            :disabled="totalPeople === 0"
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="no-selection">
      <p>날짜를 선택하세요.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router'

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = ref(today.getMonth());
const selectedDate = ref(null);
const adultCount = ref(0);
const childCount = ref(0);
const router = useRouter();

const datesInMonth = ref([]);

// 성인 1명당 50,000원, 아동 1명당 30,000원으로 가정
const ADULT_PRICE = 100;
const CHILD_PRICE = 50;

const totalPeople = computed(() => adultCount.value + childCount.value);

const localOptionId = ref('');

const estimatedPrice = computed(() => {
  let base = (adultCount.value * ADULT_PRICE) + (childCount.value * CHILD_PRICE);
  let optionPrice = localOptionId;
  if (props.product && props.product.options && localOptionId) {
    const selected = props.product.options.find(
      o => String(o.id) === String(localOptionId)
    );
    if (selected && selected.price != null) optionPrice = Number(selected.price);
  }
  // base와 optionPrice 모두 숫자임을 보장
  return Number(base) + Number(optionPrice.value);
});

const formatDate = (date) => {
  if (!date) return ''
  // 날짜를 YYYY-MM-DD 형식으로 변환 (시간대 문제 해결)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const isSelectedDate = (date) => {
  return selectedDate.value && formatDate(date) === formatDate(selectedDate.value);
};

const selectMonth = (month) => {
  currentMonth.value = month;
  selectedDate.value = null;
  resetCounts();
  generateDates();
};

const selectDate = (date) => {
  selectedDate.value = new Date(date);
  resetCounts();
};

const resetCounts = () => {
  adultCount.value = 0;
  childCount.value = 0;
};

const increaseAdult = () => {
  if (adultCount.value < 10) {
    adultCount.value++;
  }
};

const decreaseAdult = () => {
  if (adultCount.value > 0) {
    adultCount.value--;
  }
};

const increaseChild = () => {
  if (childCount.value < 10) {
    childCount.value++;
  }
};

const decreaseChild = () => {
  if (childCount.value > 0) {
    childCount.value--;
  }
};

const prevMonth = () => {
  if (currentMonth.value > today.getMonth()) {
    currentMonth.value--;
    generateDates();
    selectedDate.value = null;
    resetCounts();
  }
};

const nextMonth = () => {
  if (currentMonth.value < 11) {
    currentMonth.value++;
    generateDates();
    selectedDate.value = null;
    resetCounts();
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

const props = defineProps({
  product: { type: Object, required: false, default: null },
  optionId: { type: [String, Number], required: false, default: null },
});

const emit = defineEmits(['update:optionId']);

watch(
  () => props.product && props.product.options,
  (options) => {
    if (
      options &&
      Array.isArray(options) &&
      options.length > 0
    ) {
      localOptionId.value = String(options[0].id);
      console.log('[초기 세팅] localOptionId:', localOptionId.value);
    }
  },
  { immediate: true }
);

// watch(localOptionId, (val) => {
//   const selected = props.product?.options?.find(
//     o =>{
//       console.log('o.id:', o, 'val:', val);
//       return String(o.price) === String(val)
//     }
//   );
//   console.log('[옵션 변경] localOptionId:', val, 'selected:', selected, 'selected.price:', selected?.price, 'adultCount:', adultCount.value, 'childCount:', childCount.value);
//   emit('update:optionId', val);
// });

watch([adultCount, childCount], () => {
  console.log('[인원 변경] adultCount:', adultCount.value, 'childCount:', childCount.value, 'estimatedPrice:', estimatedPrice.value);
});

watch(estimatedPrice, (val) => {
  console.log('[금액 변경] estimatedPrice:', val);
});

const goToPayment = () => {
  if (totalPeople.value === 0) {
    alert("예약 인원을 선택해주세요.");
    return;
  }

  // 날짜를 YYYY-MM-DD 형식으로 변환 (시간대 문제 해결)
  const year = selectedDate.value.getFullYear();
  const month = String(selectedDate.value.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.value.getDate()).padStart(2, '0');
  const fishingAtStr = `${year}-${month}-${day}`;

  // product 정보 쿼리로 전달
  router.push({
    name: 'Payment',
    query: {
      fishingAt: fishingAtStr,
      adultCount: adultCount.value,
      childCount: childCount.value,
      totalPeople: totalPeople.value,
      estimatedPrice: estimatedPrice.value,
      prodId: props.product?.prodId || '',
      prodName: props.product?.prodName || '',
      prodAddress: props.product?.prodAddress || '',
      optionId: localOptionId.value
    }
  });
};

onMounted(() => {
  generateDates();
});
</script>

<style scoped>
.calendar-container {
  width: 100%;
  padding: 2rem;
  background-color: #f8fafd;
  border: 10px solid #ddd;
  border-radius: 12px;
  text-align: center;
}

.calendar-container h2,
.calendar-container h4,
.calendar-container h5 {
  text-align: center;
}

.no-selection {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.reservation-section {
  margin-top: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.selected-date-info {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.people-selection {
  max-width: 400px;
  margin: 0 auto;
}

.people-counter {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 2rem 0;
}

.counter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.counter-item label {
  font-weight: 600;
  font-size: 1.1rem;
}

.counter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.counter-controls button {
  width: 40px;
  height: 40px;
  border: 2px solid #007BFF;
  background: white;
  color: #007BFF;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.counter-controls button:hover:not(:disabled) {
  background: #007BFF;
  color: white;
}

.counter-controls button:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

.counter-controls span {
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.total-info {
  margin: 2rem 0;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #007BFF;
}

.total-info p {
  margin: 0.5rem 0;
  font-weight: 600;
}

.action-buttons {
  margin-top: 2rem;
}

.btn-reserve {
  background: #007BFF;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
}

.btn-reserve:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}

.btn-reserve:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.month-nav, .date-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  align-items: center;
  justify-content: center;
}

.month-btn, .month-control-btn {
  padding: 15px 20px;
  border: none;
  border-radius: 30px;
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
  border-radius: 10%;
  text-align: center;
  line-height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  border: none;
  cursor: pointer;
  background: #eee;
  transition: background 0.2s ease;
}

.date-btn:hover {
  background-color: #007BFF;
  color: white;
}

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

.option-select-section {
  margin-top: 24px;
  margin-bottom: 12px;
}
</style>