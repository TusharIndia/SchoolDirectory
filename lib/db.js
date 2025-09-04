import mysql from 'mysql2/promise';

// Database configuration with Service URI support
let connection;

if (process.env.DATABASE_URL) {
  // Use Service URI (recommended for production)
  connection = mysql.createPool(process.env.DATABASE_URL);
} else {
  // Fallback to individual credentials
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_directory',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
  };

  // Add SSL configuration for production databases
  if (process.env.NODE_ENV === 'production') {
    dbConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  connection = mysql.createPool(dbConfig);
}

// Test the connection
async function testConnection() {
  try {
    const [rows] = await connection.execute('SELECT 1');
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

// Test connection on startup
if (process.env.NODE_ENV === 'production') {
  testConnection();
}

export default connection;
