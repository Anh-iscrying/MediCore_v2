package com.medicore;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class MediCoreApplicationTests {

    @Test
    void contextLoads() {
        // Test này kiểm tra xem Spring có khởi tạo được toàn bộ hệ thống không.
        // Nếu kết nối DB lỗi, test này sẽ thất bại (Failed).
        // Nếu nó chạy qua (Passed), nghĩa là mọi cấu hình DB của bạn đã chuẩn!
    }
}