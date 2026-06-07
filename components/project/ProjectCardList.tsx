'use client';

import ProjectCard from './ProjectCard';
import { ProjectCardData } from '@/types';

interface ProjectCardListProps {
  projects: ProjectCardData[];
  isLoading?: boolean;
}

export default function ProjectCardList({ projects, isLoading }: ProjectCardListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-56 rounded-lg border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">目前沒有符合條件的案件</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
