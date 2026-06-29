package com.medicore.config;

import com.medicore.common.constants.ErrorCodes;
import com.medicore.common.exception.CustomBusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Collections;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // CHỈ ĐỂ topic và queue ở đây thôi bạn nhé
        config.enableSimpleBroker("/topic", "/queue"); 
        
        config.setApplicationDestinationPrefixes("/app");
        
        // Dòng này mới là dòng quan trọng để định nghĩa tiền tố cho User
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Domain của Frontend
                .withSockJS(); // Hỗ trợ fallback nếu trình duyệt cũ
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // 4. CHẶN VÀ XÁC THỰC JWT NGAY KHI KẾT NỐI (Handshake)
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        if (jwtTokenProvider.validateToken(token)) {
                            String email = jwtTokenProvider.getEmailFromToken(token);
                            // Lưu thông tin user vào phiên làm việc của WebSocket
                            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
                            accessor.setUser(auth);
                            log.info("WebSocket: User {} đã kết nối thành công", email);
                        } else {
                            throw new CustomBusinessException(ErrorCodes.UNAUTHORIZED);
                        }
                    }
                }
                return message;
            }
        });
    }
}