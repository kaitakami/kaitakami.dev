import { Card } from './Card';
import { Article } from './ProjectCard';
import { projects } from '../../content/projects';

export interface Project {
  title: string;
  date?: string;
  description: string;
  github?: string;
  demo?: string;
}

const Projects = () => {
  return (
    <section className='py-10' id="projects">
      <h2 className='scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0'>Recent Projects</h2>
      <div className="grid grid-cols-1 gap-4 mx-auto lg:mx-0 md:grid-cols-3">
        <div className="grid grid-cols-1 gap-4">
          {projects
            .filter((_, i) => i % 3 === 0)
            .map((project) => (
              <Card key={project.title}>
                <Article project={project} />
              </Card>
            ))}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {projects
            .filter((_, i) => i % 3 === 1)
            .map((project) => (
              <Card key={project.title}>
                <Article project={project} />
              </Card>
            ))}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {projects
            .filter((_, i) => i % 3 === 2)
            .map((project) => (
              <Card key={project.title}>
                <Article project={project} />
              </Card>
            ))}
        </div>
      </div>
    </section>
  )
}

export default Projects

