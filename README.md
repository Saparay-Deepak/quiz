# Premium Full-Stack Quiz Application 🚀

A modern, responsive, and secure full-stack Quiz Application built using **Spring Boot (Java 17)** on the backend and **Vanilla HTML, CSS, and JavaScript** on the frontend. 

The application supports multiple quiz categories, stores detailed user performance history, features a global top-10 leaderboard, and uses secure server-side scoring. It is configured for dual-database execution: running on **MySQL** locally and deploying seamlessly to **PostgreSQL (Neon DB)** on cloud platforms like **Render**.

🌐 **Live Deployment Link**: [https://quiz-app-xwf3.onrender.com/](https://quiz-app-xwf3.onrender.com/)

---

## 🌟 Key Features

* **Secure Authentication**: Register and login securely using Spring Security (with password hashing and session management).
* **Multiple Categories**: Dynamically loads MCQ questions for categories like **Java** and **Python** (shuffled on each load to prevent cheating).
* **Interactive Quiz Play**: Clean quiz interface featuring options selection and progress tracking.
* **Server-Side Scoring**: For high integrity, answers are submitted and graded entirely on the server.
* **Detailed Scorecard & Review**: Shows your score, percentage, status (PASS/FAIL), along with correct/incorrect answers and detailed explanations for every question.
* **Global Leaderboard**: Compares overall top 10 scorers globally based on score, percentage, and speed of submission.
* **Attempt History**: Personalized dashboard displaying all past quiz attempts with dates, scores, and status.
* **Automated Data Seeding**: Seeds the database automatically with a premium set of MCQ questions from a local JSON file upon initial startup.

---

## 🛠️ Tech Stack & Architecture

### Backend
* **Language & Runtime**: Java 17
* **Framework**: Spring Boot 3.2.4 (Spring Web, Spring Security)
* **ORM & Database Access**: Spring Data JPA / Hibernate
* **Database Compatibility**: 
  * **Local**: MySQL (using `mysql-connector-j`)
  * **Production**: PostgreSQL (using `postgresql` driver connected to Neon DB serverless)

### Frontend
* **UI Structure**: Vanilla HTML5 (Semantic elements, modern design)
* **Styling**: Premium custom CSS (Glassmorphism design, dark theme, smooth transitions, and responsive layouts for mobile/desktop)
* **Dynamic Logic**: Vanilla JavaScript (ES6, Fetch API for asynchronous REST communication)

---

## 📂 Project Structure

```text
quiz-project/
├── src/
│   ├── main/
│   │   ├── java/com/quiz/
│   │   │   ├── QuizApplication.java      # Application entrypoint
│   │   │   ├── config/                   # Spring Security configurations
│   │   │   ├── controller/               # REST API endpoints (Auth, Quiz, Leaderboard)
│   │   │   ├── dto/                      # Data Transfer Objects (Payloads & Responses)
│   │   │   ├── entity/                   # JPA Database Entities (User, Question, QuizAttempt)
│   │   │   ├── repository/               # Spring Data JPA Repositories
│   │   │   └── service/                  # Core business logic & database seeders
│   │   └── resources/
│   │       ├── application.properties    # Configuration with env variables
│   │       ├── questions.json            # Seed database questions data
│   │       └── static/                   # Frontend assets
│   │           ├── auth.html             # Login/Register view
│   │           ├── dashboard.html        # User Dashboard (Choose quiz, view history & leaderboard)
│   │           ├── quiz.html             # Question play view
│   │           ├── result.html           # Review scorecard & answer explanations
│   │           └── css/ & js/            # UI stylesheets and scripting logic
├── Dockerfile                            # Multi-stage Docker config for Render
├── .dockerignore                         # Files ignored from build context
└── pom.xml                               # Project dependencies (Maven)
```

---

## 🔌 API Endpoints

### 🔐 Authentication (`AuthController`)
* `POST /api/auth/register` - Create a new user account.
* `POST /api/auth/login` - Authenticate and login.

### 📝 Quiz Management (`QuizController`)
* `GET /api/quiz/questions?category={name}` - Fetch questions for a category (Secure, strips correct answers and explanations before sending to client).
* `POST /api/quiz/submit` - Securely grades user answers on the server, logs the attempt, and returns a detailed scorecard.
* `GET /api/quiz/history` - Fetch previous attempt history of the logged-in user.

### 🏆 Leaderboard (`LeaderboardController`)
* `GET /api/leaderboard` - Fetch the top 10 global scorers.

---

## 🚀 Local Development Setup

### Prerequisites
* Java 17 JDK or higher
* Maven (optional, or run through IDE)
* MySQL Server (running locally)

### Steps
1. Create a MySQL database on your local machine named `quiz_db`.
2. Open `src/main/resources/application.properties` and verify your local credentials. The current defaults are:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=lion
   ```
3. Run the application through your IDE or using the terminal:
   ```bash
   mvn spring-boot:run
   ```
4. Access the web interface in your browser:
   [http://localhost:8080/auth.html](http://localhost:8080/auth.html)

---

## ☁️ Deployment Configuration (Render + Neon DB)

This repository is optimized for deployment on **Render** using a **Docker** environment connected to a **Neon DB (PostgreSQL)** serverless instance.

### Render Environment Variables required:
To deploy, create a **Web Service** using the **Docker** runtime and provide the following variables under the **Environment** tab:

* `DB_URL`: `jdbc:postgresql://<neon-host-address>/neondb?sslmode=require&channel_binding=require`
* `DB_USERNAME`: `<neon_username>`
* `DB_PASSWORD`: `<neon_password>`
* `DB_DRIVER_CLASS_NAME`: `org.postgresql.Driver`
* `DB_DIALECT`: `org.hibernate.dialect.PostgreSQLDialect`
