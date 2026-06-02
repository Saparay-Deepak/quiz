package com.quiz.dto;

import java.util.List;

public class QuizResultDto {
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private String status; // PASS, FAIL
    private List<QuestionFeedback> feedbacks;

    public QuizResultDto() {}

    public QuizResultDto(Integer score, Integer totalQuestions, Double percentage, String status, List<QuestionFeedback> feedbacks) {
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.percentage = percentage;
        this.status = status;
        this.feedbacks = feedbacks;
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

    public List<QuestionFeedback> getFeedbacks() {
        return feedbacks;
    }

    public void setFeedbacks(List<QuestionFeedback> feedbacks) {
        this.feedbacks = feedbacks;
    }

    public static class QuestionFeedback {
        private Long questionId;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String selectedOption; // option chosen by user (A, B, C, D or null/empty)
        private String correctOption;  // the correct option (A, B, C, D)
        private String explanation;

        public QuestionFeedback() {}

        public QuestionFeedback(Long questionId, String questionText, String optionA, String optionB, String optionC, String optionD, String selectedOption, String correctOption, String explanation) {
            this.questionId = questionId;
            this.questionText = questionText;
            this.optionA = optionA;
            this.optionB = optionB;
            this.optionC = optionC;
            this.optionD = optionD;
            this.selectedOption = selectedOption;
            this.correctOption = correctOption;
            this.explanation = explanation;
        }

        public Long getQuestionId() {
            return questionId;
        }

        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public String getOptionA() {
            return optionA;
        }

        public void setOptionA(String optionA) {
            this.optionA = optionA;
        }

        public String getOptionB() {
            return optionB;
        }

        public void setOptionB(String optionB) {
            this.optionB = optionB;
        }

        public String getOptionC() {
            return optionC;
        }

        public void setOptionC(String optionC) {
            this.optionC = optionC;
        }

        public String getOptionD() {
            return optionD;
        }

        public void setOptionD(String optionD) {
            this.optionD = optionD;
        }

        public String getSelectedOption() {
            return selectedOption;
        }

        public void setSelectedOption(String selectedOption) {
            this.selectedOption = selectedOption;
        }

        public String getCorrectOption() {
            return correctOption;
        }

        public void setCorrectOption(String correctOption) {
            this.correctOption = correctOption;
        }

        public String getExplanation() {
            return explanation;
        }

        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }
    }
}
