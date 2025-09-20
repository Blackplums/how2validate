import { AcceptableUsePolicy } from "@/settings/acceptable-use-policy";
import { Blogs } from "@/settings/blogs";
import { Documents } from "../settings/documents.mjs";
import { PrivacyPolicy } from "@/settings/privacy-policy";
import { TermsAndConditions } from "@/settings/terms-conditions";
import { ThirdPartyServiceDisclosure } from "@/settings/third-party-service-disclosure";
export const Routes = [
    ...Documents,
    ...Blogs,
    ...AcceptableUsePolicy,
    ...PrivacyPolicy,
    ...TermsAndConditions,
    ...ThirdPartyServiceDisclosure,
];
function isRoute(node) {
    return "title" in node && "href" in node;
}
function getAllLinks(node) {
    const pages = [];
    if (isRoute(node) && !node.noLink) {
        pages.push({ title: node.title, href: node.href });
    }
    if (isRoute(node) && node.items) {
        node.items.forEach((subNode) => {
            if (isRoute(subNode)) {
                const temp = { ...subNode, href: `${node.href}${subNode.href}` };
                pages.push(...getAllLinks(temp));
            }
        });
    }
    return pages;
}
export const PageRoutes = Routes.map((it) => getAllLinks(it)).flat();
