-- Database Schema for JobMatch AI Portal

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK(role IN ('candidate', 'admin')) NOT NULL DEFAULT 'candidate',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    job_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    company TEXT NOT NULL,
    location TEXT,
    salary_range TEXT,
    job_type TEXT CHECK(job_type IN ('Full-time', 'Part-time', 'Contract', 'Remote')) DEFAULT 'Full-time',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
    skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_name TEXT UNIQUE NOT NULL,
    category TEXT
);

-- User Skills Junction Table
CREATE TABLE IF NOT EXISTS user_skills (
    user_id INTEGER,
    skill_id INTEGER,
    proficiency_level TEXT CHECK(proficiency_level IN ('Beginner', 'Intermediate', 'Expert')),
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

-- Job Skills Junction Table
CREATE TABLE IF NOT EXISTS job_skills (
    job_id INTEGER,
    skill_id INTEGER,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
    application_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    job_id INTEGER,
    status TEXT DEFAULT 'Pending',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);
