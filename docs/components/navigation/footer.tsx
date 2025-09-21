import Image from "next/image"
import Link from "next/link"

import { Company, Settings } from "@/lib/meta"

export function Footer() {
  return (
    <footer className="h-16 w-full border-t">
      <div className="text-muted-foreground flex h-full w-full flex-wrap items-center justify-center gap-4 px-2 py-3 text-sm sm:justify-between sm:gap-0 sm:px-4 sm:py-0 lg:px-8">
        <p className="text-center">
          <Link
            className="font-semibold"
            href={Settings.githuburl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Built With lots of love, By
            <strong className="text-green-600 dark:text-green-400">
              {" "}
              {Settings.title}{" "}
            </strong>{" "}
            Team
          </Link>
          .
        </p>
        <div className="hidden text-center md:block">
          <Link
            className="font-normal"
            href="/docs/introduction/supported-secret"
            rel="noopener noreferrer"
          >
            {" "}
            Supported Secrets
          </Link>
        </div>
        <div className="hidden text-center md:block">
          <Link
            className="font-normal"
            href="/privacy-policy"
            rel="noopener noreferrer"
          >
            Privacy policy
          </Link>
        </div>
        <div className="hidden text-center md:block">
          <Link
            className="font-normal"
            href="/terms-conditions"
            rel="noopener noreferrer"
          >
            Terms and conditions
          </Link>
        </div>
        <div className="hidden text-center md:block">
          <Link
            className="font-normal"
            href="/third-party-service-disclosure"
            rel="noopener noreferrer"
          >
            Third-Party Services Disclosure
          </Link>
        </div>
        <div className="hidden text-center md:block">
          <Link
            className="font-normal"
            href="/acceptable-use-policy"
            rel="noopener noreferrer"
          >
            Acceptable use policy
          </Link>
        </div>
        {Company.branding !== false && (
          <div className="hidden text-center md:block">
            <Link
              className="font-semibold"
              href={Settings.githuburl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/logo.svg"
                alt="How2Validate Logo"
                width={24}
                height={24}
              />
            </Link>
          </div>
        )}
      </div>
    </footer>
  )
}
