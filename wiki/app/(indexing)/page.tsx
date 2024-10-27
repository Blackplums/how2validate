import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export default async function IndexPage() {

  return (
    <>
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            How2Validate
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            A CLI tool to validate secrets for different services.
          </p>
          <div className="space-x-4">
            <Link href="/docs" className={cn(buttonVariants({ size: "lg" }))}>
              Get Started
            </Link>
            <Link
              href="/#overview"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Overview
            </Link>
            <Link
              href="/docs/documentation/installation/package"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Packages
            </Link>
            <Link
              href="/docs/documentation/faqs"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              FAQ&apos;s
            </Link>
            <Link
              href="/blog"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Blog
            </Link>
            <Link
              href="/blog"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Contribute
            </Link>
          </div>
        </div>
      </section>
      <section id="overview" className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Overview
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            How2Validate is a versatile security tool designed to streamline the process of validating sensitive secrets across various platforms and services.
            <br></br><br></br>Whether you&apos;re a developer, security professional, or DevOps engineer, How2Validate empowers you to ensure the authenticity and security of your API keys, tokens, and other critical information.
            <br></br><br></br>By leveraging the power of Python, JavaScript, and Docker, How2Validate offers a flexible and efficient solution for validating secrets against official provider endpoints. Its user-friendly command-line interface (CLI) makes it easy validating secrets, allowing you to quickly and accurately verify the integrity of your sensitive data.
          </p>
        </div>
      </section>
      <section id="why-how2validate" className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Why How2Validate ?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            In today&apos;s digital landscape, the exposure of sensitive information such as API keys, passwords, and tokens can lead to significant security breaches. These vulnerabilities often arise from:
          </p>
          <br></br>
          <ul className="grid gap-3 text-sm text-muted-foreground">
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> <p><b>Leaked API Keys</b>{" "}Unintentional exposure through public repositories or logs.</p>
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> <p><b>Invalid Credentials</b>{" "} Using outdated or incorrect credentials that can compromise systems.</p>
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> <p><b>Misconfigured Secrets</b>{" "} Improperly managed secrets leading to unauthorized access.</p>
            </li>
          </ul>
          <br></br>
          <br></br>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            <b>How2Validate</b> addresses these concerns by providing a robust solution to verify the authenticity and validity of your secrets directly with official providers. This proactive approach helps in:
          </p>
          <br></br>
          <ul className="grid gap-3 text-sm text-muted-foreground">
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> <p><b>Mitigating Risks</b>{" "} Prevent unauthorized access by ensuring only active secrets are used.</p>
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> <p><b>Enhancing Security Posture</b>{" "} Strengthen your application&apos;s security by regularly validating secrets.</p>
            </li>

            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> <p><b>Misconfigured Secrets</b>{" "} Improperly managed secrets leading to unauthorized access.</p>
            </li>
          </ul>
        </div>
      </section>
      <section
        id="features"
        className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Features
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            How2Validate offers a range of features designed to enhance the security and efficiency of secret management
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <div className="space-y-2">
                <h3 className="font-bold">Validate API Keys, Passwords, and Sensitive Information</h3>
                <p className="text-sm text-muted-foreground">
                  Interacts with official provider authentication endpoints to ensure the authenticity of secrets.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <div className="space-y-2">
                <h3 className="font-bold">Cross-Platform Support</h3>
                <p className="text-sm text-muted-foreground">
                  Available for JavaScript, Python, and Docker environments.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <div className="space-y-2">
                <h3 className="font-bold">Easy to Use</h3>
                <p className="text-sm text-muted-foreground">
                  Simplifies secret validation with straightforward commands and functions.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <div className="space-y-2">
                <h3 className="font-bold">Real-Time Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Instantly know the status of your secrets — whether they are active or not.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <div className="space-y-2">
                <h3 className="font-bold">Detailed Reporting (Alpha Feature)</h3>
                <p className="text-sm text-muted-foreground">
                  Receive comprehensive reports on secret validation.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <div className="space-y-2">
                <h3 className="font-bold">Updating Providers</h3>
                <p className="text-sm text-muted-foreground">
                  Keep the tool up-to-date with the latest secret providers and their secret types.
                </p>
              </div>
            </div>
          </div>
        </div>
       
      </section>
      <section id="open-source" className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Proudly Open Source
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            How2Validate is open source and powered by open source software. <br />{" "}
            The code is available on{" "}
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              GitHub
            </Link>
            .{" "}
          </p>
        </div>
      </section>
    </>
  )
}
