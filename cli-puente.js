#!/usr/bin/env node
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const binName = process.platform === 'win32' ? 'esbuild.exe' : 'esbuild';
// El script estará en dist/bin/esbuild-autocontenido.js
// El binario estará en dist/esbuild.exe
const binPath = path.resolve(__dirname, '..', binName);

if (fs.existsSync(binPath)) {
  const child = spawn(binPath, process.argv.slice(2), { stdio: 'inherit' });
  
  child.on('close', (code) => {
    process.exit(code);
  });
  
  child.on('error', (err) => {
    console.error('Error al ejecutar esbuild:', err);
    process.exit(1);
  });
} else {
  console.error('Error Fatal: No se encontró el binario de esbuild autocontenido.');
  console.error('Buscado en:', binPath);
  console.error('Asegúrate de haber compilado el proyecto correctamente.');
  process.exit(1);
}
