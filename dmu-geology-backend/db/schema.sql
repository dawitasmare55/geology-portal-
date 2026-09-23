CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'staff')),
  student_id VARCHAR(50),
  year INT,
  rank VARCHAR(100),
  specialization VARCHAR(150),
  gender VARCHAR(10),
  profile_pic VARCHAR(500),
  bio TEXT,
  phone VARCHAR(50),
  office VARCHAR(150),
  needs_password_change BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL,
  course_code VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_size INT,
  file_type VARCHAR(100),
  uploaded_by INT REFERENCES users(id),
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS publications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  authors VARCHAR(500),
  year INT,
  journal VARCHAR(300),
  doi VARCHAR(300),
  abstract TEXT,
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  uploaded_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  category VARCHAR(50) DEFAULT 'News',
  content TEXT,
  image_url VARCHAR(500),
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  link VARCHAR(500),
  location VARCHAR(255),
  event_date DATE,
  news_date DATE DEFAULT CURRENT_DATE,
  uploaded_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);