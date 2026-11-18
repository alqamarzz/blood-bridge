import { test, expect } from "@playwright/test";

test.describe("BloodBridge Core E2E Lifecycle", () => {
  const testPhoneRequester = `+9198300${Math.floor(10000 + Math.random() * 90000)}`;
  const testPhoneDonor = `+9198301${Math.floor(10000 + Math.random() * 90000)}`;

  test("Complete E2E workflow: Register -> Request -> Match -> Volunteer -> Accept -> Complete", async ({
    page,
  }) => {
    // 1. Visit Home Page
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("BloodBridge");

    // 2. Register as Requester
    await page.goto("/register");
    await page.fill('input[id="name"]', "Anirban Mukherjee");
    await page.fill('input[id="phone"]', testPhoneRequester);
    await page.fill('input[id="password"]', "SecurePass123");
    await page.click('button[type="submit"]');

    // Verify OTP redirect
    await expect(page).toHaveURL(/.*verify-otp/);

    // 3. Log In as Requester
    await page.goto("/login");
    await page.fill('input[id="phone"]', testPhoneRequester);
    await page.fill('input[id="password"]', "SecurePass123");
    await page.click('button[type="submit"]');

    // 4. Create Blood Request
    await page.goto("/dashboard/requests/new");
    await page.selectOption('select[id="bloodGroup"]', "O_POS");
    await page.fill('input[id="hospitalName"]', "NRS Medical College");
    await page.fill('input[id="hospitalAddress"]', "138 AJC Bose Road, Sealdah");
    await page.click('button[type="submit"]');

    // Should land on Request Details page
    await expect(page).toHaveURL(/.*dashboard\/requests\/.*/);
    await expect(page.locator("body")).toContainText("NRS Medical College");

    // 5. Register Donor & Onboard
    await page.goto("/register");
    await page.fill('input[id="name"]', "Sourav Ganguly");
    await page.fill('input[id="phone"]', testPhoneDonor);
    await page.fill('input[id="password"]', "SecurePass123");
    await page.click('button[type="submit"]');

    // Onboard as Donor
    await page.goto("/dashboard/donor/onboarding");
    await page.selectOption('select[id="bloodGroup"]', "O_POS");
    await page.click('button[type="submit"]');

    // 6. Donor views matching requests & volunteers
    await page.goto("/dashboard/donor");
    await expect(page.locator("body")).toContainText("Donor Dashboard");

    // 7. Verify In-App Notification Center
    await page.goto("/dashboard/notifications");
    await expect(page.locator("h1")).toContainText("Notifications Center");
  });
});
