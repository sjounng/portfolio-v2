"use client";

import { TechStackSection, ProjectItem, EducationItem } from "@/components/info";
import { TECH_STACKS, ACTIVITIES, EDUCATION, PROFILE } from "@/constants/info";
import { FullpageScroll } from "@/components/ui/fullpage-scroll";

export default function InfoPage() {
  return (
    <FullpageScroll>
      {/* 1. Header */}
      <section className="w-full">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          안녕하세요,
          <br />
          <span className="text-foreground">{PROFILE.name}</span>입니다.
        </h1>
        <p className="text-xl text-muted leading-relaxed max-w-2xl whitespace-pre-line">
          {PROFILE.introduction}
        </p>
      </section>

      {/* 2. Tech Stack */}
      <section className="w-full">
        <h2 className="text-4xl font-bold mb-4">Stack</h2>
        <p className="text-lg text-muted mb-8">저는 다음과 같은 기술 스택을 보유하고 있습니다.</p>
        <div className="space-y-6">
          {Object.entries(TECH_STACKS).map(([key, category]) => (
            <TechStackSection key={key} category={category} />
          ))}
        </div>
      </section>

      {/* 3. Experience */}
      <section className="w-full">
        <h2 className="text-4xl font-bold mb-4">Experience</h2>
        <p className="text-lg text-muted mb-8">다양한 프로젝트와 활동을 통해 경험을 쌓고 있습니다.</p>
        <div className="space-y-6">
          {ACTIVITIES.map((activity) => (
            <ProjectItem key={activity.title} project={activity} />
          ))}
        </div>
      </section>

      {/* 4. Education */}
      <section className="w-full">
        <h2 className="text-4xl font-bold mb-4">Education</h2>
        <p className="text-lg text-muted mb-8">저의 학력 사항입니다.</p>
        <div className="space-y-6">
          {EDUCATION.map((edu) => (
            <EducationItem key={edu.school} education={edu} />
          ))}
        </div>
      </section>
    </FullpageScroll>
  );
}
