import { expect, type Page } from "@playwright/test";

export const DEMO = { email: "demo@taxdesk.dev", password: "DemoPass2026", name: "Dana Preparer" };

export async function signIn(page: Page, email = DEMO.email, password = DEMO.password) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
