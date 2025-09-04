#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up School Directory Database...\n');

    const dbName = process.env.DB_NAME || 'school_directory';

    // Database configuration
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: false
    };

    console.log(`📡 Connecting to MySQL server at ${config.host}...`);
    
    // Connect to MySQL server (without database)
    let connection = await mysql.createConnection(config);
    
    console.log('✅ Connected to MySQL server');

    // Create database
    console.log('📋 Creating database...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Database created successfully');

    // Close the first connection
    await connection.end();

    // Create new connection with the database
    const configWithDB = {
      ...config,
      database: dbName
    };

    connection = await mysql.createConnection(configWithDB);
    console.log(`✅ Connected to database: ${dbName}`);

    // Create schools table
    console.log('📋 Creating schools table...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS schools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        contact BIGINT NOT NULL,
        image VARCHAR(500) DEFAULT NULL,
        email_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_city (city),
        INDEX idx_state (state),
        INDEX idx_name (name(50)),
        INDEX idx_created_at (created_at),
        INDEX idx_email (email_id),
        INDEX idx_contact (contact),
        
        UNIQUE KEY unique_email (email_id),
        UNIQUE KEY unique_contact (contact)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.execute(createTableSQL);
    console.log('✅ Schools table created successfully');

    // Insert sample data
    console.log('📋 Inserting sample data...');
    const sampleData = [
      {
        id: 1,
        name: 'Delhi Public School',
        address: 'Mathura Road, New Delhi - 110076',
        city: 'New Delhi',
        state: 'Delhi',
        contact: 9876543210,
        email_id: 'info@dpsdelhi.com'
      },
      {
        id: 2,
        name: 'Kendriya Vidyalaya No. 1',
        address: 'Andrews Ganj, New Delhi - 110049',
        city: 'New Delhi',
        state: 'Delhi',
        contact: 9876543211,
        email_id: 'kv1delhi@kvs.gov.in'
      },
      {
        id: 3,
        name: 'Ryan International School',
        address: 'Sector 25, Rohini, Delhi - 110085',
        city: 'New Delhi',
        state: 'Delhi',
        contact: 9876543212,
        email_id: 'admin@ryaninternational.com'
      },
      {
        id: 4,
        name: 'The Shri Ram School',
        address: 'Moulsari Avenue, DLF Phase 3, Gurgaon - 122002',
        city: 'Gurgaon',
        state: 'Haryana',
        contact: 9876543213,
        email_id: 'info@tsrs.org'
      },
      {
        id: 5,
        name: 'DAV Public School',
        address: 'Sector 14, Faridabad - 121007',
        city: 'Faridabad',
        state: 'Haryana',
        contact: 9876543214,
        email_id: 'dav.sector14@gmail.com'
      },
      {
        id: 6,
        name: 'Birla Public School',
        address: 'Kalyan Vihar, Delhi - 110009',
        city: 'New Delhi',
        state: 'Delhi',
        contact: 9876543215,
        email_id: 'info@birlapublicschool.com'
      },
      {
        id: 7,
        name: 'Modern School',
        address: 'Barakhamba Road, New Delhi - 110001',
        city: 'New Delhi',
        state: 'Delhi',
        contact: 9876543216,
        email_id: 'principal@modernschool.net'
      },
      {
        id: 8,
        name: 'St. Columba\'s School',
        address: 'Ashok Place, New Delhi - 110001',
        city: 'New Delhi',
        state: 'Delhi',
        contact: 9876543217,
        email_id: 'office@stcolumbas.org'
      }
    ];

    const insertSQL = `
      INSERT IGNORE INTO schools (id, name, address, city, state, contact, email_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    for (const school of sampleData) {
      await connection.execute(insertSQL, [
        school.id,
        school.name,
        school.address,
        school.city,
        school.state,
        school.contact,
        school.email_id
      ]);
    }

    console.log('✅ Sample data inserted successfully');

    // Close connection
    await connection.end();

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run "npm run dev" to start the development server');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Try adding a new school or browsing existing ones\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check your database credentials in .env.local');
    console.log('3. Ensure the MySQL user has necessary permissions');
    console.log('4. Try running: mysql -u root -p -e "CREATE DATABASE school_directory;"\n');
    process.exit(1);
  }
}

// Check if .env.local exists
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env.local file not found!');
  console.log('📋 Please copy .env.local.example to .env.local and update the database credentials\n');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Run setup
setupDatabase();
