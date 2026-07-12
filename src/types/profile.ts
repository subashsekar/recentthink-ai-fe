export const CURRENT_STATUSES = [
  'Student',
  'Working Professional',
  'Job Seeker',
  'Freelancer',
  'Career Switcher',
  'Other',
] as const;

export type CurrentStatus = (typeof CURRENT_STATUSES)[number];

export const PRIMARY_SKILLS = [
  'Python',
  'Java',
  'JavaScript',
  'C++',
  'Go',
  'Rust',
  'AI/ML',
  'Backend',
  'Frontend',
  'Full Stack',
  'Data Science',
] as const;

export type PrimarySkill = (typeof PRIMARY_SKILLS)[number];

export interface ProfileResponse {
  id: string;
  user_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  mobile_number: string | null;
  profile_picture_url: string | null;
  bio: string | null;
  current_status: CurrentStatus | null;
  college: string | null;
  company: string | null;
  current_role: string | null;
  experience_years: number | null;
  primary_skill: PrimarySkill | null;
  leetcode_username: string | null;
  hackerrank_username: string | null;
  github_username: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StatisticsResponse {
  problems_solved: number;
  courses_completed: number;
  patterns_learned: number;
  current_streak: number;
  longest_streak: number;
  learning_hours: number;
  last_active: string | null;
}

export interface PublicProfileResponse {
  username: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  github_username: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  primary_skill: PrimarySkill | null;
  profile_picture_url: string | null;
  statistics: StatisticsResponse;
}

export interface ProfileUpdateRequest {
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  mobile_number?: string | null;
  bio?: string | null;
  current_status?: CurrentStatus | null;
  college?: string | null;
  company?: string | null;
  current_role?: string | null;
  experience_years?: number | null;
  primary_skill?: PrimarySkill | null;
  leetcode_username?: string | null;
  hackerrank_username?: string | null;
  github_username?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
}

export interface AvatarUploadResponse {
  profile_picture_url: string;
}

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
