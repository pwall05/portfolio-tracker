import { getLogicOverview } from "@/lib/data";

import InvestmentLogicClient from "@/components/logic/InvestmentLogicClient";

export default async function InvestmentLogicPage() {
  const data = await getLogicOverview();

  return <InvestmentLogicClient {...data} />;
}
