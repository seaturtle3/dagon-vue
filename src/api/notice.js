// notice.js
export const getNotices = (page = 0, size = 5, searchDTO = {}) => {
    return new Promise((resolve) => {
        // 예시 데이터
        const exampleData = {
            data: {
                content: [
                    { id: 1, title: '공지사항 테스트 1' },
                    { id: 2, title: '공지사항 테스트 2' },
                    { id: 3, title: '공지사항 테스트 3' },
                    { id: 4, title: '공지사항 테스트 4' },
                    { id: 5, title: '공지사항 테스트 5' },
                ]
            }
        };
        setTimeout(() => resolve(exampleData), 500); // 비동기 흉내 내기
    });
};