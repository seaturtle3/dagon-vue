await axios.post('/api/inquiries', {
    writerType: 'USER',
    inquiryType: 'RESERVATION',
    title: '예약 관련 문의',
    content: '예약이 안 됩니다'
})

const res = await axios.get('/api/inquiries')

await axios.put('/api/inquiries/1/answer', {
    answer: '문의 주셔서 감사합니다. 예약 완료되었습니다.'
})