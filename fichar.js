const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  const action = process.env.ACTION === "clockout" ? "Clock Out" : "Clock In";

  try {
    console.log("🔐 Navegando a la web...");
    await page.goto('https://easyclocking.net/', { timeout: 60000 });

    console.log("📝 Rellenando formulario de login...");
    await page.waitForSelector('input[name="CompanyCode"]', { timeout: 15000 });
    await page.fill('input[name="CompanyCode"]', process.env.COMPANY_ID);
    await page.fill('input[name="UserName"]', process.env.USER_NAME);
    await page.fill('input[name="Password"]', process.env.PASSWORD);
    await page.click('input[type="submit"][value="Sign In"]');

    console.log("⏳ Esperando carga de la segunda pantalla...");
    await page.waitForTimeout(7000); // espera fija adicional
    await page.waitForSelector(`input[type="button"][value="${action}"]`, { timeout: 30000 });

    console.log(`🕒 Pulsando botón "${action}"...`);
    await page.click(`input[type="button"][value="${action}"]`);

    console.log("✅ Esperando mensaje de confirmación y pulsando OK...");
    await page.waitForSelector('span.ui-button-text', { timeout: 15000 });
    await page.click('span.ui-button-text');

    console.log("🚪 Cerrando sesión...");
    await page.hover('a.wijmo-wijmenu-link:has-text("Options")');
    await page.click('a[href="/log-off"]');

    console.log(`🎉 Fichaje de ${action === "Clock In" ? "entrada" : "salida"} realizado correctamente.`);

  } catch (error) {
    console.error("❌ Error durante el proceso:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
