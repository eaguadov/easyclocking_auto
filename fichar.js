const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  await page.goto('https://easyclocking.net/');

  // Esperar a que todos los campos estén visibles
  await page.waitForSelector('input[name="CompanyCode"]');
  await page.waitForSelector('input[name="UserName"]');
  await page.waitForSelector('input[name="Password"]');

  // Rellenar campos del login
  await page.fill('input[name="CompanyCode"]', process.env.COMPANY_ID);
  await page.fill('input[name="UserName"]', process.env.USER_NAME);
  await page.fill('input[name="Password"]', process.env.PASSWORD);

  // Pulsar el botón "Sign In"
  await page.click('input[type="submit"][value="Sign In"]');

  // Esperar a que se cargue la página de fichaje (ajustar según selector futuro si necesario)
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
