# esbuild-autocontenido

Versión autocontenida de esbuild.

## Filosofía

Este proyecto empaqueta la API de JavaScript de `esbuild` en un único archivo (`dist/index.js`) y adjunta el binario nativo correspondiente (`dist/esbuild.exe`) para funcionar sin dependencias externas.

## Características

*   **Autocontenido**: No requiere `node_modules` en tiempo de ejecución.
*   **Portable**: Incluye el binario nativo (para la plataforma donde se compiló).
*   **Transparente**: Funciona como un reemplazo directo de `esbuild`.
*   **CLI Incluido**: Puedes usar el comando `esbuild-autocontenido` directamente.

## Compilación

Para generar el bundle y copiar el binario de tu plataforma actual:

```bash
npm install
node compilar.js
```

Esto generará en `dist/`:
*   `index.js`: La API de JavaScript (parcheada).
*   `bin/esbuild-autocontenido.js`: El wrapper para CLI.
*   `esbuild.exe` (o `esbuild` en Linux/Mac): El binario nativo.

## Uso del CLI

Puedes ejecutar el binario directamente a través del wrapper de Node.js:

```bash
node dist/bin/esbuild-autocontenido.js --version
node dist/bin/esbuild-autocontenido.js app.js --bundle --outfile=out.js
```

Si instalas este paquete globalmente o lo linkeas (`npm link`), tendrás disponible el comando `esbuild-autocontenido`.

## Uso Programático

```javascript
const esbuild = require('./dist/index.js'); // O require('esbuild-autocontenido') si está instalado

esbuild.build({
  entryPoints: ['app.js'],
  outfile: 'out.js',
});
```

## Verificación

```bash
node dist/bin/esbuild-autocontenido.js --version
```
