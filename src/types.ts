export interface User {
  id: number;
  email: string;
  name: string;
  role: 'candidate' | 'admin';
  phone?: string;
  skills?: UserSkill[];
}

export interface Skill {
  skill_id: number;
  skill_name: string;
  category: string;
}

export interface UserSkill extends Skill {
  proficiency_level: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface Job {
  job_id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  salary_range: string;
  job_type: string;
  skills: Skill[];
  matchScore?: number;
  created_at: string;
}

export interface Application {
  application_id: number;
  user_id: number;
  job_id: number;
  status: string;
  applied_at: string;
  title: string;
  company: string;
  location: string;
}
