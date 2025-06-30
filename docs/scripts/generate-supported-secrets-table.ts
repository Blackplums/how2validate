/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "fs"
import * as path from "path"

// Paths
const jsonPath = path.join(process.cwd(), "public/tokenManager.json")
const mdxPath = path.join(
  process.cwd(),
  "contents/docs/introduction/supported-secret/index.mdx"
)

// Read and parse JSON
const tokenManager = JSON.parse(fs.readFileSync(jsonPath, "utf-8"))

// Collect only enabled secrets
const rows: [string, string][] = []
for (const [partner, secrets] of Object.entries(tokenManager)) {
  for (const secret of secrets as any[]) {
    if (secret.is_enabled) {
      rows.push([partner, secret.display_name])
    }
  }
}

// Sort rows alphabetically
rows.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]))

// Build MDX table
const tableHeader =
  "| Partner                           | Service                      |\n| :-------------------------------- | :--------------------------  |"
const tableRows = rows.map(
  ([partner, service]) => `| ${partner.padEnd(32)} | ${service.padEnd(26)} |`
)
const mdxTable =
  rows.length > 0
    ? [tableHeader, ...tableRows].join("\n")
    : "_No enabled secrets found in tokenManager.json._"

// Read the current MDX file
const mdxContent = fs.readFileSync(mdxPath, "utf-8")

// Find the marker line
const marker = "This table lists the secrets supported by How2Validate CLI."
const [before] = mdxContent.split(marker)

// Compose new content
const newContent = before + marker + "\n\n" + mdxTable + "\n"

// Write back the updated MDX file
fs.writeFileSync(mdxPath, newContent)

console.log("Supported secrets table updated in:", mdxPath)
