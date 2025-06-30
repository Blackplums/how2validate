import { Paths } from "@/lib/pageroutes"

export const Documents: Paths[] = [
  {
    heading: "Getting Started",
    title: "Introduction",
    href: "/introduction",
    items: [
      {
        title: "Package Registry",
        href: "/package_registry",
      },
      {
        title: "CLI",
        href: "/cli",
      },
      {
        title: "Supported Secrets",
        href: "/supported-secret",
      },
      {
        title: "Installation",
        href: "/installation",
        items: [
          // {
          //   title: "JavaScript",
          //   href: "/js",
          // },
          {
            title: "Python",
            href: "/python",
          },
          {
            title: "Container",
            href: "/container",
          },
        ],
      },
    ],
  },
  {
    spacer: true,
  },
  {
    heading: "API Reference",
    title: "API Routes",
    href: "/api",
    items: [
      {
        title: "Requests",
        href: "/requests",
        items: [
          // {
          //   title: "JavaScript",
          //   href: "/js",
          // },
          {
            title: "Python",
            href: "/python",
          },
        ],
      },
      {
        title: "Response",
        href: "/response",
        items: [
          {
            title: "Schema",
            href: "/schema",
          },
        ],
      },
    ],
  },
  // {
  //   spacer: true,
  // },
  // {
  //   heading: "Email Reports",
  //   title: "Email Reports",
  //   href: "/email",
  //   items: [
  //     {
  //       title: "API Token",
  //       href: "/api_token",
  //     },
  //     {
  //       title: "Configuration",
  //       href: "/configuration",
  //     },
  //   ],
  // },
  {
    spacer: true,
  },
  {
    title: "FAQ's",
    href: "/faqs",
    heading: "Frequently Asked Questions",
    items: [
      {
        title: "General",
        href: "/general",
      },
      {
        title: "Installation and Usage",
        href: "/installation",
      },
      {
        title: "Security",
        href: "/security",
      },
      {
        title: "Troubleshooting",
        href: "/troubleshoot",
      },
    ],
  },
]
