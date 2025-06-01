const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const COMPANY_ID = process.env.COMPANY_ID;
  const USER_NAME = process.env.USER_NAME;
  const PASSWORD = process.env.PASSWORD;
  const ACTION = process.env.ACTION === 'clockout' ? 'Clock Out' : 'Clock In';

  try {
    console.log("🌐 Navegando a EasyClocking...");
    await page.goto('https://easyclocking.net', { timeout: 60000 });

    console.log("📝 Completando login...");
    const companyIdInput = await page.$('input#CompanyCode[name="CompanyCode"]');
    if (companyIdInput) {
      console.log("🏢 Campo CompanyId encontrado. Rellenando...");
      await companyIdInput.fill(COMPANY_ID);
    } else {
      console.log("ℹ️ Campo CompanyId no presente. Continuando...");
    }

    await page.fill('input[name="UserName"]', USER_NAME);
    await page.fill('input[name="Password"]', PASSWORD);
    await page.click('input[type="submit"][value="Sign In"]');

    console.log("📷 Capturando pantalla antes de esperar el botón...");
    await page.screenshot({ path: 'before-clock-button.png' });

    let retries = 3;
    while (retries-- > 0) {
      try {
        console.log("🔍 Esperando segunda pantalla (Clock In / Clock Out)...");
        await page.waitForSelector('input[type="button"][value="Clock In"], input[type="button"][value="Clock Out"]', {
          timeout: 60000
        });
        console.log("✅ Segunda pantalla cargada con éxito.");
        break;
      } catch (error) {
        if (retries === 0) {
          console.error("❌ No se detectó el botón Clock In / Clock Out:", error);
          const html = await page.content();
          console.error("📄 HTML actual:", html);
          await page.screenshot({ path: 'error-segunda-pantalla.png' });
          process.exit(1);
        } else {
          console.log("⏳ Reintentando detección de botón...");
          await page.waitForTimeout(5000);
        }
      }
    }

    console.log(`🕒 Buscando botón "${ACTION}"...`);
    await page.waitForSelector(`input[type="button"][value="${ACTION}"]`, { timeout: 60000 });
    await page.click(`input[type="button"][value="${ACTION}"]`);

    console.log("✅ Botón de fichaje presionado. Esperando overlay...");
    let overlayRetries = 3;
    while (overlayRetries-- > 0) {
      try {
        await page.waitForSelector('.ui-dialog-overlay', { state: 'detached', timeout: 20000 });
        console.log("✅ Overlay desaparecido.");
        break;
      } catch (error) {
        if (overlayRetries === 0) {
          console.error("❌ Overlay no desapareció tras varios intentos:", error);
          await page.screenshot({ path: 'overlay-error.png' });
          process.exit(1);
        } else {
          console.log("⏳ Reintentando espera de overlay...");
          await page.waitForTimeout(5000);
        }
      }
    }

    console.log("➡️ Pulsando 'Options'...");
    const optionsLink = page.locator('a.wijmo-wijmenu-link:has-text("Options")');
    await optionsLink.waitFor({ state: 'visible', timeout: 30000 });
    await optionsLink.hover();

    console.log("🚪 Pulsando 'Log Off'...");
    await page.click('a:has-text("Log Off")');

    console.log("🏁 Proceso completado correctamente.");
  } catch (error) {
    console.error("❌ Error general en el proceso:", error);
    await page.screenshot({ path: 'error-general.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
