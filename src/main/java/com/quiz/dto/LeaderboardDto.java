package com.quiz.dto;

import java.time.LocalDateTime;

public class LeaderboardDto {
    private String username;
    private String category;
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private LocalDateTime attemptedAt;

    public LeaderboardDto() {}

    public LeaderboardDto(String username, String category, Integer score, Integer totalQuestions, Double percentage, LocalDateTime attemptedAt) {
        this.username = username;
        this.category = category;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.percentage = percentage;
        this.attemptedAt = attemptedAt;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public LocalDateTime getAttemptedAt() {
        return attemptedAt;
    }

    public void setAttemptedAt(LocalDateTime attemptedAt) {
        this.attemptedAt = attemptedAt;
    }
}
