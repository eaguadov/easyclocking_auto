
const puppeteer = require('puppeteer');
require('dotenv').config();

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  await page.goto('https://easyclocking.net/?ReturnUrl=%2femployee%2ftimecard');

  await page.type('input[name="CompanyID"]', process.env.COMPANY_ID);
  await page.type('input[name="UserName"]', process.env.USER_NAME);
  await page.type('input[name="Password"]', process.env.PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForTimeout(5000);

  const action = process.env.ACTION === "clockout" ? "Clock Out" : "Clock In";
  const [button] = await page.$x(`//button[contains(text(), "${action}")]`);
  if (button) {
    await button.click();
    console.log(`Fichaje de ${action === "Clock In" ? "entrada" : "salida"} realizado correctamente.`);
  } else {
    console.log(`No se encontró el botón ${action}.`);
  }

  await browser.close();
})();
