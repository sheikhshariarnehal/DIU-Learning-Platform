-- Sample data for DIU Learning Platform
-- Run this script after setting up the database schema
-- Version: 2.0 - Updated with comprehensive sample data

-- Clear existing data (optional - uncomment if you want to start fresh)
-- DELETE FROM admin_sessions;
-- DELETE FROM study_tools;
-- DELETE FROM videos;
-- DELETE FROM slides;
-- DELETE FROM topics;
-- DELETE FROM courses;
-- DELETE FROM semesters;
-- DELETE FROM admin_users WHERE email != 'admin@diu.edu.bd';

-- ============================================================================
-- SEMESTERS
-- ============================================================================

-- Insert semesters (only if they don't exist)
INSERT INTO semesters (title, description, section, has_midterm, has_final)
SELECT 'Summer 2025', 'Summer semester 2025 - Advanced courses for final year students', '63_G', true, true
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE title = 'Summer 2025');

INSERT INTO semesters (title, description, section, has_midterm, has_final)
SELECT 'Spring 2025', 'Spring semester 2025 - Core computer science courses', '63_C', true, true
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE title = 'Spring 2025');

INSERT INTO semesters (title, description, section, has_midterm, has_final)
SELECT 'Fall 2024', 'Fall semester 2024 - Foundation and intermediate courses', '62_A', true, true
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE title = 'Fall 2024');

INSERT INTO semesters (title, description, section, has_midterm, has_final)
SELECT 'Summer 2024', 'Summer semester 2024 - Specialized elective courses', '62_B', true, false
WHERE NOT EXISTS (SELECT 1 FROM semesters WHERE title = 'Summer 2024');

-- ============================================================================
-- COURSES
-- ============================================================================

-- Summer 2025 Courses
INSERT INTO courses (title, course_code, teacher_name, semester_id)
SELECT 'Internet of Things', 'CSE 422', 'Dr. Ahmed Rahman', id FROM semesters WHERE title = 'Summer 2025'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CSE 422');

INSERT INTO courses (title, course_code, teacher_name, semester_id)
SELECT 'Machine Learning', 'CSE 445', 'Dr. Sarah Khan', id FROM semesters WHERE title = 'Summer 2025'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CSE 445');

INSERT INTO courses (title, course_code, teacher_name, semester_id)
SELECT 'Artificial Intelligence', 'CSE 447', 'Prof. Rashid Ahmed', id FROM semesters WHERE title = 'Summer 2025'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CSE 447');

-- Spring 2025 Courses
INSERT INTO courses (title, course_code, teacher_name, semester_id)
SELECT 'Database Systems', 'CSE 311', 'Prof. Mohammad Ali', id FROM semesters WHERE title = 'Spring 2025'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CSE 311');

INSERT INTO courses (title, course_code, teacher_name, semester_id)
SELECT 'Software Engineering', 'CSE 321', 'Dr. Fatima Begum', id FROM semesters WHERE title = 'Spring 2025'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CSE 321');

INSERT INTO courses (title, course_code, teacher_name, semester_id)
SELECT 'Computer Networks', 'CSE 331', 'Prof. Karim Hassan', id FROM semesters WHERE title = 'Spring 2025'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CSE 331');

-- Fall 2024 Courses
INSERT INTO courses (title, course_code, teacher_name, semester_id)
SELECT 'Data Structures and Algorithms', 'CSE 221', 'Dr. Nasir Uddin', id FROM semesters WHERE title = 'Fall 2024'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CSE 221');

INSERT INTO courses (title, course_code, teacher_name, semester_id)
SELECT 'Object Oriented Programming', 'CSE 211', 'Prof. Aminul Islam', id FROM semesters WHERE title = 'Fall 2024'
AND NOT EXISTS (SELECT 1 FROM courses WHERE course_code = 'CSE 211');

-- ============================================================================
-- TOPICS
-- ============================================================================

-- IoT Course Topics (CSE 422)
INSERT INTO topics (title, description, course_id, order_index)
SELECT 'Introduction to IoT', 'Basic concepts and overview of Internet of Things technology', id, 1
FROM courses WHERE course_code = 'CSE 422'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Introduction to IoT');

INSERT INTO topics (title, description, course_id, order_index)
SELECT 'IoT Architecture', 'Understanding the layered architecture and components of IoT systems', id, 2
FROM courses WHERE course_code = 'CSE 422'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'IoT Architecture');

INSERT INTO topics (title, description, course_id, order_index)
SELECT 'Sensors and Actuators', 'Hardware components for data collection and physical interaction', id, 3
FROM courses WHERE course_code = 'CSE 422'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Sensors and Actuators');

INSERT INTO topics (title, description, course_id, order_index)
SELECT 'IoT Communication Protocols', 'MQTT, CoAP, HTTP and other communication standards', id, 4
FROM courses WHERE course_code = 'CSE 422'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'IoT Communication Protocols');

