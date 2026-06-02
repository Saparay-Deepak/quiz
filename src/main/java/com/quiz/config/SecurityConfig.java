package com.quiz.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF to facilitate clean, direct fetch() APIs from the static pages
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .securityContext(context -> context
                .securityContextRepository(new HttpSessionSecurityContextRepository())
            )
            .authorizeHttpRequests(auth -> auth
                // Permitted public assets and registration APIs
                .requestMatchers(
                    "/",
                    "/auth.html",
                    "/css/**",
                    "/js/**",
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/status"
                ).permitAll()
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/auth.html") // Redirect to auth.html when unauthenticated
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setContentType("application/json");
                    response.setStatus(200);
                    response.getWriter().write("{\"success\":true,\"message\":\"Logged out successfully\"}");
                })
                .permitAll()
            );

        return http.build();
    }
}
