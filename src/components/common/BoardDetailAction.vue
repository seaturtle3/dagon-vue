<script setup>
import {useRouter} from "vue-router";
import { defineProps,defineEmits} from 'vue'

const props = defineProps({
  showEditButton: { type: Boolean, default: true },
  showDeleteButton: { type: Boolean, default: true },
  showListButton: { type: Boolean, default: true }
})

const emit = defineEmits(['edit', 'delete'])


const handleEdit = ()=> emit('edit')
const handleDelete = ()=> emit('delete')
const router = useRouter()
const goToList = () => router.push('/notice')

</script>

<template>
  <div class="board-detail-action">
    <button v-if="showEditButton" class="btn edit" @click="handleEdit">수정</button>
    <button v-if="showDeleteButton" class="btn delete" @click="handleDelete">삭제</button>
    <button v-if="showListButton" class="btn list" @click="goToList">목록</button>
  </div>
</template>

<style scoped>
.board-detail-action {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 1.5rem;
}

.btn {
  padding: 6px 14px;
  font-size: 0.9rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.btn.edit {
  background-color: #4caf50;
  color: white;
}

.btn.delete {
  background-color: #f44336;
  color: white;
}

.btn.list {
  background-color: #607d8b;
  color: white;
}
</style>