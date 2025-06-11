package kroryi.dagon.service.support;

import kroryi.dagon.DTO.InquiryCreateRequestDTO;
import kroryi.dagon.DTO.InquiryResponseDTO;
import kroryi.dagon.DTO.InquiryUpdateRequestDTO;
import kroryi.dagon.entity.Inquiry;
import kroryi.dagon.repository.InquiryRepository;
import kroryi.dagon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;

    // 문의 생성
    public InquiryResponseDTO createInquiry(Long userUno, InquiryCreateRequestDTO request) {
        Inquiry inquiry = new Inquiry();
        inquiry.setTitle(request.getTitle());
        inquiry.setContent(request.getContent());
        inquiry.setWriterType(request.getWriterType());
        inquiry.setInquiryType(request.getInquiryType());
        inquiry.setStatus("대기중");
        inquiry.setCreatedAt(LocalDateTime.now());
        
        // 작성자 정보 설정
        if (userUno != null) {
            inquiry.setUser(userRepository.findById(userUno)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다.")));
        }
        
        Inquiry savedInquiry = inquiryRepository.save(inquiry);
        return convertToDTO(savedInquiry);
    }

    // 관리자용 문의 리스트 조회
    public Page<InquiryResponseDTO> getAdminInquiries(Pageable pageable, String keyword, 
            String writerType, String inquiryType, String status) {
        Page<Inquiry> inquiries;
        
        if (keyword != null && !keyword.isEmpty()) {
            // 키워드 검색
            inquiries = inquiryRepository.findByTitleContainingOrContentContaining(keyword, keyword, pageable);
        } else if (writerType != null && !writerType.isEmpty()) {
            // 작성자 유형 필터링
            inquiries = inquiryRepository.findByWriterType(writerType, pageable);
        } else if (inquiryType != null && !inquiryType.isEmpty()) {
            // 문의 유형 필터링
            inquiries = inquiryRepository.findByInquiryType(inquiryType, pageable);
        } else if (status != null && !status.isEmpty()) {
            // 상태 필터링
            inquiries = inquiryRepository.findByStatus(status, pageable);
        } else {
            // 전체 조회
            inquiries = inquiryRepository.findAll(pageable);
        }
        
        return inquiries.map(this::convertToDTO);
    }

    // DTO 변환 메서드
    private InquiryResponseDTO convertToDTO(Inquiry inquiry) {
        return InquiryResponseDTO.builder()
                .id(inquiry.getId())
                .title(inquiry.getTitle())
                .content(inquiry.getContent())
                .writerType(inquiry.getWriterType())
                .inquiryType(inquiry.getInquiryType())
                .status(inquiry.getStatus())
                .createdAt(inquiry.getCreatedAt())
                .answeredAt(inquiry.getAnsweredAt())
                .answerContent(inquiry.getAnswerContent())
                .writer(inquiry.getUser() != null ? inquiry.getUser().getUid() : "비회원")
                .build();
    }

    // 기존 메서드들...
} 