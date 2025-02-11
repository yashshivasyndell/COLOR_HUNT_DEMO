const pg = require("pg");
const { ApiError } = require("../utils/ApiError");
const { Pool } = pg;


const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  max: 50,
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 4000,
});

const DBConnect = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (err) {
    console.log("Error connecting to database: ", err.message);
    process.exit(1);
  }
};

module.exports = { pool, DBConnect };
