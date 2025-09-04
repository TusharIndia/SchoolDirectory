import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { validateSchoolData } from '../../../../utils/validation';

export async function GET() {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, address, city, state, contact, image, email_id, created_at FROM schools ORDER BY created_at DESC'
    );
    
    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { name, address, city, state, contact, email_id, image } = await request.json();

    // Validate data using shared utility
    const validation = validateSchoolData({ name, address, city, state, contact, email_id });
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      'INSERT INTO schools (name, address, city, state, contact, email_id, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, address, city, state, contact, email_id, image || null]
    );

    return NextResponse.json({
      success: true,
      message: 'School added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      let field = 'data';
      if (error.message.includes('unique_email')) {
        field = 'email address';
      } else if (error.message.includes('unique_contact')) {
        field = 'contact number';
      }
      
      return NextResponse.json(
        { success: false, message: `School with this ${field} already exists` },
        { status: 409 }
      );
    }
    
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add school' },
      { status: 500 }
    );
  }
}
