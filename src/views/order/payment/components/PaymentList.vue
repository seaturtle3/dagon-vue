<template>
  <div>
    <h2>결제 목록</h2>
    <div v-if="loading">불러오는 중...</div>
    <div v-else>
      <table>
        <thead>
        <tr>
          <th>결제번호</th>
          <th>상품명</th>
          <th>결제금액</th>
          <th>구매자</th>
          <th>상태</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="payment in payments" :key="payment.id">
          <td>{{ payment.id }}</td>
          <td>{{ payment.name }}</td>
          <td>{{ payment.amount }}</td>
          <td>{{ payment.buyerName }}</td>
          <td>{{ payment.status }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { usePaymentsStore } from '@/store/payments';

const paymentsStore = usePaymentsStore();

onMounted(() => {
  paymentsStore.fetchPayments();
});

const payments = paymentsStore.payments;
const loading = paymentsStore.loading;
</script>