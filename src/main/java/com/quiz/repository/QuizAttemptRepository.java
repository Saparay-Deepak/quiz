package com.quiz.repository;

import com.quiz.entity.QuizAttempt;
import com.quiz.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByUserOrderByAttemptedAtDesc(User user);
    
    // Fetch top 10 scores for the leaderboard
    List<QuizAttempt> findTop10ByOrderByScoreDescPercentageDescAttemptedAtAsc();
}
