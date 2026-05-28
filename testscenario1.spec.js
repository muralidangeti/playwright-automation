const { test, expect } = require('@playwright/test');
const { TIMEOUT } = require('dns');

let a = sidhu;
//Setup
const BASE_URL = "https://eventhub.rahulshettyacademy.com";
const user_email = "sidhu@gmail.com";
const user_Password = "MS@2024svec";

//Step 1 — Login
async function login(page)
{
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder("you@email.com").fill(user_email);
    await page.getByLabel("Password").fill(user_Password);
    await page.locator("#login-btn").click();
    await expect(page.getByRole("link",{name:'Browse Events →'})).toBeVisible();

}

//Step 2 — Create a new event
test("Create a new event", async({page})=>
{
    await login(page);
    await page.goto(`${BASE_URL}/admin/events`);
    const eventtitletext = "Test Event ${Date.now()} "
    
    await page.locator("#event-title-input").fill(eventtitletext)
    const Description = "'Playwright test event'"
    await page.locator("#admin-event-form textarea").fill(Description);
    await page.locator("#category").selectOption("Workshop");
    await page.getByLabel('City').fill("Tadepalligudem");
    await page.getByLabel('Venue').fill('muralis convention');
    await page.getByLabel('Event Date & Time*').fill('2026-06-06T10:30');
    await page.getByLabel('Price ($)*').fill('500');
    await page.getByLabel('Total Seats*').fill('50');
    await page.locator("#add-event-btn").click();
    await expect(page.getByText('Event created!')).toBeVisible();
    //step-3  Find the event card and capture seats
    await page.goto(`${BASE_URL}/events`);
    const eventcard =  page.locator("#event-card");
    const foralltitles = page.locator(".p-4.flex h3");
    await foralltitles.first().waitFor();
    console.log(await foralltitles.allTextContents());
    await expect(eventcard.first()).toBeVisible();
    const addedevent = eventcard.filter({hasText :eventtitletext}).first()
    await expect(addedevent).toBeVisible({ timeout: 5000 });
    const seatsBeforeBooking = parseInt(await addedevent.locator(".text-xs.font-semibold").last().textContent());
    console.log(seatsBeforeBooking);
    //step-4 Start booking
    await addedevent.locator("#book-now-btn").click()
    //Step 5 — Fill booking form
    await page.waitForLoadState("networkidle"); 
    await page.locator("div h1").waitFor();
    await expect(page.locator("#ticket-count")).toHaveText("1");
    
    await page.getByLabel("Full Name").fill("Murali dangeti");
    await page.locator("#customer-email").fill(user_email);
    await page.getByPlaceholder("+91 98765 43210").fill("6305408867");
    await page.locator(".confirm-booking-btn").click();
    
//Step 6 — Verify booking confirmation
    await page.locator("div h3").first().waitFor();
    await expect(page.locator(" .booking-ref").first()).toBeVisible();
    const bookingRef = await page.locator(".booking-ref").textContent();
    console.log(bookingRef);

// Step 7 — Verify in My Bookings

await page.getByRole("link",{name:'My Bookings'}).first().click();
await expect(page).toHaveURL(`${BASE_URL}/bookings`);
await expect(page.locator("#booking-card").first()).toBeVisible();
const matchedcard = page.locator(".booking-ref").filter({hasText :bookingRef });
await expect(matchedcard.first()).toBeVisible();
await expect(page.locator("#booking-card h3").first()).toHaveText(eventtitletext);

//Step 8 — Verify seat reduction
await page.goto(`${BASE_URL}/events`);
await expect(eventcard.first()).toBeVisible();
await expect(eventcard.filter({hasText :eventtitletext}).first()).toBeVisible();
const seatsAfterBooking = parseInt(await addedevent.locator(".text-xs.font-semibold").last().textContent());
console.log(seatsAfterBooking);
expect(seatsAfterBooking).toBe(seatsBeforeBooking - 1);
})
