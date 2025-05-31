const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // Paso 1: Login
  await page.goto('https://easyclocking.net/');
  await page.waitForSelector('input[name="CompanyCode"]');
  await page.fill('input[name="CompanyCode"]', process.env.COMPANY_ID);
  await page.fill('input[name="UserName"]', process.env.USER_NAME);
  await page.fill('input[name="Password"]', process.env.PASSWORD);
  await page.click('input[type="submit"][value="Sign In"]');

  // Paso 2: Esperar a que se cargue la siguiente pantalla
  await page.waitForTimeout(5000);
  const action = process.env.ACTION === "clockout" ? "Clock Out" : "Clock In";

  // Paso 3: Click en Clock In / Clock Out
  const clockButton = await page.locator(`input[type="button"][value="${action}"]`);
  if (await clockButton.count() > 0) {
    await clockButton.click();
    console.log(`Botón ${action} presionado`);
  } else {
    console.log(`No se encontró el botón ${action}`);
  }

  // Paso 4: Esperar a que aparezca y click en el botón OK
  const okBtn = await page.locator('span.ui-button-text', { hasText: "OK" });
  await okBtn.first().click();

  // Paso 5: Log out
  await page.hover('a.wijmo-wijmenu-link:has-text("Options")');
  await page.click('a[href="/log-off"]');

  await browser.close();
})();