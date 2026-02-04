const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function build() {
  console.log('Compilando esbuild-autocontenido...');

  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // 1. Copiar el binario
  console.log('Buscando binario de esbuild...');
  let binaryPath = '';
  // Intento de encontrar el binario en node_modules
  const possiblePaths = [
      path.join(__dirname, 'node_modules', '@esbuild', 'win32-x64', 'esbuild.exe'),
      // Agrega más rutas si quieres soportar cross-compilation o otras plataformas desde aquí
  ];
  
  for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
          binaryPath = p;
          break;
      }
  }

  if (!binaryPath) {
      console.warn('ADVERTENCIA: No se encontró el binario de esbuild en las rutas esperadas.');
      console.warn('El bundle se generará sin binario adjunto.');
  } else {
      console.log(`Binario encontrado en: ${binaryPath}`);
      const destBinary = path.join('dist', 'esbuild.exe');
      fs.copyFileSync(binaryPath, destBinary);
      console.log(`Binario copiado a: ${destBinary}`);
  }

  try {
    // 2. Compilar la API
    console.log('Compilando API...');
    await esbuild.build({
      entryPoints: ['puente.js'],
      outfile: 'dist/index.js',
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'cjs',
      minify: false,
      keepNames: true,
      sourcemap: false,
      logLevel: 'warning',
    });

    console.log('Bundle creado. Aplicando parches...');

    let code = fs.readFileSync('dist/index.js', 'utf8');

    // 1. Patch the "cannot be bundled" check
    const conditionRegex = /if\s*\(\s*\(!ESBUILD_BINARY_PATH\s*\|\|\s*false\)\s*&&\s*\(.*?\)\s*\)\s*\{/s;
    if (conditionRegex.test(code)) {
        code = code.replace(conditionRegex, 'if (false) {');
        console.log('Parcheado: chequeo de bundle deshabilitado.');
    } else {
        console.warn('Advertencia: No se encontró el chequeo de bundle para parchear.');
    }
    
    // 2. Patch binary path resolution
    const patchCode = `
      // PATCH: Check for local binary first
      const localBin = path.join(__dirname, 'esbuild.exe');
      if (require('fs').existsSync(localBin)) {
        return { binPath: localBin, isWASM: false };
      }
    `;
    
    if (code.includes('if (isValidBinaryPath(ESBUILD_BINARY_PATH)) {')) {
        code = code.replace(
            'if (isValidBinaryPath(ESBUILD_BINARY_PATH)) {',
            `${patchCode}
             if (isValidBinaryPath(ESBUILD_BINARY_PATH)) {`
        );
        console.log('Parcheado: generateBinPath modificado para preferir binario local.');
    } else {
        console.warn('Advertencia: No se pudo inyectar el parche de binario local.');
    }

    const resolveRegex = /require\.resolve\("esbuild"\)/g;
    if (resolveRegex.test(code)) {
        code = code.replace(resolveRegex, '__filename');
        console.log('Parcheado: require.resolve("esbuild") -> __filename');
    }

    fs.writeFileSync('dist/index.js', code);
    console.log('Compilación y parches completados exitosamente.');

    // 3. Compilar/Copiar el CLI
    console.log('Generando CLI...');
    const binDir = path.join('dist', 'bin');
    if (!fs.existsSync(binDir)) {
        fs.mkdirSync(binDir);
    }
    
    // Podemos simplemente copiar el archivo o minificarlo.
    // Vamos a compilarlo con esbuild también para que sea un solo archivo limpio sin deps extrañas (aunque child_process es nativo).
    // Copiar es más seguro y simple ya que es muy pequeño.
    // Sin embargo, para mantener la coherencia de "todo bundled", usemos esbuild.
    
    await esbuild.build({
        entryPoints: ['cli-puente.js'],
        outfile: 'dist/bin/esbuild-autocontenido.js',
        bundle: true,
        platform: 'node',
        target: 'node18',
        format: 'cjs',
        minify: false,
    });
    console.log('CLI generado en dist/bin/esbuild-autocontenido.js');

  } catch (error) {
    console.error('Error durante la compilación:', error);
    process.exit(1);
  }
}

build();
