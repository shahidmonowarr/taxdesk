import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test("dashboard shows only the signed-in user's seeded clients", async ({ page }) => {
  await expect(page.getByTestId("stat-total")).toHaveText("6");
  await page.goto("/clients");
  await expect(page.getByRole("row")).toHaveCount(7); // header + 6
  await expect(page.getByText("Private")).toHaveCount(0); // another user's record
});

test("create → search → edit → delete a client", async ({ page }) => {
  await page.goto("/clients/new");

  // Server-side validation, returned per field, form keeps what was typed.
  await page.getByLabel("First name").fill("Yael");
  await page.getByLabel("Tax year").fill("2010");
  await page.getByLabel("SSN, last 4 digits (optional)").fill("12");
  await page.getByRole("button", { name: "Save client" }).click();
  await expect(page.getByText("Last name is required.")).toBeVisible();
  await expect(page.getByText("Tax year must be 2015 or later.")).toBeVisible();
  await expect(page.getByText("Enter exactly the last 4 digits.")).toBeVisible();
  await expect(page.getByLabel("First name")).toHaveValue("Yael");

  await page.getByLabel("Last name").fill("Cohen");
  await page.getByLabel("Email").fill("yael.cohen@example.com");
  await page.getByLabel("Tax year").fill("2024");
  await page.getByLabel("Filing status").selectOption({ label: "Married filing jointly" });
  await page.getByLabel("SSN, last 4 digits (optional)").fill("9876");
  await page.getByRole("button", { name: "Save client" }).click();

  await expect(page).toHaveURL(/\/clients\?flash=created$/);
  await expect(page.getByRole("status")).toHaveText("Client added.");

  await page.getByRole("searchbox", { name: "Search clients" }).fill("cohen");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("row")).toHaveCount(2);

  await page.getByRole("link", { name: "Edit Yael Cohen" }).click();
  await page.getByLabel("First name").fill("Yaela");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toHaveText("Client updated.");
  await expect(page.getByRole("cell", { name: "Cohen, Yaela" })).toBeVisible();

  await page.getByRole("link", { name: "Edit Yaela Cohen" }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("status")).toHaveText("Client deleted.");
  await expect(page.getByRole("cell", { name: "Cohen, Yaela" })).toHaveCount(0);
});

test("a duplicate client for the same tax year is refused with a clear message", async ({ page }) => {
  await page.goto("/clients/new");
  await page.getByLabel("First name").fill("Maria");
  await page.getByLabel("Last name").fill("Garcia");
  await page.getByLabel("Email").fill("maria.garcia@example.com");
  await page.getByLabel("Tax year").fill(String(new Date().getUTCFullYear() - 1));
  await page.getByLabel("Filing status").selectOption("SINGLE");
  await page.getByRole("button", { name: "Save client" }).click();
  await expect(page.getByTestId("form-alert")).toHaveText("This client already has a record for that tax year.");
});

test("an unknown or foreign client id is a 404, not a leak", async ({ page }) => {
  // The page streams (Suspense), so the 200 header is already sent when the
  // lookup fails; Next swaps in the not-found UI instead.
  await page.goto("/clients/does-not-exist");
  await expect(page.locator('head meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("JSON API returns the user's clients and requires a session", async ({ page, playwright }) => {
  const res = await page.request.get("/api/clients?q=chen");
  expect(res.ok()).toBe(true);
  const body = await res.json();
  expect(body.count).toBe(1);
  expect(body.data[0]).toMatchObject({ firstName: "James", lastName: "Chen" });

  const anonymous = await playwright.request.newContext({ baseURL: page.url() });
  expect((await anonymous.get("/api/clients")).status()).toBe(401);
  await anonymous.dispose();
});

test("health endpoint reports the database is up", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ status: "ok", database: "up" });
});
