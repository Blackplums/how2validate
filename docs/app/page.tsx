import { Link } from "lib/transition"

import { Settings } from "@/lib/meta"
import { PageRoutes } from "@/lib/pageroutes"
import { buttonVariants } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <section className="flex min-h-[86.5vh] flex-col items-center justify-center px-4 py-8 text-center">
        <h1 className="mb-4 text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
          How2Validate
        </h1>
        <p className="text-foreground mb-8 max-w-[600px] text-sm sm:text-base">
          A CLI tool to validate secrets for different services.
        </p>

        {/* Responsive button grid */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
          <Link
            href={`/docs${PageRoutes[0].href}`}
            className={buttonVariants({ className: "px-6", size: "lg" })}
          >
            Get Started
          </Link>
          <Link
            href={`/docs/introduction/package_registry`}
            className={buttonVariants({ className: "px-6", size: "lg" })}
          >
            Packages
          </Link>
          <Link
            href={`/docs/introduction/supported-secret`}
            className={buttonVariants({ className: "px-6", size: "lg" })}
          >
            Supported Secrets
          </Link>
          <Link
            href={`/docs/faqs`}
            className={buttonVariants({ className: "px-6", size: "lg" })}
          >
            FAQ&apos;s
          </Link>
          {/* Uncomment if needed */}
          {/* <Link href={`/blog`} className={buttonVariants({ className: "px-6", size: "lg" })}>
            Blog
          </Link> */}
          {/* <Link href={`/apitoken`} className={buttonVariants({ className: "px-6", size: "lg" })}>
            API Token
          </Link> */}
          <Link
            href={Settings.githuburl}
            target="_blank"
            className={buttonVariants({ className: "px-6", size: "lg" })}
          >
            Contribute
          </Link>
        </div>
      </section>

      <section
        id="open-source"
        className="flex min-h-[86.5vh] flex-col items-center justify-center px-4 py-8 text-center"
      >
        <h1 className="mb-4 text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
          Proudly Open Source
        </h1>
        <p className="text-foreground mb-8 max-w-[600px] text-sm sm:text-base">
          How2Validate is open source and powered by open source software.{" "}
          <br className="hidden sm:inline" /> The code is available on{" "}
          <Link
            href={Settings.githuburl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            GitHub
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
