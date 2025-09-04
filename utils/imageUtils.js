export function getCloudinaryUrl(publicId, options = {}) {
  if (!publicId) return null;
  
  if (publicId.startsWith('http')) {
    return publicId;
  }
  
  const {
    width = 800,
    height = 600,
    crop = 'fill',
    quality = 'auto',
    format = 'webp'
  } = options;
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvfxr3cjk';
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
}

export function extractPublicId(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  const parts = url.split('/');
  const uploadIndex = parts.findIndex(part => part === 'upload');
  
  if (uploadIndex === -1) return url;
  
  const afterUpload = parts.slice(uploadIndex + 1);
  
  const pathParts = afterUpload.filter(part => !part.match(/^[a-z]_/));
  
  return pathParts.join('/').replace(/\.[^/.]+$/, '');
}

export function getOptimizedImageUrl(imageUrl, size = 'medium') {
  if (!imageUrl) return null;
  
  const sizePresets = {
    thumbnail: { width: 150, height: 150, crop: 'fill' },
    small: { width: 300, height: 200, crop: 'fill' },
    medium: { width: 600, height: 400, crop: 'fill' },
    large: { width: 1200, height: 800, crop: 'limit' },
    original: { quality: 'auto', format: 'webp' }
  };
  
  const preset = sizePresets[size] || sizePresets.medium;
  
  if (imageUrl.startsWith('http')) {
    if (imageUrl.includes('cloudinary.com')) {
      const publicId = extractPublicId(imageUrl);
      return getCloudinaryUrl(publicId, preset);
    }
    return imageUrl;
  }
  
  return getCloudinaryUrl(imageUrl, preset);
}

export function isCloudinaryUrl(url) {
  return url && url.includes('cloudinary.com');
}
