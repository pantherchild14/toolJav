const dotenv = require('dotenv');
const mysql = require('mysql');

dotenv.config();

const dbConfig = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
};

const Connection = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to the database');
        return connection;
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        throw error;
    }
};


module.exports = Connection;