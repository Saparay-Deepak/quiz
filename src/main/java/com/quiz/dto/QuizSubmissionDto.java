package com.quiz.dto;

import java.util.Map;

public class QuizSubmissionDto {
    private String category;
    private Map<Long, String> answers; // Maps Question ID -> Selected Option ("A", "B", "C", "D")

    public QuizSubmissionDto() {}

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Map<Long, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Long, String> answers) {
        this.answers = answers;
    }
}
