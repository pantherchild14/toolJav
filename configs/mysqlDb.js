const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 10,
});

const Connection = async () => {
    try {
        return await pool.getConnection();
    } catch (error) {
        console.error("Error getting database connection:", error);
        throw new Error("Internal server error");
    }
};

module.exports = Connection;