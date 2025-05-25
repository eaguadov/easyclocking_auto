
# EasyClocking Auto-Fichaje (versión Puppeteer)

Automatización de entrada y salida en EasyClocking usando Puppeteer y Render.

## Configuración

1. Crea un archivo `.env` con tus credenciales:

```
COMPANY_ID=tu_empresa
USER_NAME=tu_usuario
PASSWORD=tu_contraseña
```

2. Instala dependencias con `npm install`.

3. Ejecuta con:

- `npm run entrada` para fichar entrada.
- `npm run salida` para fichar salida.

## Uso en Render

- Sube este proyecto a GitHub.
- Conéctalo a Render.com.
- Crea dos servicios:
  - Uno con start command `npm run entrada`
  - Otro con `npm run salida`
- Agrega tus credenciales como variables de entorno.

Puppeteer es compatible con Render en su plan gratuito sin errores de entorno.
