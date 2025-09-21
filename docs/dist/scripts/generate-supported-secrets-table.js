"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
var fs = require("fs");
var path = require("path");
// Paths
var jsonPath = path.join(process.cwd(), "public/tokenManager.json");
var mdxPath = path.join(process.cwd(), "contents/docs/introduction/supported-secret/index.mdx");
// Read and parse JSON
var tokenManager = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
// Collect only enabled secrets
var rows = [];
for (var _i = 0, _a = Object.entries(tokenManager); _i < _a.length; _i++) {
    var _b = _a[_i], partner = _b[0], secrets = _b[1];
    for (var _c = 0, _d = secrets; _c < _d.length; _c++) {
        var secret = _d[_c];
        if (secret.is_enabled) {
            rows.push([partner, secret.display_name]);
        }
    }
}
// Sort rows alphabetically
rows.sort(function (a, b) { return a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]); });
// Build MDX table
var tableHeader = "| Partner                           | Service                      |\n| :-------------------------------- | :--------------------------  |";
var tableRows = rows.map(function (_a) {
    var partner = _a[0], service = _a[1];
    return "| ".concat(partner.padEnd(32), " | ").concat(service.padEnd(26), " |");
});
var mdxTable = rows.length > 0
    ? __spreadArray([tableHeader], tableRows, true).join("\n")
    : "_No enabled secrets found in tokenManager.json._";
// Read the current MDX file
var mdxContent = fs.readFileSync(mdxPath, "utf-8");
// Find the marker line
var marker = "This table lists the secrets supported by How2Validate CLI.";
var before = mdxContent.split(marker)[0];
// Compose new content
var newContent = before + marker + "\n\n" + mdxTable + "\n";
// Write back the updated MDX file
fs.writeFileSync(mdxPath, newContent);
console.log("Supported secrets table updated in:", mdxPath);
