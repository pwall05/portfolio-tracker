import ThesisView from "@/components/mobile/ThesisView";
import { getMobileSnapshot } from "@/lib/mobile/snapshot";

export const dynamic = "force-dynamic";

export default async function ThesisPage() {
  const snapshot = await getMobileSnapshot();

  return <ThesisView snapshot={snapshot} />;
}
