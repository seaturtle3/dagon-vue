package kroryi.dagon.repository;

import kroryi.dagon.entity.Inquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    
    // 제목 또는 내용으로 검색
    Page<Inquiry> findByTitleContainingOrContentContaining(String title, String content, Pageable pageable);
    
    // 작성자 유형으로 필터링
    Page<Inquiry> findByWriterType(String writerType, Pageable pageable);
    
    // 문의 유형으로 필터링
    Page<Inquiry> findByInquiryType(String inquiryType, Pageable pageable);
    
    // 상태로 필터링
    Page<Inquiry> findByStatus(String status, Pageable pageable);
    
    // 사용자별 문의 조회
    List<Inquiry> findByUserUno(Long userUno);
    
    // 파트너별 문의 조회
    List<Inquiry> findByPartnerUno(Long partnerUno);
} 