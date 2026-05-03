const { sql, poolPromise } = require('./db');
const fs = require('fs');
const path = require('path');

async function runMaster() {
  try {
    const sqlPath = path.join(__dirname, '..', 'TiendaElBuenSabor_Maestro.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error(`Error: No se encontró el archivo ${sqlPath}`);
      process.exit(1);
    }
    
    const script = fs.readFileSync(sqlPath, 'utf8');
    const pool = await poolPromise;

    // Dividir por GO (insensible a mayúsculas)
    const batches = script.split(/^\s*GO\s*$/im);

    console.log(`Ejecutando ${batches.length} bloques SQL...`);

    for (let batch of batches) {
      let cleanBatch = batch.trim();
      if (!cleanBatch) continue;
      
      // Remover sentencias USE ya que la conexión ya está establecida en db.js
      // Pero si la sentencia USE es parte de un bloque más grande, solo la removemos al inicio
      cleanBatch = cleanBatch.replace(/^USE\s+\[?\w+\]?;?\s*/i, '');
      
      if (!cleanBatch) continue;

      try {
        await pool.request().query(cleanBatch);
      } catch (err) {
        // Ignorar errores de creación de DB si ya existe, pero informar otros
        if (!cleanBatch.includes('CREATE DATABASE')) {
           console.warn("Aviso en bloque SQL:", err.message);
        }
      }
    }

    console.log("¡Base de datos configurada correctamente!");
    process.exit(0);
  } catch (err) {
    console.error("Error ejecutando script maestro:", err);
    process.exit(1);
  }
}

runMaster();
