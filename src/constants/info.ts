import type { TechStackCategory, Project, Education } from "@/types/info";

export const TECH_STACKS: Record<string, TechStackCategory> = {
  language: {
    title: "Language",
    badges: [
      { name: "C++", color: "00599C", logo: "cplusplus", logoColor: "white" },
      { name: "Java", color: "007396", logo: "java", logoColor: "white" },
      { name: "JavaScript", color: "F7DF1E", logo: "javascript", logoColor: "black" },
      { name: "TypeScript", color: "3178C6", logo: "typescript", logoColor: "white" },
      { name: "Python", color: "3776AB", logo: "python", logoColor: "white" },
    ],
  },
  frontend: {
    title: "Frontend",
    badges: [
      { name: "React", color: "61DAFB", logo: "React", logoColor: "black" },
      { name: "Tailwind CSS", color: "06B6D4", logo: "TailwindCSS", logoColor: "white" },
      { name: "Next.js", color: "000000", logo: "Next.js", logoColor: "white" },
    ],
  },
  backend: {
    title: "Backend",
    badges: [
      { name: "Spring Boot", color: "6DB33F", logo: "SpringBoot", logoColor: "white" },
      { name: "Node.js", color: "339933", logo: "Node.js", logoColor: "white" },
      { name: "NestJS", color: "E0234E", logo: "NestJS", logoColor: "white" },
      { name: "FastAPI", color: "009688", logo: "FastAPI", logoColor: "white" },
    ],
  },
  devops: {
    title: "DevOps / Infra / DB",
    badges: [
      { name: "AWS", color: "FF9900", logo: "AWS", logoColor: "white" },
      { name: "Docker", color: "2496ED", logo: "Docker", logoColor: "white" },
      { name: "Nginx", color: "009639", logo: "Nginx", logoColor: "white" },
      { name: "MySQL", color: "4479A1", logo: "MySQL", logoColor: "white" },
      { name: "PostgreSQL", color: "4169E1", logo: "PostgreSQL", logoColor: "white" },
      { name: "MongoDB", color: "47A248", logo: "MongoDB", logoColor: "white" },
      { name: "Redis", color: "DC382D", logo: "Redis", logoColor: "white" },
    ],
  },
  collaboration: {
    title: "Collaboration",
    badges: [
      { name: "GitHub", color: "F05032", logo: "GitHub", logoColor: "white" },
      { name: "Jira", color: "0052CC", logo: "Jira", logoColor: "white" },
      { name: "Confluence", color: "172B4D", logo: "Confluence", logoColor: "white" },
      { name: "Notion", color: "FFFFFF", logo:"Notion", logoColor: "black"},
    ],
  },
};

export const ACTIVITIES: Project[] = [
  {
    title: "zkrypto 인턴",
    period: "2026. 1. ~ ",
    details: ["개발 부문"],
  },
  {
    title: "한양대학교 중앙 동아리 FORIF",
    period: "2025. 7. ~ ",
    details: [
      "SW팀 백엔드 팀장",
      "forif web v2 백엔드 개발",
      "기존 데이터베이스 관리 및 유지 보수",
      "https://forif.org/",
    ],
  },
  {
    title: "AI 생성 이미지 판별 모델 개발",
    period: "2025. 9. ~ 2025. 11.",
    details: [
      "담당: 데이터 전처리, 모델 구현, github 관리",
      "Python, Pytorch, torchvision",
    ],
  },
  {
    title: "팀 구성 웹 풀스택 개발",
    period: "2025. 3. ~ 2025. 7.",
    details: [
      "FE - React, Next.js",
      "BE - Next.js API Routes",
      "Deployment/Infra - AWS EC2, RDS",
    ],
  },
];

export const EDUCATION: Education[] = [
  { school: "대진고등학교", status: "졸업", period: "2021 - 2023" },
  { school: "한양대학교 정보시스템학과", status: "재학중", period: "2024 ~" },
];

export const PROFILE = {
  name: "송준우",
  introduction: `풀스택 웹 개발자를 지망하고 있습니다. \n 주로 Spring Boot를 사용한 백엔드 개발을 하며, \n AI를 활용하여 더 나은 사용자 경험을 만들어가는 개발자가 되고자 합니다.`,
} as const;
