import { test, expect } from "@playwright/test";

test("core pages render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Portfolio Tracker" })).toBeVisible();

  await page.goto("/logic");
  await expect(
    page.getByRole("heading", { name: "Thesis library + macro context" })
  ).toBeVisible();

  await page.goto("/financial");
  await expect(
    page.getByRole("heading", { name: "Historical results, then projections" })
  ).toBeVisible();

  await page.goto("/company/AAPL");
  await expect(page.getByRole("heading", { name: "AAPL Thesis" })).toBeVisible();
});
