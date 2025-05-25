
const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
  const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox'],
  executablePath: '/opt/render/.cache/ms-playwright/chromium-1169/chrome-linux/chrome'
});

  const page = await browser.newPage();

  await page.goto('https://easyclocking.net/?ReturnUrl=%2femployee%2ftimecard');

  await page.fill('input[name="CompanyID"]', process.env.COMPANY_ID);
  await page.fill('input[name="UserName"]', process.env.USER_NAME);
  await page.fill('input[name="Password"]', process.env.PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForTimeout(5000);
  const clockOutButton = await page.$('text="Clock Out"');
  if (clockOutButton) {
    await clockOutButton.click();
    console.log("Fichaje de salida realizado correctamente.");
  } else {
    console.log("No se encontró el botón Clock Out.");
  }

  await browser.close();
})();
