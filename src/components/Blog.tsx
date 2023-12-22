import { Card } from './Card';
import { Article } from './Article';
import { blogs } from '../../blogs';

export interface Blog {
  title: string;
  date?: string;
  description: string;
  slug: string;
}

const Blog = () => {
  return (
    <section className='py-5'>
      <h2 className='scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0'>Blog</h2>

      <div className="grid grid-cols-1 gap-4 mx-auto lg:mx-0 md:grid-cols-3">
        <div className="grid grid-cols-1 gap-4">
          {blogs
            .filter((_, i) => i % 3 === 0)
            .map((blog) => (
              <Card key={blog.slug}>
                <Article blog={blog} />
              </Card>
            ))}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {blogs
            .filter((_, i) => i % 3 === 1)
            .map((blog) => (
              <Card key={blog.slug}>
                <Article blog={blog} />
              </Card>
            ))}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {blogs
            .filter((_, i) => i % 3 === 2)
            .map((blog) => (
              <Card key={blog.slug}>
                <Article blog={blog} />
              </Card>
            ))}
        </div>
      </div>
    </section>
  )
}

export default Blog


