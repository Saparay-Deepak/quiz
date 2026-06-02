package com.quiz.dto;

import java.time.LocalDateTime;

public class AttemptHistoryDto {
    private Long id;
    private String category;
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private String status;
    private LocalDateTime attemptedAt;

    public AttemptHistoryDto() {}

    public AttemptHistoryDto(Long id, String category, Integer score, Integer totalQuestions, Double percentage, String status, LocalDateTime attemptedAt) {
        this.id = id;
        this.category = category;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.percentage = percentage;
        this.status = status;
        this.attemptedAt = attemptedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAttemptedAt() {
        return attemptedAt;
    }

    public void setAttemptedAt(LocalDateTime attemptedAt) {
        this.attemptedAt = attemptedAt;
    }
}
