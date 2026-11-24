export type Category = {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
  description?: string;
};

export type Opportunity = {
  id: number;
  title: string;
  slug: string;
  provider: string;
  kind: "scholarship" | "exchange" | "tech" | "linkedin" | "internship" | "graduate";
  category: Category | null;
  summary: string;
  levels: string[];
  study_level: string;
  funding: string;
  countries: string;
  host_country?: string;
  deadline: string | null;
  days_left: number | null;
  is_open: boolean;
  application_url?: string;
  image_url?: string;
  tags: string[];
  featured: boolean;
  verified: boolean;
};

export type OpportunityDetail = Opportunity & {
  description: string;
  eligibility: string;
  documents: string[];
  source_url?: string;
  views: number;
  created_at: string;
  updated_at: string;
};

export type ChatMatch = {
  title: string;
  slug: string;
  provider: string;
  kind: string;
  deadline: string | null;
  deadline_label: string;
  days_left: number | null;
  study_level: string;
  url?: string;
};

export type ChatResponse = {
  answer: string;
  intent: string;
  matches: ChatMatch[];
  suggestions: string[];
};

export type UserProfile = {
  university: string;
  level: string;
  phone: string;
  interests: string[];
};

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  date_joined: string;
  profile: UserProfile | null;
  saved: string[];
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
