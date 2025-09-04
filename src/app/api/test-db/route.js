import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function GET() {
  try {
    // Test basic connection
    const [rows] = await db.execute('SELECT 1 as test');
    
    // Test if schools table exists
    const [tables] = await db.execute(
      "SHOW TABLES LIKE 'schools'"
    );
    
    // Get table structure if it exists
    let tableStructure = null;
    if (tables.length > 0) {
      const [structure] = await db.execute('DESCRIBE schools');
      tableStructure = structure;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        connectionTest: rows[0],
        tablesExist: tables.length > 0,
        tableStructure: tableStructure,
        environment: process.env.NODE_ENV,
        host: process.env.DB_HOST?.substring(0, 10) + '...' // Hide full host for security
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database connection failed',
        error: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}