INSERT INTO topics (title, description, course_id, order_index)
SELECT 'IoT Security', 'Security challenges and solutions in IoT environments', id, 5
FROM courses WHERE course_code = 'CSE 422'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'IoT Security');

-- Machine Learning Course Topics (CSE 445)
INSERT INTO topics (title, description, course_id, order_index)
SELECT 'Introduction to Machine Learning', 'Fundamentals of ML, types of learning, and applications', id, 1
FROM courses WHERE course_code = 'CSE 445'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Introduction to Machine Learning');

INSERT INTO topics (title, description, course_id, order_index)
SELECT 'Supervised Learning', 'Classification and regression algorithms', id, 2
FROM courses WHERE course_code = 'CSE 445'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Supervised Learning');

INSERT INTO topics (title, description, course_id, order_index)
SELECT 'Unsupervised Learning', 'Clustering, dimensionality reduction, and pattern discovery', id, 3
FROM courses WHERE course_code = 'CSE 445'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Unsupervised Learning');

INSERT INTO topics (title, description, course_id, order_index)
SELECT 'Neural Networks', 'Deep learning fundamentals and neural network architectures', id, 4
FROM courses WHERE course_code = 'CSE 445'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Neural Networks');

-- Database Systems Course Topics (CSE 311)
INSERT INTO topics (title, description, course_id, order_index)
SELECT 'Database Fundamentals', 'Introduction to databases, DBMS, and data models', id, 1
FROM courses WHERE course_code = 'CSE 311'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Database Fundamentals');

INSERT INTO topics (title, description, course_id, order_index)
SELECT 'Relational Model', 'Tables, relationships, and relational algebra', id, 2
FROM courses WHERE course_code = 'CSE 311'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Relational Model');

INSERT INTO topics (title, description, course_id, order_index)
SELECT 'SQL and Query Processing', 'Structured Query Language and query optimization', id, 3
FROM courses WHERE course_code = 'CSE 311'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'SQL and Query Processing');

INSERT INTO topics (title, description, course_id, order_index)
SELECT 'Database Design', 'Normalization, ER modeling, and schema design', id, 4
FROM courses WHERE course_code = 'CSE 311'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Database Design');

-- Software Engineering Course Topics (CSE 321)
INSERT INTO topics (title, description, course_id, order_index)
SELECT 'Software Development Life Cycle', 'SDLC models, methodologies, and project management', id, 1
FROM courses WHERE course_code = 'CSE 321'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Software Development Life Cycle');

INSERT INTO topics (title, description, course_id, order_index)
SELECT 'Requirements Engineering', 'Gathering, analysis, and specification of requirements', id, 2
FROM courses WHERE course_code = 'CSE 321'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Requirements Engineering');

INSERT INTO topics (title, description, course_id, order_index)
SELECT 'Software Design Patterns', 'Common design patterns and architectural principles', id, 3
FROM courses WHERE course_code = 'CSE 321'
AND NOT EXISTS (SELECT 1 FROM topics WHERE title = 'Software Design Patterns');

-- ============================================================================
-- SLIDES
-- ============================================================================

-- IoT Course Slides
INSERT INTO slides (title, google_drive_url, topic_id, order_index)
SELECT 'IoT Overview Presentation', 'https://drive.google.com/file/d/1IoTOverview/preview', id, 1
FROM topics WHERE title = 'Introduction to IoT'
AND NOT EXISTS (SELECT 1 FROM slides WHERE title = 'IoT Overview Presentation');

INSERT INTO slides (title, google_drive_url, topic_id, order_index)
SELECT 'IoT Applications and Use Cases', 'https://drive.google.com/file/d/1IoTApps/preview', id, 2
FROM topics WHERE title = 'Introduction to IoT'
AND NOT EXISTS (SELECT 1 FROM slides WHERE title = 'IoT Applications and Use Cases');

INSERT INTO slides (title, google_drive_url, topic_id, order_index)
SELECT 'IoT Architecture Layers', 'https://drive.google.com/file/d/1IoTArch/preview', id, 1
FROM topics WHERE title = 'IoT Architecture'
AND NOT EXISTS (SELECT 1 FROM slides WHERE title = 'IoT Architecture Layers');

INSERT INTO slides (title, google_drive_url, topic_id, order_index)
SELECT 'Sensor Types and Applications', 'https://drive.google.com/file/d/1Sensors/preview', id, 1
FROM topics WHERE title = 'Sensors and Actuators'
AND NOT EXISTS (SELECT 1 FROM slides WHERE title = 'Sensor Types and Applications');

-- Machine Learning Course Slides
INSERT INTO slides (title, google_drive_url, topic_id, order_index)
SELECT 'ML Introduction and Overview', 'https://drive.google.com/file/d/1MLIntro/preview', id, 1
FROM topics WHERE title = 'Introduction to Machine Learning'
AND NOT EXISTS (SELECT 1 FROM slides WHERE title = 'ML Introduction and Overview');

