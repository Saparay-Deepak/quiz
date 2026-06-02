package com.quiz.service;

import com.quiz.dto.*;
import com.quiz.entity.Question;
import com.quiz.entity.QuizAttempt;
import com.quiz.entity.User;
import com.quiz.repository.QuestionRepository;
import com.quiz.repository.QuizAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuizService {

    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public QuizService(QuestionRepository questionRepository, QuizAttemptRepository quizAttemptRepository) {
        this.questionRepository = questionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
    }

    /**
     * Retrieves all 50 questions for a category, shuffles them, and converts them to secure DTOs.
     */
    public List<QuestionDto> getQuestionsByCategory(String category) {
        List<Question> questions = questionRepository.findByCategory(category);
        
        // Shuffle to provide a premium dynamic gameplay experience for multiple simultaneous users
        List<Question> shuffledList = new ArrayList<>(questions);
        Collections.shuffle(shuffledList);

        return shuffledList.stream()
                .map(q -> new QuestionDto(
                        q.getId(),
                        q.getCategory(),
                        q.getQuestionText(),
                        q.getOptionA(),
                        q.getOptionB(),
                        q.getOptionC(),
                        q.getOptionD()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Securely scores quiz submissions server-side, records the attempt, and returns a detailed review feedback.
     */
    public QuizResultDto submitQuiz(QuizSubmissionDto submission, User user) {
        String category = submission.getCategory();
        Map<Long, String> userAnswers = submission.getAnswers();

        // Retrieve actual questions from DB
        List<Question> actualQuestions = questionRepository.findByCategory(category);
        if (actualQuestions.isEmpty()) {
            throw new IllegalArgumentException("Invalid category or no questions found: " + category);
        }

        int score = 0;
        int totalQuestions = actualQuestions.size();
        List<QuizResultDto.QuestionFeedback> feedbacks = new ArrayList<>();

        for (Question q : actualQuestions) {
            String selectedOption = userAnswers != null ? userAnswers.get(q.getId()) : null;
            if (selectedOption == null) {
                selectedOption = ""; // Unanswered
            } else {
                selectedOption = selectedOption.trim();
            }

            boolean isCorrect = q.getCorrectOption().equalsIgnoreCase(selectedOption);
            if (isCorrect) {
                score++;
            }

            // Create detailed feedback item with prompt, choices, selected option, correct option, and explanation
            feedbacks.add(new QuizResultDto.QuestionFeedback(
                    q.getId(),
                    q.getQuestionText(),
                    q.getOptionA(),
                    q.getOptionB(),
                    q.getOptionC(),
                    q.getOptionD(),
                    selectedOption,
                    q.getCorrectOption(),
                    q.getExplanation()
            ));
        }

        double percentage = ((double) score / totalQuestions) * 100.0;
        // Standard academic passing grade of 50%
        String status = percentage >= 50.0 ? "PASS" : "FAIL";

        // Save attempt
        QuizAttempt attempt = new QuizAttempt(
                user,
                category,
                score,
                totalQuestions,
                Math.round(percentage * 100.0) / 100.0, // round to 2 decimal places
                status,
                LocalDateTime.now()
        );
        quizAttemptRepository.save(attempt);

        return new QuizResultDto(
                score,
                totalQuestions,
                Math.round(percentage * 100.0) / 100.0,
                status,
                feedbacks
        );
    }

    /**
     * Fetches custom history list for the logged-in user.
     */
    public List<AttemptHistoryDto> getUserHistory(User user) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserOrderByAttemptedAtDesc(user);
        return attempts.stream()
                .map(a -> new AttemptHistoryDto(
                        a.getId(),
                        a.getCategory(),
                        a.getScore(),
                        a.getTotalQuestions(),
                        a.getPercentage(),
                        a.getStatus(),
                        a.getAttemptedAt()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Compiles the top 10 overall scorers for the global leaderboard.
     */
    public List<LeaderboardDto> getLeaderboard() {
        List<QuizAttempt> topAttempts = quizAttemptRepository.findTop10ByOrderByScoreDescPercentageDescAttemptedAtAsc();
        return topAttempts.stream()
                .map(a -> new LeaderboardDto(
                        a.getUser().getUsername(),
                        a.getCategory(),
                        a.getScore(),
                        a.getTotalQuestions(),
                        a.getPercentage(),
                        a.getAttemptedAt()
                ))
                .collect(Collectors.toList());
    }
}
