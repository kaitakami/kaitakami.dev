import Link from "next/link";
import type { Project } from "./Projects";
import { Github, GithubIcon } from "lucide-react";

export const Article = ({ project }: { project: Project }) => {
  return (
    <article className="p-4 md:p-8 flex flex-col justify-between h-full">
      <div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs duration-1000 text-secondary group-hover:text-primary group-hover:border-dark drop-shadow-orange">
            {project.date ? (
              <time dateTime={new Date(project.date).toISOString()}>
                {Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                  new Date(project.date),
                )}
              </time>
            ) : (
              <span>SOON</span>
            )}
          </span>
        </div>
        <h2 className="z-20 text-lg font-medium duration-1000 lg:text-2xl text-secondary group-hover:text-primary font-display">
          {project.title}
        </h2>
        <p className="z-20 mt-4 text-sm duration-1000 text-secondary group-hover:text-onSecondary">
          {project.description}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-3">
        {project.github && (
          <Link className="flex items-center justify-center text-sm text-secondary rounded shadow h-9 px-4 py-3 bg-[#70707008] w-full hover:bg-primary hover:text-dark transition-colors" href={project.github} target="_blank">
            <GithubIcon className="h-5" />
          </Link>
        )}
        {project.demo && (
          <Link className="flex items-center justify-center text-sm text-secondary rounded shadow h-9 px-4 py-3 bg-[#70707008] w-full hover:bg-primary hover:text-dark transition-colors" href={project.demo} target="_blank">
            Live
          </Link>
        )}
      </div>
    </article>
  );
};
