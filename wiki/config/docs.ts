import { DocsConfig } from "types"

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Blog",
      href: "/blog",
    },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Why How2Validate ?",
          href: "/docs/documentation",
        },
      ],
    },
    {
      title: "Installation and Usage",
      items: [
        {
          title: "Package Registry",
          href: "/docs/documentation/installation/package",
        },
        {
          title: "CLI",
          href: "/docs/documentation/installation/cli",
        },
        {
          title: "JavaScript",
          href: "/docs/documentation/installation/js",
        },
        {
          title: "Python",
          href: "/docs/documentation/installation/py",
        },
        {
          title: "Docker",
          href: "/docs/documentation/installation/container",
        },
      ],
    },
    {
      title: "API Reference",
      items: [
        {
          title: "API Routes",
          href: "/docs/documentation/api",
        },
      ],
    },
    {
      title: "Email Report",
      items: [
        {
          title: "Reports",
          href: "/docs/documentation/report",
          disabled:true
        },
      ],
    },
    {
      title: "FAQ's",
      items: [
        {
          title: "General",
          href: "/docs/documentation/faqs/general",
        },
        {
          title: "Installation and Usage",
          href: "/docs/documentation/faqs/installation",
        },
        {
          title: "Security",
          href: "/docs/documentation/faqs/security",
        },
        {
          title: "Troubleshooting",
          href: "/docs/documentation/faqs/trobleshoot",
        },
      ],
    },
    {
      title: "Blog",
      items: [
        {
          title: "Introduction",
          href: "/docs/in-progress",
          disabled: true,
        },
        {
          title: "Build your own",
          href: "/docs/in-progress",
          disabled: true,
        },
        {
          title: "Writing Posts",
          href: "/docs/in-progress",
          disabled: true,
        },
      ],
    },
  ],
}
