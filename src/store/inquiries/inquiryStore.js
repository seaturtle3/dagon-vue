import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInquiryStore = defineStore('inquiryStore', () => {
    const showForm = ref(false)
    const inquiries = ref([])

    const form = ref({
        writerType: '',
        inquiryType: '',
        writer: '',
        contact: '',
        title: '',
        content: ''
    })

    const writerTypes = ref([
        { value: 'USER', label: '일반회원' },
        { value: 'PARTNER', label: '파트너' }
    ])

    const inquiryTypes = ref([
        { value: 'PRODUCT', label: '상품문의' },
        { value: 'GENERAL', label: '일반문의' }
    ])

    function toggleForm() {
        showForm.value = !showForm.value
    }


    function fetchInquiries() {
        // 예시 데이터
        inquiries.value = [
            {
                id: 1,
                title: '상품 관련 문의',
                content: '이 배는 몇 인승인가요?',
                writer: '홍길동',
                writerType: 'USER'
            }
        ]
    }

    function editInquiry(inquiry) {
        form.value = { ...inquiry }
        showForm.value = true
    }

    async function saveInquiry() {
        try {
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form.value)
            })

            const data = await response.json()

            if (response.ok) {
                alert('문의가 등록되었습니다.')
                fetchInquiries()
                toggleForm()
            } else {
                alert('저장 실패: ' + data.message || '오류가 발생했습니다.')
            }
        } catch (error) {
            console.error('저장 중 오류 발생:', error)
            alert('서버 오류가 발생했습니다.')
        }
    }

    return {
        showForm,
        form,
        inquiries,
        writerTypes,
        inquiryTypes,
        toggleForm,
        fetchInquiries,
        editInquiry,
        saveInquiry

    }
})
