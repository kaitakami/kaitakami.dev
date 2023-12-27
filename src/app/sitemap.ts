import { MetadataRoute } from 'next'
import { blogs as _blogs } from '@/content/blogs'

export default function sitemap(): MetadataRoute.Sitemap {
  const blogs = _blogs.filter((blog) => blog.date).map((blog) => (
    {
      url: `https://www.kaitakami.dev/blog/${blog.slug}`,
      lastModified: new Date(blog.date!),
      changeFrequency: 'monthly',
    }
  )) as MetadataRoute.Sitemap
  return [
    {
      url: 'https://www.kaitakami.dev',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...blogs
  ]
}
