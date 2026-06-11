# AI-Powered Job Recommendation & Resume Analysis Platform

An intelligent full-stack web application that helps job seekers analyze resumes, extract skills using AI, score profile strength, and receive personalized job recommendations.

## Features

### AI Resume Analysis

* Upload PDF resumes
* Automatic skill extraction using AI
* Resume summary generation
* Candidate profile auto-population

### Resume Scoring

* AI-powered resume evaluation
* Strength and weakness analysis
* Actionable improvement suggestions

### Smart Job Recommendations

* Personalized recommendations based on skills
* Skill-match scoring
* Recommendation dashboard
* Application tracking

### Job Discovery

* Search jobs by title, skill, or keyword
* External job integration
* Job filtering and browsing

### Candidate Dashboard

* Profile management
* Skill management
* Application tracking
* Recommendation analytics

### Authentication

* Secure user registration
* Login and session management
* Protected user profiles

---

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Lucide React Icons
* Framer Motion

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* SQLite

### AI & APIs

* Groq API (Llama Models)
* JSearch API

---

## Architecture

```text
Resume Upload
      ↓
PDF Parser
      ↓
Groq AI
      ↓
Skill Extraction
      ↓
Profile Generation
      ↓
Recommendation Engine
      ↓
Job Recommendations
```

---

## Key Features Workflow

### Resume Analysis

```text
Upload Resume
      ↓
Extract Resume Text
      ↓
AI Skill Extraction
      ↓
Generate Summary
      ↓
Update User Profile
```

### Recommendation Engine

```text
User Skills
      ↓
Skill Matching
      ↓
Recommendation Scoring
      ↓
Personalized Job Suggestions
```

---

## Screenshots

### Landing Page

*Add screenshot here*

### Dashboard

*Add screenshot here*

### Resume Upload & Analysis

*Add screenshot here*

### Job Recommendations

*Add screenshot here*

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Rakesh-Tummala/job-recommendation-portal.git

cd job-recommendation-portal
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root.

```env
GROQ_API_KEY=your_groq_api_key
JSEARCH_API_KEY=your_jsearch_api_key
JWT_SECRET=your_secret_key
```

### Run Development Server

```bash
npm run dev
```

Application will start on:

```text
http://localhost:3000
```

---

## Project Highlights

* AI-powered resume skill extraction
* Automated candidate profile generation
* Resume scoring and feedback
* Personalized recommendation engine
* Responsive SaaS-inspired dark UI
* Full-stack TypeScript architecture
* Real-world API integration

---

## Future Improvements

* Real-time job aggregation
* Skill-gap analysis
* Learning roadmap generation
* Course recommendations
* AI interview preparation assistant
* Cloud-native deployment
* PostgreSQL migration
* Advanced recommendation algorithms

---

## Author

**Rakesh Tummala**

GitHub:
https://github.com/Rakesh-Tummala

LinkedIn:
*Add LinkedIn URL*

---

## License

This project is developed for educational, portfolio, and learning purposes.