INSERT INTO slides (title, google_drive_url, topic_id, order_index)
SELECT 'Classification Algorithms', 'https://drive.google.com/file/d/1Classification/preview', id, 1
FROM topics WHERE title = 'Supervised Learning'
AND NOT EXISTS (SELECT 1 FROM slides WHERE title = 'Classification Algorithms');

INSERT INTO slides (title, google_drive_url, topic_id, order_index)
SELECT 'Regression Analysis', 'https://drive.google.com/file/d/1Regression/preview', id, 2
FROM topics WHERE title = 'Supervised Learning'
AND NOT EXISTS (SELECT 1 FROM slides WHERE title = 'Regression Analysis');

-- Database Course Slides
INSERT INTO slides (title, google_drive_url, topic_id, order_index)
SELECT 'Database Concepts', 'https://drive.google.com/file/d/1DBConcepts/preview', id, 1
FROM topics WHERE title = 'Database Fundamentals'
AND NOT EXISTS (SELECT 1 FROM slides WHERE title = 'Database Concepts');

INSERT INTO slides (title, google_drive_url, topic_id, order_index)
SELECT 'ER Diagrams and Modeling', 'https://drive.google.com/file/d/1ERDiagrams/preview', id, 1
FROM topics WHERE title = 'Database Design'
AND NOT EXISTS (SELECT 1 FROM slides WHERE title = 'ER Diagrams and Modeling');

-- ============================================================================
-- VIDEOS
-- ============================================================================

-- IoT Course Videos
INSERT INTO videos (title, youtube_url, topic_id, order_index)
SELECT 'IoT Fundamentals Explained', 'https://www.youtube.com/embed/6mBO2vqLv38', id, 1
FROM topics WHERE title = 'Introduction to IoT'
AND NOT EXISTS (SELECT 1 FROM videos WHERE title = 'IoT Fundamentals Explained');

INSERT INTO videos (title, youtube_url, topic_id, order_index)
SELECT 'IoT in Smart Cities', 'https://www.youtube.com/embed/QSIPNhOiMoE', id, 2
FROM topics WHERE title = 'Introduction to IoT'
AND NOT EXISTS (SELECT 1 FROM videos WHERE title = 'IoT in Smart Cities');

INSERT INTO videos (title, youtube_url, topic_id, order_index)
SELECT 'IoT Architecture Deep Dive', 'https://www.youtube.com/embed/LlhmzVL5bm8', id, 1
FROM topics WHERE title = 'IoT Architecture'
AND NOT EXISTS (SELECT 1 FROM videos WHERE title = 'IoT Architecture Deep Dive');

INSERT INTO videos (title, youtube_url, topic_id, order_index)
SELECT 'Sensor Technologies Overview', 'https://www.youtube.com/embed/Sensor123', id, 1
FROM topics WHERE title = 'Sensors and Actuators'
AND NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Sensor Technologies Overview');

-- Machine Learning Course Videos
INSERT INTO videos (title, youtube_url, topic_id, order_index)
SELECT 'Machine Learning Basics', 'https://www.youtube.com/embed/aircAruvnKk', id, 1
FROM topics WHERE title = 'Introduction to Machine Learning'
AND NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Machine Learning Basics');

INSERT INTO videos (title, youtube_url, topic_id, order_index)
SELECT 'Linear Regression Explained', 'https://www.youtube.com/embed/nk2CQITm_eo', id, 1
FROM topics WHERE title = 'Supervised Learning'
AND NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Linear Regression Explained');

INSERT INTO videos (title, youtube_url, topic_id, order_index)
SELECT 'Neural Networks Fundamentals', 'https://www.youtube.com/embed/bfmFfD2RIcg', id, 1
FROM topics WHERE title = 'Neural Networks'
AND NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Neural Networks Fundamentals');

-- Database Course Videos
INSERT INTO videos (title, youtube_url, topic_id, order_index)
SELECT 'Database Design Principles', 'https://www.youtube.com/embed/ztHopE5Wnpc', id, 1
FROM topics WHERE title = 'Database Fundamentals'
AND NOT EXISTS (SELECT 1 FROM videos WHERE title = 'Database Design Principles');

INSERT INTO videos (title, youtube_url, topic_id, order_index)
SELECT 'SQL Tutorial for Beginners', 'https://www.youtube.com/embed/HXV3zeQKqGY', id, 1
FROM topics WHERE title = 'SQL and Query Processing'
AND NOT EXISTS (SELECT 1 FROM videos WHERE title = 'SQL Tutorial for Beginners');

-- ============================================================================
-- STUDY TOOLS
-- ============================================================================

