const esbuild = require('./dist/index.js');
const assert = require('assert');

async function test() {
  console.log('Probando esbuild autocontenido...');
  console.log('Versión:', esbuild.version);

  try {
    const result = await esbuild.transform('let x: number = 1', {
      loader: 'ts',
    });
    console.log('Transformación exitosa:');
    console.log(result.code);
    
    // Verificar que se eliminaron los tipos de TypeScript
    assert.ok(!result.code.includes(': number'), 'Los tipos de TS deberían ser eliminados');
    assert.ok(result.code.includes('x = 1'), 'El código debería contener la asignación');
    
    console.log('Prueba pasada correctamente.');
  } catch (error) {
    console.error('Error en la prueba:', error);
    process.exit(1);
  }
}

test();
