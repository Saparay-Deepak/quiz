package com.quiz.controller;

import com.quiz.dto.LeaderboardDto;
import com.quiz.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final QuizService quizService;

    public LeaderboardController(QuizService quizService) {
        this.quizService = quizService;
    }

    /**
     * Retrieves public top 10 scores ranking overall.
     */
    @GetMapping
    public ResponseEntity<List<LeaderboardDto>> getLeaderboard() {
        List<LeaderboardDto> leaderboard = quizService.getLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }
}
