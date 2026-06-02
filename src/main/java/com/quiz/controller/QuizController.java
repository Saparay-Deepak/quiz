package com.quiz.controller;

import com.quiz.dto.*;
import com.quiz.entity.User;
import com.quiz.repository.UserRepository;
import com.quiz.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    public QuizController(QuizService quizService, UserRepository userRepository) {
        this.quizService = quizService;
        this.userRepository = userRepository;
    }

    /**
     * Serves secure stripped questions (50 questions) for the selected category.
     */
    @GetMapping("/questions")
    public ResponseEntity<List<QuestionDto>> getQuestions(@RequestParam String category) {
        try {
            List<QuestionDto> questions = quizService.getQuestionsByCategory(category);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Receives answers, scores them on the server, creates an attempt, and returns a detailed scorecard.
     */
    @PostMapping("/submit")
    public ResponseEntity<QuizResultDto> submitQuiz(@RequestBody QuizSubmissionDto submission) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        try {
            QuizResultDto result = quizService.submitQuiz(submission, user);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Fetches personal attempt history list of the logged-in user.
     */
    @GetMapping("/history")
    public ResponseEntity<List<AttemptHistoryDto>> getHistory() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<AttemptHistoryDto> history = quizService.getUserHistory(user);
        return ResponseEntity.ok(history);
    }
}
