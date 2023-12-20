import websiteData from "../../website-data"
import Link from "next/link"

const Hero = () => {
  return (
    <section className="h-[90vh] flex flex-col justify-center relative space-y-3">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-7xl">
        Kai<br />
        Takami
      </h1>
      <p className="max-w-sm leading-5 [&:not(:first-child)]:mt-6 text-secondary text-pretty pb-16">
        Full-stack software engineer with 3+ years of experience focused on building user-centric products, delivering high-quality code, emphasizing reliable systems, and ensuring scalability.
      </p>
      <div className="hidden sm:flex absolute right-0 flex-col rounded border-2 border-dark">
        {websiteData.socials.map((social) => (
          <Link
            key={social.href}
            href={social.href}
            className="[&:not(:last-child)]:border-b-2 py-3 p-3 border-dark"
            target="_blank"
          >
            <social.icon className="" />
          </Link>
        ))
        }
      </div>
      <div className="sm:hidden flex flex-col rounded border-2 border-dark">
        {websiteData.socials.map((social) => (
          <Link
            key={social.href}
            href={social.href}
            className="[&:not(:last-child)]:border-b-2 py-3 p-3 border-dark"
            target="_blank"
          >
            <social.icon className="" />
            {social.text}
          </Link>
        ))
        }
      </div>
    </section>
  )
}

export default Hero
