require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // Ej: localhost o una IP/URL
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Requerido para Azure/Render
    trustServerCertificate: true // Para certificados auto-firmados
  },
  port: parseInt(process.env.DB_PORT) || 1433
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log(`Conectado a SQL Server (${process.env.DB_SERVER}) - Base de datos: ${process.env.DB_DATABASE}`);
    return pool;
  })
  .catch(err => {
    console.error('Error conectando a la base de datos: ', err);
    throw err;
  });

module.exports = {
  sql, poolPromise
};
