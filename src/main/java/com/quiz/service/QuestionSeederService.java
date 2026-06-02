package com.quiz.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quiz.entity.Question;
import com.quiz.repository.QuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;

@Service
public class QuestionSeederService implements CommandLineRunner {

    private final QuestionRepository questionRepository;
    private final ObjectMapper objectMapper;

    public QuestionSeederService(QuestionRepository questionRepository, ObjectMapper objectMapper) {
        this.questionRepository = questionRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        long count = questionRepository.count();
        if (count == 0) {
            ClassPathResource resource = new ClassPathResource("questions.json");
            try (InputStream inputStream = resource.getInputStream()) {
                List<Question> questions = objectMapper.readValue(inputStream, new TypeReference<List<Question>>() {});
                questionRepository.saveAll(questions);
                System.out.println("=== QUESTION SEEDER ===");
                System.out.println("Successfully seeded " + questions.size() + " premium MCQ questions into MySQL!");
                System.out.println("=======================");
            } catch (Exception e) {
                System.err.println("=== QUESTION SEEDER ERROR ===");
                System.err.println("Failed to seed questions from JSON: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("=== QUESTION SEEDER ===");
            System.out.println("Questions already present in the database (" + count + " questions found). Seeding skipped.");
            System.out.println("=======================");
        }
    }
}
