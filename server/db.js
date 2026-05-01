require('dotenv').config();
const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString: `Driver={${process.env.DB_DRIVER || 'ODBC Driver 18 for SQL Server'}};Server=${process.env.DB_SERVER};Database=${process.env.DB_DATABASE};Trusted_Connection=yes;TrustServerCertificate=yes;`,
  driver: 'msnodesqlv8'
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
