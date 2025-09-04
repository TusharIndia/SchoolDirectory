import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import cloudinary from '../../../../lib/cloudinary';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileHash = createHash('md5').update(buffer).digest('hex');
    const hashBasedPublicId = `school-directory/img_${fileHash}`;

    try {
      const existingImage = await cloudinary.api.resource(hashBasedPublicId);
      
      if (existingImage) {
        return NextResponse.json({
          success: true,
          message: 'Image already exists, using existing copy',
          url: existingImage.secure_url,
          public_id: existingImage.public_id,
          width: existingImage.width,
          height: existingImage.height,
          isDuplicate: true
        });
      }
    } catch (error) {
      console.log('Image not found, proceeding with upload');
    }

    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: hashBasedPublicId,
          folder: 'school-directory',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' },
            { format: 'webp' }
          ],
          overwrite: false
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const result = await uploadPromise;

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully to Cloudinary',
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      isDuplicate: false
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file to Cloudinary' },
      { status: 500 }
    );
  }
}
