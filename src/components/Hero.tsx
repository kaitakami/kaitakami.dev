import { Syne } from "next/font/google"
import websiteData from "../../website-data"
import Link from "next/link"

const syneFont = Syne({
  style: "normal",
  subsets: ["latin"],
  weight: ["700"]
})

const Hero = () => {
  return (
    <section className="h-[90vh] flex flex-col justify-center relative space-y-3">
      <div className="relative">
        <h1 className={`${syneFont.className} scroll-m-20 text-6xl font-extrabold tracking-tight lg:text-8xl`}>
          Kai<br />
          Takami
        </h1>
        <p className="max-w-sm leading-5 [&:not(:first-child)]:mt-6 text-secondary text-pretty pb-16">
          Full-stack software engineer with 3+ years of experience focused on building user-centric products, delivering high-quality code, emphasizing reliable systems, and ensuring scalability.
        </p>
        <div className="sm:hidden flex rounded border-2 border-dark text-primary absolute right-0 -top-5">
          {websiteData.socials.map((social) => (
            <Link
              key={social.href}
              href={social.href}
              className="[&:not(:last-child)]:border-r-2 py-3 p-3 border-dark"
              target="_blank"
            >
              <social.icon />
            </Link>
          ))
          }
        </div>

      </div>
      <div className="hidden sm:flex absolute right-0 flex-col rounded border-2 border-dark text-secondary">
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
    </section>
  )
}

export default Hero
