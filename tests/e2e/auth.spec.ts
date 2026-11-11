import { expect, test } from "@playwright/test";
import { DEMO, signIn } from "./helpers";

test.describe("authentication", () => {
  test("a protected page redirects to login and returns there after sign-in", async ({ page }) => {
    await page.goto("/dashboard?from=email");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%3Ffrom%3Demail$/);

    await page.getByLabel("Email").fill(DEMO.email);
    await page.getByLabel("Password").fill(DEMO.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/dashboard\?from=email$/);
    await expect(page.getByTestId("welcome-name")).toHaveText(DEMO.name);
  });

  test("an off-site next= parameter is ignored (no open redirect)", async ({ page }) => {
    await page.goto("/login?next=//evil.example.com");
    await page.getByLabel("Email").fill(DEMO.email);
    await page.getByLabel("Password").fill(DEMO.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("shows field errors and keeps the email after a failed sign-in", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Email is required.")).toBeVisible();
    await expect(page.getByText("Password is required.")).toBeVisible();

    await page.getByLabel("Email").fill(DEMO.email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByTestId("form-alert")).toHaveText("Incorrect email or password.");
    await expect(page.getByLabel("Email")).toHaveValue(DEMO.email);
    await expect(page.getByLabel("Password")).toHaveValue("");
  });

  test("session cookie is httpOnly and SameSite=Lax", async ({ page, context }) => {
    await signIn(page);
    const cookie = (await context.cookies()).find((c) => c.name === "taxdesk_session");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");
  });

  test("sign out ends the session on the server, not just in the browser", async ({ page, context }) => {
    await signIn(page);
    await expect(page.getByTestId("current-user")).toHaveText(DEMO.name);
    const stolen = (await context.cookies()).find((c) => c.name === "taxdesk_session")!;

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Replaying the old cookie must not get back in.
    await context.addCookies([stolen]);
    const res = await page.request.get("/api/me");
    expect(res.status()).toBe(401);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("register validates input, then signs the new user in", async ({ page }) => {
    // Creates an account each run; never leave those behind on the live demo.
    test.skip(!!process.env.E2E_BASE_URL, "writes a new user; local/CI only");
    await page.goto("/register");
    await page.getByLabel("Full name").fill("New Preparer");
    await page.getByLabel("Email").fill(`new-${Date.now()}@test.dev`);
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByLabel("Confirm password").fill("different");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Password must be at least 10 characters.")).toBeVisible();
    await expect(page.getByText("Passwords do not match.")).toBeVisible();

    await page.getByLabel("Password", { exact: true }).fill("LongEnough1");
    await page.getByLabel("Confirm password").fill("LongEnough1");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("welcome-name")).toHaveText("New Preparer");
  });
});
