import Link from "next/link";
import type { Blog } from "./Blogs";

export const Article = ({ blog }: { blog: Blog }) => {
  return (
    <Link href={blog.date ? `/blog/${blog.slug}` : "#soon"}>
      <article className="p-4 md:p-8">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs duration-1000 text-secondary group-hover:text-primary group-hover:border-dark drop-shadow-orange">
            {blog.date ? (
              <time dateTime={new Date(blog.date).toISOString()}>
                {Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                  new Date(blog.date),
                )}
              </time>
            ) : (
              <span className="group-hover:text-blue-400 transition-colors">SOON</span>
            )}
          </span>
        </div>
        <h2 className="z-20 text-lg font-medium duration-1000 lg:text-2xl text-secondary group-hover:text-primary font-display">
          {blog.title}
        </h2>
        <p className="z-20 mt-4 text-sm duration-1000 text-secondary group-hover:text-onSecondary">
          {blog.description}
        </p>
      </article>
    </Link>
  );
};
