import websiteData from "../../website-data"
import Link from "next/link"
import { Young_Serif } from 'next/font/google'

const youngSerif = Young_Serif({
  weight: ['400'],
  subsets: ["latin"]
})


const Hero = () => {
  return (
    <section className="h-[80svh] flex flex-col sm:justify-center relative space-y-3 sm:pt-0 pt-36">
      <div className="relative">
        <h1 className={`${youngSerif.className} scroll-m-20 text-6xl tracking-tight lg:text-8xl`}>
          Kai<br />
          Takami
        </h1>
        <p className={`max-w-sm leading-relaxed [&:not(:first-child)]:mt-6 text-secondary text-pretty pb-16 text-lg`}>
          Full-stack software engineer with 3+ years of experience focused on building user-centric products, delivering high-quality code, emphasizing reliable systems, and ensuring scalability.
        </p>
        {/* MOBILE */}
        <div className="sm:hidden flex text-secondary absolute right-0 -top-5">
          {websiteData.socials.map((social) => (
            <Link
              key={social.href}
              href={social.href}
              className="[&:not(:last-child)]:border-r py-3 p-3 border-dark"
              target="_blank"
            >
              <social.icon />
            </Link>
          ))
          }
        </div>
      </div>
      {/* OVER SM */}
      <div className="hidden sm:flex absolute right-0 flex-col rounded border-2 border-dark text-secondary opacity-60">
        {websiteData.socials.map((social) => (
          <Link
            key={social.href}
            href={social.href}
            className="[&:not(:last-child)]:border-b-2 py-3 p-3 border-dark"
            target="_blank"
          >
            <social.icon />
          </Link>
        ))
        }
      </div>
    </section>
  )
}

export default Hero
