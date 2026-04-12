import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import multer from "multer";
import pdfParse from "pdf-parse";

const db = new Database("jobmatch.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY || ""; // Optional: RapidAPI key for real jobs

// ── DB Init ──────────────────────────────────────────────────────────────────

const initDb = () => {
  const schema = fs.readFileSync(path.join(process.cwd(), "database.sql"), "utf8");
  db.exec(schema);

  const skillCount = db.prepare("SELECT COUNT(*) as count FROM skills").get() as { count: number };
  if (skillCount.count === 0) {
    const skills = [
      "React", "Node.js", "TypeScript", "Python", "SQL", "AWS", "Docker",
      "Java", "C++", "Project Management", "UI/UX Design", "Marketing", "Sales"
    ];
    const insertSkill = db.prepare("INSERT INTO skills (skill_name, category) VALUES (?, ?)");
    skills.forEach(s => insertSkill.run(s, "Technical"));

    const hashedPassword = bcrypt.hashSync("admin123", 10);
    db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)")
      .run("admin@jobmatch.com", hashedPassword, "System Admin", "admin");

    const insertJob = db.prepare("INSERT INTO jobs (title, description, company, location, salary_range, job_type) VALUES (?, ?, ?, ?, ?, ?)");
    const job1 = insertJob.run("Senior Frontend Developer", "Work on modern React apps with TypeScript", "TechCorp", "Remote", "$120k - $150k", "Remote");
    const job2 = insertJob.run("Backend Engineer", "Build scalable Node.js APIs with SQL databases", "DataSystems", "New York", "$130k - $160k", "Full-time");
    const job3 = insertJob.run("Product Designer", "Design beautiful user interfaces using UI/UX principles", "CreativeStudio", "London", "$90k - $110k", "Full-time");

    const insertJobSkill = db.prepare("INSERT INTO job_skills (job_id, skill_id) VALUES (?, ?)");
    [1, 3, 11].forEach(sid => insertJobSkill.run(job1.lastInsertRowid, sid));
    [2, 5, 6].forEach(sid => insertJobSkill.run(job2.lastInsertRowid, sid));
    [11, 12].forEach(sid => insertJobSkill.run(job3.lastInsertRowid, sid));
  }
};

initDb();

// ── Gemini API ───────────────────────────────────────────────────────────────

async function callAI(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
function extractJSON(text: string): any {
  // Try to find JSON array or object in the response
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try { return JSON.parse(arrayMatch[0]); } catch { /* continue */ }
  }
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch { /* continue */ }
  }
  // Strip markdown code fences
  const clean = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); } catch { return null; }
}

// ── Multer (resume upload) ────────────────────────────────────────────────────

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Gemini: Resume Skill Extraction ──────────────────────────────────────────

async function extractSkillsFromResume(resumeText: string): Promise<{ skills: string[], name: string, summary: string }> {
  const prompt = `You are a resume parser. Extract information from this resume text.

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "name": "Full name from resume or empty string",
  "skills": ["skill1", "skill2", ...],
  "summary": "One sentence professional summary"
}

Extract ALL technical and soft skills mentioned. Include programming languages, frameworks, tools, methodologies, and domain skills.

Resume text:
${resumeText.slice(0, 4000)}`;

  const raw = await callAI(prompt);
  const parsed = extractJSON(raw);
  return {
    name: parsed?.name || "",
    skills: Array.isArray(parsed?.skills) ? parsed.skills : [],
    summary: parsed?.summary || "",
  };
}

// ── Gemini: Resume Score ──────────────────────────────────────────────────────

async function scoreResume(resumeText: string): Promise<{ score: number, breakdown: Record<string, number>, feedback: string[], strengths: string[], improvements: string[] }> {
  const prompt = `You are an expert resume reviewer. Analyze this resume and provide a detailed score.

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "score": <overall score 0-100>,
  "breakdown": {
    "skills": <0-25>,
    "experience": <0-25>,
    "education": <0-20>,
    "formatting": <0-15>,
    "keywords": <0-15>
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "feedback": ["actionable tip 1", "actionable tip 2", "actionable tip 3"]
}

Resume text:
${resumeText.slice(0, 4000)}`;

  const raw = await callAI(prompt);
  const parsed = extractJSON(raw);
  return {
    score: parsed?.score || 0,
    breakdown: parsed?.breakdown || { skills: 0, experience: 0, education: 0, formatting: 0, keywords: 0 },
    strengths: parsed?.strengths || [],
    improvements: parsed?.improvements || [],
    feedback: parsed?.feedback || [],
  };
}

