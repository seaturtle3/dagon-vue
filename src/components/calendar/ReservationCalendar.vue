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
        <div class="people-counter-with-summary">
          <div class="people-counter">
            <div class="counter-item">
              <label>예약 인원</label>
              <div class="counter-controls">
                <button @click="decreaseAdult" :disabled="adultCount <= 0">-</button>
                <span>{{ adultCount }}</span>
                <button @click="increaseAdult" :disabled="adultCount >= 10">+</button>
              </div>
            </div>

            <!-- 옵션1 섹션 -->
            <div class="counter-item" style="margin-top: 12px;">
              <div style="display: flex; flex-direction: column; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <label style="font-weight:600; font-size:1.1rem;">옵션1 선택</label>
                  <select
                    v-model="localOptionId"
                    class="form-select"
                    style="min-width:160px; max-width:240px; padding:8px 14px; border-radius:8px; border:1.5px solid #e2e8f0; font-size:1rem;"
                    :disabled="loadingOptions"
                  >
                    <option value="default">
                      {{ loadingOptions ? '옵션 로딩 중...' : '옵션을 선택하세요.' }}
                    </option>
                    <option 
                      v-for="option in availableOptions" 
                      :key="option.optId" 
                      :value="option.optId"
                    >
                      {{ option.optName }} ({{ option.price }}원)
                    </option>
                  </select>
                </div>
                <div v-if="localOptionId && localOptionId !== 'default'" style="display: flex; justify-content: space-between; align-items: center;">
                  <label style="font-weight:600; font-size:1.1rem;">옵션1 수량</label>
                  <div class="counter-controls">
                    <button @click="decreaseOptionCount" :disabled="optionCount <= 0">-</button>
                    <span>{{ optionCount }}</span>
                    <button @click="increaseOptionCount" :disabled="optionCount >= 10">+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 옵션2 섹션 -->
            <div class="counter-item" style="margin-top: 12px;">
              <div style="display: flex; flex-direction: column; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <label style="font-weight:600; font-size:1.1rem;">옵션2 선택</label>
                  <select
                    v-model="localOptionId2"
                    class="form-select"
                    style="min-width:160px; max-width:240px; padding:8px 14px; border-radius:8px; border:1.5px solid #e2e8f0; font-size:1rem;"
                    :disabled="loadingOptions"
                  >
                    <option value="default">
                      {{ loadingOptions ? '옵션 로딩 중...' : '옵션을 선택하세요.' }}
                    </option>
                    <option 
                      v-for="option in availableOptions" 
                      :key="option.optId" 
                      :value="option.optId"
                    >
                      {{ option.optName }} ({{ option.price }}원)
                    </option>
                  </select>
                </div>
                <div v-if="localOptionId2 && localOptionId2 !== 'default'" style="display: flex; justify-content: space-between; align-items: center;">
                  <label style="font-weight:600; font-size:1.1rem;">옵션2 수량</label>
                  <div class="counter-controls">
                    <button @click="decreaseOptionCount2" :disabled="optionCount2 <= 0">-</button>
                    <span>{{ optionCount2 }}</span>
                    <button @click="increaseOptionCount2" :disabled="optionCount2 >= 10">+</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 옵션3 섹션 -->
            <div class="counter-item" style="margin-top: 12px;">
              <div style="display: flex; flex-direction: column; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <label style="font-weight:600; font-size:1.1rem;">옵션3 선택</label>
                  <select
                    v-model="localOptionId3"
                    class="form-select"
                    style="min-width:160px; max-width:240px; padding:8px 14px; border-radius:8px; border:1.5px solid #e2e8f0; font-size:1rem;"
                    :disabled="loadingOptions"
                  >
                    <option value="default">
                      {{ loadingOptions ? '옵션 로딩 중...' : '옵션을 선택하세요.' }}
                    </option>
                    <option 
                      v-for="option in availableOptions" 
                      :key="option.optId" 
                      :value="option.optId"
                    >
                      {{ option.optName }} ({{ option.price }}원)
                    </option>
                  </select>
                </div>
                <div v-if="localOptionId3 && localOptionId3 !== 'default'" style="display: flex; justify-content: space-between; align-items: center;">
                  <label style="font-weight:600; font-size:1.1rem;">옵션3 수량</label>
                  <div class="counter-controls">
                    <button @click="decreaseOptionCount3" :disabled="optionCount3 <= 0">-</button>
                    <span>{{ optionCount3 }}</span>
                    <button @click="increaseOptionCount3" :disabled="optionCount3 >= 10">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button 
            class="btn-reserve" 
            @click="goToPayment"
            :disabled="totalPeople === 0"
          >
            다음으로
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="no-selection">
      <p>날짜를 선택하세요.</p>
    </div>

    <div v-if="props.people || (props.options && props.options.length > 0)" class="summary-table-section">
      <h4>예약 요약</h4>
      <table class="summary-table">
        <thead>
          <tr>
            <th>구분</th>
            <th>이름/옵션</th>
            <th>수량</th>
            <th>단가</th>
            <th>금액</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="props.people">
            <td>인원</td>
            <td>예약 인원</td>
            <td>{{ props.people }}</td>
            <td>{{ ADULT_PRICE }}</td>
            <td>{{ props.people * ADULT_PRICE }}</td>
          </tr>
          <tr v-for="(opt, idx) in props.options" :key="idx">
            <td>옵션{{ idx+1 }}</td>
            <td>{{ opt.name }}</td>
            <td>{{ opt.count }}</td>
            <td>{{ opt.price }}</td>
            <td>{{ opt.count * opt.price }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:right; font-weight:bold;">합계</td>
            <td style="font-weight:bold;">{{ summaryTotal }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router'
import axios from '@/lib/axios.js'

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

const localOptionId = ref('default');
const optionCount = ref(0);

const localOptionId2 = ref('default');
const optionCount2 = ref(0);

const localOptionId3 = ref('default');
const optionCount3 = ref(0);

// 상품 옵션들을 저장할 상태
const productOptions = ref([]);
const loadingOptions = ref(false);

// 사용 가능한 옵션들 (API에서 가져온 옵션들)
const availableOptions = computed(() => {
  return productOptions.value;
});

// 상품 옵션 API 호출 함수
const fetchProductOptions = async () => {
  try {
    loadingOptions.value = true;
    const response = await axios.get('/api/product-option/get-all');
    productOptions.value = response.data || [];
    console.log('상품 옵션 로드 완료:', productOptions.value);
  } catch (error) {
    console.error('상품 옵션 로드 실패:', error);
    productOptions.value = [];
  } finally {
    loadingOptions.value = false;
  }
};

const estimatedPrice = computed(() => {
  let base = (adultCount.value * ADULT_PRICE) + (childCount.value * CHILD_PRICE);
  let optionPrice = 0;
  
  // 옵션1 가격 계산
  const option1 = availableOptions.value.find(opt => opt.optId == localOptionId.value);
  if (option1) {
    optionPrice += Number(option1.price) * optionCount.value;
  }
  
  // 옵션2 가격 계산
  const option2 = availableOptions.value.find(opt => opt.optId == localOptionId2.value);
  if (option2) {
    optionPrice += Number(option2.price) * optionCount2.value;
  }
  
  // 옵션3 가격 계산
  const option3 = availableOptions.value.find(opt => opt.optId == localOptionId3.value);
  if (option3) {
    optionPrice += Number(option3.price) * optionCount3.value;
  }
  
  return Number(base) + Number(optionPrice);
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
  console.log('Date selected:', selectedDate.value);
  console.log('Formatted date:', formatDate(selectedDate.value));
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
  people: { type: Number, default: 0 },
  options: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:optionId']);

watch(localOptionId, () => { optionCount.value = 0; });

watch(localOptionId2, () => { optionCount2.value = 0; });

watch(localOptionId3, () => { optionCount3.value = 0; });

watch([adultCount, childCount], () => {
  console.log('[인원 변경] adultCount:', adultCount.value, 'childCount:', childCount.value, 'estimatedPrice:', estimatedPrice.value);
});

watch(estimatedPrice, (val) => {
  console.log('[금액 변경] estimatedPrice:', val);
});

// 옵션 단가 반환 함수
function getOptionPrice(optId) {
  const option = availableOptions.value.find(opt => opt.optId == optId);
  return option ? Number(option.price) : 0;
}

const goToPayment = () => {
  console.log('=== 예약 버튼 클릭 ===');
  console.log('totalPeople:', totalPeople.value);
  console.log('localOptionId:', localOptionId.value);
  console.log('localOptionId2:', localOptionId2.value);
  console.log('localOptionId3:', localOptionId3.value);
  console.log('optionCount:', optionCount.value);
  console.log('optionCount2:', optionCount2.value);
  console.log('optionCount3:', optionCount3.value);
  
  if (totalPeople.value === 0) {
    alert("예약 인원을 선택해주세요.");
    return;
  }

  // 옵션 선택 여부 확인
  if (localOptionId.value === 'default' && localOptionId2.value === 'default' && localOptionId3.value === 'default') {
    alert("최소 하나의 옵션을 선택해주세요.");
    return;
  }

  // 날짜를 YYYY-MM-DD 형식으로 변환 (시간대 문제 해결)
  const year = selectedDate.value.getFullYear();
  const month = String(selectedDate.value.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.value.getDate()).padStart(2, '0');
  const fishingAtStr = `${year}-${month}-${day}`;

  console.log('=== 전송할 쿼리 파라미터 ===');
  console.log('fishingAt:', fishingAtStr);
  console.log('optionId:', localOptionId.value);
  console.log('optionName:', getOptionName(localOptionId.value));
  console.log('optionCount:', optionCount.value);
  console.log('optionPrice:', getOptionPrice(localOptionId.value));

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
      // 옵션1 정보
      optionId: localOptionId.value,
      optionName: getOptionName(localOptionId.value),
      optionCount: optionCount.value,
      optionPrice: getOptionPrice(localOptionId.value),
      // 옵션2 정보
      optionId2: localOptionId2.value,
      optionName2: getOptionName(localOptionId2.value),
      optionCount2: optionCount2.value,
      optionPrice2: getOptionPrice(localOptionId2.value),
      // 옵션3 정보
      optionId3: localOptionId3.value,
      optionName3: getOptionName(localOptionId3.value),
      optionCount3: optionCount3.value,
      optionPrice3: getOptionPrice(localOptionId3.value)
    }
  });
};

const increaseOptionCount = () => {
  if (optionCount.value < 10) optionCount.value++;
};

const decreaseOptionCount = () => {
  if (optionCount.value > 0) optionCount.value--;
};

const increaseOptionCount2 = () => {
  if (optionCount2.value < 10) optionCount2.value++;
};

const decreaseOptionCount2 = () => {
  if (optionCount2.value > 0) optionCount2.value--;
};

const increaseOptionCount3 = () => {
  if (optionCount3.value < 10) optionCount3.value++;
};

const decreaseOptionCount3 = () => {
  if (optionCount3.value > 0) optionCount3.value--;
};

// 옵션명 반환 함수
function getOptionName(optId) {
  const option = availableOptions.value.find(opt => opt.optId == optId);
  return option ? option.optName : '-';
}

// 합계 계산 (props 기반)
const summaryTotal = computed(() => {
  let total = 0;
  if (props.people) total += props.people * ADULT_PRICE;
  if (props.options && props.options.length > 0) {
    props.options.forEach(opt => {
      total += (opt.count || 0) * (opt.price || 0);
    });
  }
  return total;
});

onMounted(async () => {
  generateDates();
  await fetchProductOptions(); // 상품 옵션 로드
  console.log('ReservationCalendar mounted');
  console.log('Product props:', props.product);
  console.log('Selected date:', selectedDate.value);
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
  display: block !important; /* 강제로 표시 */
  visibility: visible !important; /* 강제로 보이게 */
}

.selected-date-info {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.people-selection {
  max-width: 900px;
  margin: 0 auto 0 auto;
  padding-left: 32px;
  padding-right: 0.5rem;
  display: block !important; /* 강제로 표시 */
  visibility: visible !important; /* 강제로 보이게 */
}

.people-counter-with-summary {
  display: flex;
  flex-direction: row;
  gap: 32px;
  align-items: stretch;
}

.people-counter {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 0;
  flex: 1 1 100%;
  max-width: 100%;
  margin-left: 0;
}

.counter-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
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

.action-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
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

.people-selection h5 {
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .people-counter-with-summary {
    flex-direction: column;
    gap: 0;
  }
  .people-counter {
    max-width: 100%;
  }
}

.dot {
  font-size: 1.2em;
  font-weight: bold;
  color: #222;
  margin-right: 8px;
}

.summary-table-section {
  margin: 2rem 0;
}
.summary-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.summary-table th, .summary-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.summary-table th {
  background: #f5f5f5;
}
</style>