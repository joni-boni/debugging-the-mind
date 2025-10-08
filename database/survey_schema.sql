-- Survey Database Schema
-- Erstelle dedizierte Tabelle für Survey-Daten

CREATE TABLE wp_survey_responses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    age VARCHAR(50) DEFAULT NULL,
    demographics VARCHAR(100) DEFAULT NULL,
    pets TEXT DEFAULT NULL,
    motivation TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_age (age),
    INDEX idx_demographics (demographics)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Beispiel-Daten
INSERT INTO wp_survey_responses (email, age, demographics, pets, motivation) VALUES
('test@example.com', '26-35', 'employee', 'dogs, cats', 'stress, sleep'),
('user2@example.com', '18-25', 'student', 'none', 'focus, mood');