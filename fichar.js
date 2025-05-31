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
    console.log("🔐 Navegando a EasyClocking...");
    await page.goto('https://easyclocking.net/', { timeout: 60000 });

    console.log("📝 Completando login...");
    await page.fill('input[name="CompanyCode"]', process.env.COMPANY_ID);
    await page.fill('input[name="UserName"]', process.env.USER_NAME);
    await page.fill('input[name="Password"]', process.env.PASSWORD);
    await page.click('input[type="submit"][value="Sign In"]');

    console.log("⏳ Esperando segunda pantalla...");
    await page.waitForTimeout(8000); // espera adicional por si la carga es lenta

    const buttonSelector = `input[type="button"][value="${action}"]`;

    let retries = 3;
    let found = false;

    while (retries-- > 0 && !found) {
      try {
        console.log(`🔎 Buscando botón "${action}" (intento ${3 - retries})...`);
        await page.waitForSelector(buttonSelector, { timeout: 20000 });
        found = true;
        console.log("✅ Botón localizado.");
      } catch {
        console.log("⌛ No se encontró el botón. Reintentando...");
        await page.waitForTimeout(5000);
      }
    }

    if (!found) {
      console.error("❌ No se encontró el botón tras varios intentos.");
      console.log("Contenido actual de la página:");
      console.log(await page.content());
      process.exit(1);
    }

    console.log(`🖱️ Pulsando botón "${action}"...`);
    await page.click(buttonSelector);

    console.log("🪟 Confirmando acción (botón OK)...");
    await page.waitForSelector('span.ui-button-text', { timeout: 15000 });
    await page.click('span.ui-button-text');

    console.log("🚪 Cerrando sesión...");
    await page.hover('a.wijmo-wijmenu-link:has-text("Options")');
    await page.click('a[href="/log-off"]');

    console.log(`🎉 Proceso de ${action === "Clock In" ? "entrada" : "salida"} completado con éxito.`);
    
  } catch (error) {
    console.error("❌ Error durante el proceso:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
