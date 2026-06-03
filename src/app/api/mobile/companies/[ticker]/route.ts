import { NextResponse } from "next/server";

import { getMobileCompany } from "@/lib/mobile/snapshot";

type CompanyApiProps = {
  params: Promise<{ ticker: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: CompanyApiProps) {
  const { ticker } = await params;
  const company = await getMobileCompany(ticker);

  if (!company) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(company);
}
