import { expect, test } from "@playwright/test";
import { ADMIN, DEMO, signIn } from "./helpers";

test("dashboard shows the account, the session and a live database check", async ({ page }) => {
  await signIn(page);
  await expect(page.getByTestId("welcome-name")).toHaveText(DEMO.name);
  await expect(page.getByText(DEMO.email).first()).toBeVisible();
  await expect(page.getByText("Tax preparer")).toBeVisible();
  await expect(page.getByTestId("db-status")).toHaveText(/^Connected · \d+ ms$/);
  await expect(page.getByTestId("active-sessions")).toHaveText(/^[1-9]\d*$/);
});

test("each account sees its own data and role", async ({ page }) => {
  await signIn(page, ADMIN.email, ADMIN.password);
  await expect(page.getByTestId("welcome-name")).toHaveText(ADMIN.name);
  await expect(page.getByText("Administrator")).toBeVisible();
  // Visible only: Next keeps the previous route (the login page, which shows
  // the demo credentials) mounted but hidden for instant back-navigation.
  await expect(page.getByText(DEMO.email).filter({ visible: true })).toHaveCount(0);
});

test("GET /api/me returns the signed-in user and 401 without a session", async ({ page, playwright }) => {
  await signIn(page);
  const res = await page.request.get("/api/me");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.user).toMatchObject({ email: DEMO.email, name: DEMO.name, role: "PREPARER" });
  expect(body.user).not.toHaveProperty("passwordHash");

  const anonymous = await playwright.request.newContext({ baseURL: new URL(page.url()).origin });
  expect((await anonymous.get("/api/me")).status()).toBe(401);
  await anonymous.dispose();
});

test("health endpoint reports the database is up", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ status: "ok", database: "up" });
});

test("an unknown page renders the not-found screen", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
