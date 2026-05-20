// Legacy /briefs route — permanent redirect to /hot-cases per SOT §6.4 and §8.
// Kept as a server-side redirect so external bookmarks and any cached copy of
// the old URL still land on the renamed product.

import { redirect } from "next/navigation";

export const dynamic = "force-static";

export default function BriefsLegacyRedirect() {
  redirect("/hot-cases");
}
