import { ExternalLink } from 'lucide-react'
import { GitHubIcon } from '@/components/SocialLinks'
import type { Project } from '@/data/projects'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
      <h3 className="font-semibold text-lg">{project.title}</h3>
      <p className="text-gray-600 text-sm flex-1">{project.description}</p>
      <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
        {project.techStack.map((tech) => (
          <li key={tech}>
            <span className="bg-blue-50 text-brand rounded-full px-3 py-1 text-sm font-medium">
              {tech}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-4">
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${project.title} on GitHub`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <GitHubIcon size={16} />
          GitHub
        </a>
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${project.title} live demo`}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ExternalLink size={16} />
            Live Demo
          </a>
        )}
      </div>
    </article>
  )
}
