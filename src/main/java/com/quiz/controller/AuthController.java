package com.quiz.controller;

import com.quiz.dto.AuthResponse;
import com.quiz.dto.LoginRequest;
import com.quiz.dto.RegisterRequest;
import com.quiz.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Handles user registration and exceptions.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            userService.registerUser(request);
            return ResponseEntity.ok(new AuthResponse(true, "Registration successful! You can now log in."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(false, "An error occurred during registration."));
        }
    }

    /**
     * Handles JSON-based login dynamically, setting context sessions.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            
            // Explicitly persist the SecurityContext inside the session repository to sustain authentication across requests
            securityContextRepository.saveContext(context, httpRequest, httpResponse);
            
            return ResponseEntity.ok(new AuthResponse(true, "Login successful!", request.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Invalid username or password."));
        }
    }

    /**
     * Checks if a user is currently logged in, ensuring page redirection guards.
     */
    @GetMapping("/status")
    public ResponseEntity<AuthResponse> status() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            return ResponseEntity.ok(new AuthResponse(true, "Authenticated", auth.getName()));
        }
        return ResponseEntity.ok(new AuthResponse(false, "Not authenticated"));
    }
}
