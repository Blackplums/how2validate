import { PageRoutes } from "@/lib/pageroutes"

export const Navigations = [
  {
    title: "Documentation",
    href: `/docs${PageRoutes[0].href}`,
    external: false,
  },
  {
    title: "Blog",
    href: `/blog`,
    external: false,
  },
  {
    title: "API Token",
    href: `/apitoken`,
    external: false,
  },
]

export const GitHubLink = {
  href: "https://github.com/Blackplums/how2validate",
}
