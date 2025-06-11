package kroryi.dagon.controller.common.support;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inquiries")
public class ApiInquiryController {

    // 1. 문의 생성
    @Operation(summary = "1:1문의 생성", description = "1:1문의 생성")
    @PostMapping
    public ResponseEntity<InquiryResponseDTO> createInquiry(
            @RequestBody @Valid InquiryCreateRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 문의 생성
        InquiryResponseDTO response = inquiryService.createInquiry(userDetails.getUno(), request);
        
        // 관리자에게 알림 전송
        notificationService.sendNewInquiryNotification(response);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. 문의 리스트 조회 (검색+페이징)
    @Operation(summary = "1:1문의 리스트 조회", description = "1:1문의 리스트 조회")
    @GetMapping("/admin")
    public ResponseEntity<Page<InquiryResponseDTO>> getAdminInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String writerType,
            @RequestParam(required = false) String inquiryType,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<InquiryResponseDTO> responses = inquiryService.getAdminInquiries(pageable, keyword, writerType, inquiryType, status);

        return ResponseEntity.ok(responses);
    }
} 