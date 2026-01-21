export interface TechBadge {
  name: string;
  color: string;
  logo: string;
  logoColor?: string;
}

export interface TechStackCategory {
  title: string;
  badges: TechBadge[];
}

export interface Project {
  title: string;
  period: string;
  details?: string[];
}

export interface Education {
  school: string;
  status: string;
  period: string;
}