-- IoT Course Study Tools (CSE 422)
INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'IoT Midterm Previous Questions 2024', 'previous_questions', 'https://drive.google.com/file/d/IoTMidterm2024/preview', id, 'midterm'
FROM courses WHERE course_code = 'CSE 422'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'IoT Midterm Previous Questions 2024');

INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'IoT Final Previous Questions 2024', 'previous_questions', 'https://drive.google.com/file/d/IoTFinal2024/preview', id, 'final'
FROM courses WHERE course_code = 'CSE 422'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'IoT Final Previous Questions 2024');

INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'IoT Comprehensive Exam Notes', 'exam_note', 'https://drive.google.com/file/d/IoTNotes/preview', id, 'both'
FROM courses WHERE course_code = 'CSE 422'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'IoT Comprehensive Exam Notes');

INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'IoT Course Syllabus', 'syllabus', 'https://drive.google.com/file/d/IoTSyllabus/preview', id, 'both'
FROM courses WHERE course_code = 'CSE 422'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'IoT Course Syllabus');

INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'IoT Mark Distribution', 'mark_distribution', 'https://drive.google.com/file/d/IoTMarks/preview', id, 'both'
FROM courses WHERE course_code = 'CSE 422'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'IoT Mark Distribution');

-- Machine Learning Course Study Tools (CSE 445)
INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'ML Midterm Previous Questions 2024', 'previous_questions', 'https://drive.google.com/file/d/MLMidterm2024/preview', id, 'midterm'
FROM courses WHERE course_code = 'CSE 445'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'ML Midterm Previous Questions 2024');

INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'ML Algorithm Cheat Sheet', 'exam_note', 'https://drive.google.com/file/d/MLCheatSheet/preview', id, 'both'
FROM courses WHERE course_code = 'CSE 445'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'ML Algorithm Cheat Sheet');

INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'ML Course Syllabus', 'syllabus', 'https://drive.google.com/file/d/MLSyllabus/preview', id, 'both'
FROM courses WHERE course_code = 'CSE 445'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'ML Course Syllabus');

-- Database Systems Course Study Tools (CSE 311)
INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'Database Midterm Questions 2024', 'previous_questions', 'https://drive.google.com/file/d/DBMidterm2024/preview', id, 'midterm'
FROM courses WHERE course_code = 'CSE 311'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'Database Midterm Questions 2024');

INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'SQL Reference Guide', 'exam_note', 'https://drive.google.com/file/d/SQLGuide/preview', id, 'both'
FROM courses WHERE course_code = 'CSE 311'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'SQL Reference Guide');

INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'Database Design Examples', 'exam_note', 'https://drive.google.com/file/d/DBDesignExamples/preview', id, 'both'
FROM courses WHERE course_code = 'CSE 311'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'Database Design Examples');

-- Software Engineering Course Study Tools (CSE 321)
INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'SE Previous Questions Collection', 'previous_questions', 'https://drive.google.com/file/d/SEQuestions/preview', id, 'both'
FROM courses WHERE course_code = 'CSE 321'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'SE Previous Questions Collection');

INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'Design Patterns Quick Reference', 'exam_note', 'https://drive.google.com/file/d/DesignPatterns/preview', id, 'both'
FROM courses WHERE course_code = 'CSE 321'
AND NOT EXISTS (SELECT 1 FROM study_tools WHERE title = 'Design Patterns Quick Reference');

-- ============================================================================
-- ADDITIONAL ADMIN USERS (OPTIONAL)
-- ============================================================================

-- Insert additional admin users if needed
INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
SELECT 'teacher@diu.edu.bd', '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqOeKqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8', 'Teacher Account', 'admin', true
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'teacher@diu.edu.bd');

INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
SELECT 'moderator@diu.edu.bd', '$2b$10$rQZ8kqVZ8kqVZ8kqVZ8kqOeKqVZ8kqVZ8kqVZ8kqVZ8kqVZ8kqVZ8', 'Content Moderator', 'moderator', true
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'moderator@diu.edu.bd');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show summary of inserted data
SELECT
    'Semesters' as entity, COUNT(*) as count FROM semesters
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 'Topics', COUNT(*) FROM topics
UNION ALL
SELECT 'Slides', COUNT(*) FROM slides
UNION ALL
SELECT 'Videos', COUNT(*) FROM videos
UNION ALL
SELECT 'Study Tools', COUNT(*) FROM study_tools
UNION ALL
SELECT 'Admin Users', COUNT(*) FROM admin_users;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Sample data inserted successfully!';
    RAISE NOTICE '📚 Multiple semesters with courses created';
    RAISE NOTICE '📖 Topics with descriptions added';
    RAISE NOTICE '📊 Slides and videos linked to topics';
    RAISE NOTICE '📋 Study tools for exam preparation';
    RAISE NOTICE '👥 Admin users configured';
END $$;