// ── Gemini: Job Description Summary ──────────────────────────────────────────

async function summarizeJobDescription(description: string): Promise<{ summary: string, bullets: string[], remote: boolean, experience: string, keySkills: string[] }> {
  const prompt = `You are a job description analyzer. Summarize this job description concisely.

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "summary": "2-sentence plain language summary",
  "remote": true or false,
  "experience": "X years required or Not specified",
  "keySkills": ["skill1", "skill2", "skill3", "skill4"],
  "bullets": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"]
}

Job description:
${description.slice(0, 3000)}`;

  const raw = await callAI(prompt);
  const parsed = extractJSON(raw);
  return {
    summary: parsed?.summary || "",
    remote: parsed?.remote || false,
    experience: parsed?.experience || "Not specified",
    keySkills: parsed?.keySkills || [],
    bullets: parsed?.bullets || [],
  };
}


async function fetchJSearchJobs(query: string, location: string = ""): Promise<any[]> {
  if (!JSEARCH_API_KEY) return [];

  const params = new URLSearchParams({
    query: location ? `${query} in ${location}` : query,
    page: "1",
    num_pages: "1",
    date_posted: "month",
  });

  const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
    headers: {
      "X-RapidAPI-Key": JSEARCH_API_KEY,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return (data.data || []).map((j: any, idx: number) => ({
    job_id: `jsearch_${j.job_id || idx}`,
    title: j.job_title || "Untitled",
    company: j.employer_name || "Unknown Company",
    location: j.job_city ? `${j.job_city}, ${j.job_country}` : (j.job_country || "Remote"),
    salary_range: j.job_min_salary && j.job_max_salary
      ? `$${Math.round(j.job_min_salary / 1000)}k - $${Math.round(j.job_max_salary / 1000)}k`
      : "Not disclosed",
    job_type: j.job_employment_type || "Full-time",
    description: j.job_description?.slice(0, 300) || "",
    url: j.job_apply_link || j.job_google_link || "#",
    created_at: j.job_posted_at_datetime_utc || new Date().toISOString(),
    source: j.job_publisher?.toLowerCase().includes("dice") ? "dice" : "indeed",
    skills: [],
  }));
}

// ── Gemini-powered job generation (fallback when no JSearch key) ─────────────

async function generateJobsWithAI(userSkills: string[], count: number = 8): Promise<any[]> {
  const skillList = userSkills.join(", ");
  const prompt = `You are a job board API. Generate ${count} realistic job listings for a candidate with these skills: ${skillList}.

Return ONLY a valid JSON array (no markdown, no explanation) with exactly this structure:
[
  {
    "job_id": "ai_1",
    "title": "Job Title",
    "company": "Company Name",
    "location": "City, Country or Remote",
    "salary_range": "$XXk - $XXk",
    "job_type": "Full-time",
    "description": "2-3 sentence job description mentioning the required skills",
    "url": "https://linkedin.com/jobs",
    "source": "indeed",
    "skills": [],
    "created_at": "${new Date().toISOString()}"
  }
]

Mix sources between "indeed" and "dice". Make salaries realistic for 2025. Include a mix of remote and in-office roles. Tailor every job to the candidate's specific skills.`;

  const raw = await callAI(prompt);
  const parsed = extractJSON(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.map((j: any, idx: number) => ({
    ...j,
    job_id: `ai_${idx}_${Date.now()}`,
    source: j.source || (idx % 2 === 0 ? "indeed" : "dice"),
    skills: [],
    created_at: j.created_at || new Date().toISOString(),
  }));
}

// ── Match score ──────────────────────────────────────────────────────────────

function computeMatchScore(userSkillNames: string[], job: any): number {
  if (!userSkillNames.length) return 0;
  const hay = `${job.title} ${job.description}`.toLowerCase();
  const matched = userSkillNames.filter(s => hay.includes(s.toLowerCase()));
  return Math.round((matched.length / userSkillNames.length) * 100);
}

// ── Gemini AI: smart match analysis ─────────────────────────────────────────

async function getAIInsight(userSkills: string[], jobTitle: string, jobDescription: string): Promise<string> {
  const prompt = `A candidate has these skills: ${userSkills.join(", ")}.
They are considering this job: "${jobTitle}"
Job description: "${jobDescription}"

In exactly one sentence (max 20 words), explain why this is or isn't a good match. Be specific and direct.`;

  try {
    const result = await callAI(prompt);
    return result.trim().replace(/^["']|["']$/g, "");
  } catch {
    return "";
  }
}

// ── Express server ───────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  app.use(express.json());

  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    next();
  };

  // ── Auth ──
  app.post("/api/auth/register", (req, res) => {
    const { email, password, name, role } = req.body;
    try {
      const hp = bcrypt.hashSync(password, 10);
      const r = db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)")
        .run(email, hp, name, "candidate"); // Force candidate role for security
      res.json({ id: r.lastInsertRowid });
    } catch {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { id: user.user_id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.user_id, name: user.name, role: user.role, email: user.email } });
  });

  // ── Profile ──
  app.get("/api/profile", authenticate, (req: any, res) => {
    const user = db.prepare("SELECT user_id, email, name, phone, role FROM users WHERE user_id = ?").get(req.user.id) as any;
    const skills = db.prepare(`
      SELECT s.skill_id, s.skill_name, us.proficiency_level
      FROM skills s JOIN user_skills us ON s.skill_id = us.skill_id
      WHERE us.user_id = ?
    `).all(req.user.id);
    res.json({ ...user, skills });
  });

  app.put("/api/profile", authenticate, (req: any, res) => {
    const { name, phone, skills } = req.body;
    db.transaction(() => {
      db.prepare("UPDATE users SET name = ?, phone = ? WHERE user_id = ?").run(name, phone, req.user.id);
      db.prepare("DELETE FROM user_skills WHERE user_id = ?").run(req.user.id);
      const ins = db.prepare("INSERT INTO user_skills (user_id, skill_id, proficiency_level) VALUES (?, ?, ?)");
      skills.forEach((s: any) => ins.run(req.user.id, s.skill_id, s.proficiency_level));
    })();
    res.json({ success: true });
  });

  // ── Local Jobs ──
  app.get("/api/jobs", (req, res) => {
    const jobs = db.prepare("SELECT * FROM jobs ORDER BY created_at DESC").all() as any[];
    res.json(jobs.map(job => ({
      ...job,
      source: "local",
      skills: db.prepare(`
        SELECT s.skill_id, s.skill_name FROM skills s
        JOIN job_skills js ON s.skill_id = js.skill_id WHERE js.job_id = ?
      `).all(job.job_id),
    })));
  });

  app.post("/api/jobs", authenticate, isAdmin, (req, res) => {
    const { title, description, company, location, salary_range, job_type, skills } = req.body;
    const id = db.transaction(() => {
      const job = db.prepare("INSERT INTO jobs (title, description, company, location, salary_range, job_type) VALUES (?, ?, ?, ?, ?, ?)")
        .run(title, description, company, location, salary_range, job_type);
      const ins = db.prepare("INSERT INTO job_skills (job_id, skill_id) VALUES (?, ?)");
      skills.forEach((sid: number) => ins.run(job.lastInsertRowid, sid));
      return job.lastInsertRowid;
    })();
    res.json({ id });
  });

  app.delete("/api/jobs/:id", authenticate, isAdmin, (req, res) => {
    db.prepare("DELETE FROM jobs WHERE job_id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // ── External Job Search (JSearch or AI fallback) ──
  app.get("/api/jobs/external", async (req, res) => {
    const query = (req.query.q as string) || "software developer";
    const location = (req.query.location as string) || "";

    try {
      let jobs: any[] = [];

      if (JSEARCH_API_KEY) {
        // Real jobs from Indeed/LinkedIn via JSearch API
        jobs = await fetchJSearchJobs(query, location);
      } else if (GROQ_API_KEY) {
        // AI-generated jobs as fallback
        const skillList = query.split(" ").filter(w => w.length > 2);
        jobs = await generateJobsWithAI(skillList, 10);
      }

      const indeed = jobs.filter(j => j.source === "indeed");
      const dice = jobs.filter(j => j.source === "dice");
      res.json({ indeed, dice, total: jobs.length, source: JSEARCH_API_KEY ? "jsearch" : "ai" });
    } catch (err: any) {
      console.error("External jobs error:", err.message);
      res.json({ indeed: [], dice: [], total: 0, error: err.message });
    }
  });

  // ── Recommendations (local + Gemini AI + optional real jobs) ──
  app.get("/api/recommendations", authenticate, async (req: any, res) => {
    const threshold = parseInt(req.query.threshold as string) || 30;

    // Get user skills
    const userSkillIds = new Set(
      (db.prepare("SELECT skill_id FROM user_skills WHERE user_id = ?").all(req.user.id) as any[]).map(s => s.skill_id)
    );
    const userSkillNames = (db.prepare(`
      SELECT s.skill_name FROM skills s
      JOIN user_skills us ON s.skill_id = us.skill_id WHERE us.user_id = ?
    `).all(req.user.id) as any[]).map(s => s.skill_name);

    // Local recommendations (rule-based)
    const localJobs = db.prepare("SELECT * FROM jobs").all() as any[];
    const localRecs = localJobs.map(job => {
      const jobSkillIds = (db.prepare("SELECT skill_id FROM job_skills WHERE job_id = ?").all(job.job_id) as any[]).map(s => s.skill_id);
      if (!jobSkillIds.length) return null;
      const ms = Math.round((jobSkillIds.filter((id: number) => userSkillIds.has(id)).length / jobSkillIds.length) * 100);
      const skills = db.prepare(`
        SELECT s.skill_id, s.skill_name FROM skills s
        JOIN job_skills js ON s.skill_id = js.skill_id WHERE js.job_id = ?
      `).all(job.job_id);
      return { ...job, matchScore: ms, skills, source: "local" };
    }).filter(Boolean).filter((j: any) => j.matchScore >= threshold);

    // External jobs
    let externalRecs: any[] = [];
    if (userSkillNames.length > 0) {
      try {
        let externalJobs: any[] = [];

        if (JSEARCH_API_KEY) {
          // Real jobs from JSearch
          externalJobs = await fetchJSearchJobs(userSkillNames.slice(0, 3).join(" "));
        } else if (GROQ_API_KEY) {
          // Gemini-generated jobs tailored to user skills
          externalJobs = await generateJobsWithAI(userSkillNames, 8);
        }

        externalRecs = externalJobs
          .map(j => ({ ...j, matchScore: computeMatchScore(userSkillNames, j) }))
          .filter(j => j.matchScore >= threshold);
      } catch (err: any) {
        console.error("External recs error:", err.message);
      }
    }

    const all = [...localRecs, ...externalRecs].sort((a, b) => b.matchScore - a.matchScore);
    res.json(all);
  });

  // ── Gemini AI: Job insight for a specific job ──
  app.post("/api/jobs/insight", authenticate, async (req: any, res) => {
    const { jobTitle, jobDescription } = req.body;
    if (!GROQ_API_KEY) return res.json({ insight: "" });

    const userSkillNames = (db.prepare(`
      SELECT s.skill_name FROM skills s
      JOIN user_skills us ON s.skill_id = us.skill_id WHERE us.user_id = ?
    `).all(req.user.id) as any[]).map(s => s.skill_name);

    try {
      const insight = await getAIInsight(userSkillNames, jobTitle, jobDescription);
      res.json({ insight });
    } catch (err: any) {
      res.json({ insight: "" });
    }
  });

  // ── Gemini AI: Resume tips ──
  app.get("/api/resume-tips", authenticate, async (req: any, res) => {
    if (!GROQ_API_KEY) return res.json({ tips: [] });

    const userSkillNames = (db.prepare(`
      SELECT s.skill_name, us.proficiency_level FROM skills s
      JOIN user_skills us ON s.skill_id = us.skill_id WHERE us.user_id = ?
    `).all(req.user.id) as any[]);

    if (!userSkillNames.length) return res.json({ tips: [] });

    const skillSummary = userSkillNames.map(s => `${s.skill_name} (${s.proficiency_level})`).join(", ");
    const prompt = `A job seeker has these skills: ${skillSummary}.

Give 3 concise, actionable resume tips tailored to their specific skill set.
Return ONLY a JSON array of 3 strings, no markdown:
["tip 1", "tip 2", "tip 3"]`;

    try {
      const raw = await callAI(prompt);
      const tips = extractJSON(raw);
      res.json({ tips: Array.isArray(tips) ? tips : [] });
    } catch {
      res.json({ tips: [] });
    }
  });

  // ── Skills ──
  app.get("/api/skills", (req, res) => {
    res.json(db.prepare("SELECT * FROM skills").all());
  });

  // ── Resume Upload + Skill Extraction ──
  app.post("/api/resume/extract", authenticate, upload.single("resume"), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!GROQ_API_KEY) return res.status(400).json({ error: "AI not configured" });

    try {
      let text = "";
      if (req.file.mimetype === "application/pdf") {
        const data = await pdfParse(req.file.buffer);
        text = data.text;
      } else {
        text = req.file.buffer.toString("utf8");
      }

      const result = await extractSkillsFromResume(text);

      // Match extracted skills to DB skills
      const allSkills = db.prepare("SELECT * FROM skills").all() as any[];
      const matchedSkills = allSkills.filter(dbSkill =>
        result.skills.some(extracted =>
          extracted.toLowerCase().includes(dbSkill.skill_name.toLowerCase()) ||
          dbSkill.skill_name.toLowerCase().includes(extracted.toLowerCase())
        )
      );

      // Also add new skills not in DB
      const newSkills: string[] = result.skills.filter(extracted =>
        !allSkills.some(dbSkill =>
          extracted.toLowerCase().includes(dbSkill.skill_name.toLowerCase()) ||
          dbSkill.skill_name.toLowerCase().includes(extracted.toLowerCase())
        )
      ).slice(0, 10);

      const insertedSkills: any[] = [];
      for (const skillName of newSkills) {
        try {
          const r = db.prepare("INSERT OR IGNORE INTO skills (skill_name, category) VALUES (?, ?)").run(skillName, "Extracted");
          if (r.lastInsertRowid) {
            insertedSkills.push({ skill_id: r.lastInsertRowid, skill_name: skillName });
          }
        } catch { /* ignore duplicates */ }
      }

      res.json({
        extractedSkills: result.skills,
        matchedSkills: [...matchedSkills, ...insertedSkills],
        name: result.name,
        summary: result.summary,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Resume Score ──
  app.post("/api/resume/score", authenticate, upload.single("resume"), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!GROQ_API_KEY) return res.status(400).json({ error: "AI not configured" });

    try {
      let text = "";
      if (req.file.mimetype === "application/pdf") {
        const data = await pdfParse(req.file.buffer);
        text = data.text;
      } else {
        text = req.file.buffer.toString("utf8");
      }

      const result = await scoreResume(text);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Dashboard Analytics ──
  app.get("/api/analytics", authenticate, async (req: any, res) => {
    try {
      const userId = req.user.id;

      // Applications count
      const appsCount = (db.prepare("SELECT COUNT(*) as count FROM applications WHERE user_id = ?").get(userId) as any).count;

      // User skills
      const userSkills = (db.prepare(`
        SELECT s.skill_name FROM skills s JOIN user_skills us ON s.skill_id = us.skill_id WHERE us.user_id = ?
      `).all(userId) as any[]).map(s => s.skill_name);

      // Match rate from local jobs
      const localJobs = db.prepare("SELECT * FROM jobs").all() as any[];
      let matchRateTotal = 0;
      let matchedJobCount = 0;
      for (const job of localJobs) {
        const jobSkillIds = (db.prepare("SELECT skill_id FROM job_skills WHERE job_id = ?").all(job.job_id) as any[]).map(s => s.skill_id);
        if (!jobSkillIds.length) continue;
        const userSkillIds = new Set((db.prepare("SELECT skill_id FROM user_skills WHERE user_id = ?").all(userId) as any[]).map(s => s.skill_id));
        const ms = Math.round((jobSkillIds.filter((id: number) => userSkillIds.has(id)).length / jobSkillIds.length) * 100);
        matchRateTotal += ms;
        matchedJobCount++;
      }
      const avgMatchRate = matchedJobCount > 0 ? Math.round(matchRateTotal / matchedJobCount) : 0;

      // Skill demand: count how many jobs need each of user's skills
      const skillDemand: { skill: string, demand: number }[] = [];
      for (const skillName of userSkills) {
        const skillRow = db.prepare("SELECT skill_id FROM skills WHERE skill_name = ?").get(skillName) as any;
        if (!skillRow) continue;
        const demand = (db.prepare("SELECT COUNT(*) as count FROM job_skills WHERE skill_id = ?").get(skillRow.skill_id) as any).count;
        skillDemand.push({ skill: skillName, demand });
      }
      skillDemand.sort((a, b) => b.demand - a.demand);

      // Applications over time (last 7)
      const recentApps = db.prepare(`
        SELECT a.applied_at, j.title, j.company FROM applications a
        JOIN jobs j ON a.job_id = j.job_id WHERE a.user_id = ?
        ORDER BY a.applied_at DESC LIMIT 10
      `).all(userId) as any[];

      // Profile completeness
      const user = db.prepare("SELECT * FROM users WHERE user_id = ?").get(userId) as any;
      const completeness = Math.min(100, (
        (user.name ? 20 : 0) +
        (user.phone ? 20 : 0) +
        (userSkills.length >= 3 ? 40 : userSkills.length * 10) +
        (appsCount >= 1 ? 20 : 0)
      ));

      res.json({
        applicationsCount: appsCount,
        avgMatchRate,
        skillDemand: skillDemand.slice(0, 6),
        recentApplications: recentApps,
        profileCompleteness: completeness,
        totalSkills: userSkills.length,
        totalJobs: localJobs.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Job Description Summary ──
  app.post("/api/jobs/summarize", authenticate, async (req: any, res) => {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: "No description provided" });
    if (!GROQ_API_KEY) return res.json({ summary: description, bullets: [], remote: false, experience: "Not specified", keySkills: [] });

    try {
      const result = await summarizeJobDescription(description);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Applications ──
  app.post("/api/applications", authenticate, (req: any, res) => {
    const { jobId } = req.body;
    if (typeof jobId !== "number")
      return res.status(400).json({ error: "External jobs must be applied on their source site." });
    try {
      db.prepare("INSERT INTO applications (user_id, job_id) VALUES (?, ?)").run(req.user.id, jobId);
      res.json({ success: true });
    } catch {
      res.status(400).json({ error: "Already applied" });
    }
  });

  app.get("/api/applications", authenticate, (req: any, res) => {
    res.json(db.prepare(`
      SELECT a.*, j.title, j.company, j.location
      FROM applications a JOIN jobs j ON a.job_id = j.job_id WHERE a.user_id = ?
    `).all(req.user.id));
  });

  // ── Vite ──
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(process.cwd(), "dist/index.html")));
  }

  app.listen(3000, "0.0.0.0", () => console.log(`
  ✅ JobMatch AI running at http://localhost:3000
  🤖 Groq AI: ${GROQ_API_KEY ? "enabled" : "disabled (set GROQ_API_KEY)"}
  🔍 JSearch:   ${JSEARCH_API_KEY ? "enabled (real jobs)" : "disabled (using AI fallback)"}
  `));
}

startServer();
