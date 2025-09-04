import { NextResponse } from 'next/server';
import db from '../../../../../lib/db';

export async function POST(request) {
  try {
    const { email_id, contact } = await request.json();

    if (!email_id || !contact) {
      return NextResponse.json(
        { success: false, message: 'Email and contact are required for duplicate check' },
        { status: 400 }
      );
    }

    // Check for existing email
    const [emailCheck] = await db.execute(
      'SELECT id FROM schools WHERE email_id = ? LIMIT 1',
      [email_id]
    );

    if (emailCheck.length > 0) {
      return NextResponse.json(
        { success: false, isDuplicate: true, field: 'email', message: 'School with this email address already exists' },
        { status: 409 }
      );
    }

    // Check for existing contact
    const [contactCheck] = await db.execute(
      'SELECT id FROM schools WHERE contact = ? LIMIT 1',
      [contact]
    );

    if (contactCheck.length > 0) {
      return NextResponse.json(
        { success: false, isDuplicate: true, field: 'contact', message: 'School with this contact number already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      isDuplicate: false,
      message: 'No duplicates found'
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check for duplicates' },
      { status: 500 }
    );
  }
}
