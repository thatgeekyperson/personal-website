export interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  githubUrl: string
  liveUrl?: string
}

export const projects: Project[] = [
  {
    id: 'data-pipeline',
    title: 'Data Pipeline Framework',
    description:
      'A modular Python framework for building and orchestrating scalable data pipelines. Handles ingestion, transformation, and loading with built-in retry logic and observability hooks.',
    techStack: ['Python', 'Apache Airflow', 'PostgreSQL', 'Docker', 'AWS'],
    githubUrl: 'https://github.com/thatgeekyperson/data-pipeline',
  },
  {
    id: 'personal-website',
    title: 'Personal Website',
    description:
      'This site — a minimal personal landing page built with React, TypeScript, and Tailwind CSS v4. Deployed to Vercel with zero-config CI.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Vercel'],
    githubUrl: 'https://github.com/thatgeekyperson/personal-website',
    liveUrl: 'https://manankhasgiwale.xyz',
  },
  {
    id: 'todo-app',
    title: 'Todo App',
    description:
      'A clean, responsive task manager for organizing daily to-dos with add, complete, and filter workflows.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS'],
    githubUrl: 'https://github.com/thatgeekyperson/forge',
    liveUrl: 'https://forge.manankhasgiwale.xyz',
  },
  {
    id: 'lifestream',
    title: 'Lifestream',
    description:
      'A personal dashboard for tracking habits, goals, and daily metrics over time with simple visualizations.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS'],
    githubUrl: 'https://github.com/thatgeekyperson/lifestream',
  },
  {
    id: 'project-three',
    title: 'Coming Soon',
    description:
      "Another project in the works. Check back soon or reach out to hear about what I'm building next.",
    techStack: ['TBD'],
    githubUrl: 'https://github.com/thatgeekyperson',
  },
]
