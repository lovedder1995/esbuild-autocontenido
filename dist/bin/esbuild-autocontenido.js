#!/usr/bin/env node

// cli-puente.js
var path = require("path");
var { spawn } = require("child_process");
var fs = require("fs");
var binName = process.platform === "win32" ? "esbuild.exe" : "esbuild";
var binPath = path.resolve(__dirname, "..", binName);
if (fs.existsSync(binPath)) {
  const child = spawn(binPath, process.argv.slice(2), { stdio: "inherit" });
  child.on("close", (code) => {
    process.exit(code);
  });
  child.on("error", (err) => {
    console.error("Error al ejecutar esbuild:", err);
    process.exit(1);
  });
} else {
  console.error("Error Fatal: No se encontr\xF3 el binario de esbuild autocontenido.");
  console.error("Buscado en:", binPath);
  console.error("Aseg\xFArate de haber compilado el proyecto correctamente.");
  process.exit(1);
}
