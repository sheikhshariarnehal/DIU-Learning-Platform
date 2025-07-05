-- Insert sample data

-- Insert semesters
INSERT INTO semesters (title, description, section, has_midterm, has_final) VALUES
('Summer 2025', 'Summer semester 2025', '63_G', true, true),
('Spring 2025', 'Spring semester 2025', '63_C', true, true),
('Fall 2024', 'Fall semester 2024', '62_A', true, true);

-- Insert courses
INSERT INTO courses (title, course_code, teacher_name, semester_id) 
SELECT 'Internet of Things', 'CSE 422', 'Dr. Ahmed Rahman', id FROM semesters WHERE title = 'Summer 2025';

INSERT INTO courses (title, course_code, teacher_name, semester_id) 
SELECT 'Machine Learning', 'CSE 445', 'Dr. Sarah Khan', id FROM semesters WHERE title = 'Summer 2025';

INSERT INTO courses (title, course_code, teacher_name, semester_id) 
SELECT 'Database Systems', 'CSE 311', 'Prof. Mohammad Ali', id FROM semesters WHERE title = 'Spring 2025';

-- Insert topics
INSERT INTO topics (title, course_id, order_index) 
SELECT 'Introduction to IoT', id, 1 FROM courses WHERE course_code = 'CSE 422';

INSERT INTO topics (title, course_id, order_index) 
SELECT 'IoT Architecture', id, 2 FROM courses WHERE course_code = 'CSE 422';

INSERT INTO topics (title, course_id, order_index) 
SELECT 'Sensors and Actuators', id, 3 FROM courses WHERE course_code = 'CSE 422';

-- Insert slides
INSERT INTO slides (title, google_drive_url, topic_id, order_index)
SELECT 'IoT Overview Presentation', 'https://drive.google.com/file/d/1example/preview', id, 1 
FROM topics WHERE title = 'Introduction to IoT';

INSERT INTO slides (title, google_drive_url, topic_id, order_index)
SELECT 'IoT Applications', 'https://drive.google.com/file/d/2example/preview', id, 2 
FROM topics WHERE title = 'Introduction to IoT';

-- Insert videos
INSERT INTO videos (title, youtube_url, topic_id, order_index)
SELECT 'IoT Fundamentals', 'https://www.youtube.com/embed/6mBO2vqLv38', id, 1 
FROM topics WHERE title = 'Introduction to IoT';

INSERT INTO videos (title, youtube_url, topic_id, order_index)
SELECT 'IoT in Smart Cities', 'https://www.youtube.com/embed/QSIPNhOiMoE', id, 2 
FROM topics WHERE title = 'Introduction to IoT';

-- Insert study tools
INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'Midterm Previous Questions 2024', 'previous_questions', 'https://drive.google.com/file/d/3example/preview', id, 'midterm'
FROM courses WHERE course_code = 'CSE 422';

INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'IoT Exam Notes', 'exam_note', 'https://drive.google.com/file/d/4example/preview', id, 'both'
FROM courses WHERE course_code = 'CSE 422';

INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'Course Syllabus', 'syllabus', 'https://drive.google.com/file/d/5example/preview', id, 'both'
FROM courses WHERE course_code = 'CSE 422';

INSERT INTO study_tools (title, type, content_url, course_id, exam_type)
SELECT 'Mark Distribution', 'mark_distribution', 'https://drive.google.com/file/d/6example/preview', id, 'both'
FROM courses WHERE course_code = 'CSE 422';
