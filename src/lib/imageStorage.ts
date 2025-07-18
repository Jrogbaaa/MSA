import { ref, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata } from 'firebase/storage';
import { storage } from './firebase';

// Image compression utility (reused from PropertyManager)
const compressImage = (file: File, targetSizeKB: number = 80, maxDimension: number = 1000): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let { width, height } = img;
        
        // Adjust dimensions if they exceed the max
        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        // Progressive quality reduction for smaller file sizes
        let quality = 0.85;
        
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('Failed to compress image'));
            
            const sizeKB = blob.size / 1024;
            
            if (sizeKB <= targetSizeKB || quality <= 0.3) {
              console.log(`Image compressed: ${sizeKB.toFixed(1)}KB at ${(quality * 100).toFixed(0)}% quality`);
              resolve(blob);
            } else {
              quality -= 0.1;
              tryCompress();
            }
          }, 'image/jpeg', quality);
        };
        
        tryCompress();
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// Upload a single image to Firebase Storage
export const uploadPropertyImage = async (
  propertyId: string, 
  file: File, 
  imageIndex: number
): Promise<string> => {
  try {
    console.log(`📸 Uploading image ${imageIndex + 1} for property ${propertyId}...`);
    
    // Compress image before upload
    const compressedBlob = await compressImage(file, 80, 1000);
    const compressedSize = (compressedBlob.size / 1024).toFixed(1);
    console.log(`🗜️ Image compressed to ${compressedSize}KB`);
    
    // Create storage reference
    const imageRef = ref(storage, `properties/${propertyId}/image_${imageIndex}_${Date.now()}.jpg`);
    
    // Upload compressed image
    const uploadResult = await uploadBytes(imageRef, compressedBlob, {
      contentType: 'image/jpeg',
      customMetadata: {
        propertyId: propertyId,
        imageIndex: imageIndex.toString(),
        originalName: file.name,
        uploadDate: new Date().toISOString()
      }
    });
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log(`✅ Image ${imageIndex + 1} uploaded successfully`);
    
    return downloadURL;
  } catch (error) {
    console.error(`❌ Failed to upload image ${imageIndex + 1}:`, error);
    
    // Fallback: return base64 if Firebase Storage fails
    console.log(`📱 Falling back to base64 for image ${imageIndex + 1}`);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

// Upload multiple images for a property
export const uploadPropertyImages = async (
  propertyId: string,
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> => {
  const uploadPromises = files.map(async (file, index) => {
    try {
      const url = await uploadPropertyImage(propertyId, file, index);
      onProgress?.(index + 1, files.length);
      return url;
    } catch (error) {
      console.error(`Failed to upload image ${index + 1}:`, error);
      // Return base64 fallback for this image
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  });
  
  const results = await Promise.all(uploadPromises);
  console.log(`✅ Uploaded ${results.length} images for property ${propertyId}`);
  return results;
};

// Delete all images for a property
export const deletePropertyImages = async (propertyId: string): Promise<void> => {
  try {
    console.log(`🗑️ Deleting images for property ${propertyId}...`);
    
    const propertyImagesRef = ref(storage, `properties/${propertyId}`);
    const imagesList = await listAll(propertyImagesRef);
    
    if (imagesList.items.length === 0) {
      console.log(`No images found for property ${propertyId}`);
      return;
    }
    
    // Delete all images in parallel
    const deletePromises = imagesList.items.map(imageRef => deleteObject(imageRef));
    await Promise.all(deletePromises);
    
    console.log(`✅ Deleted ${imagesList.items.length} images for property ${propertyId}`);
  } catch (error) {
    console.error(`❌ Failed to delete images for property ${propertyId}:`, error);
    // Don't throw - image cleanup failures shouldn't block property operations
  }
};

// Delete specific images by URLs
export const deleteImagesByUrls = async (imageUrls: string[]): Promise<void> => {
  try {
    const deletePromises = imageUrls
      .filter(url => url.includes('firebase')) // Only delete Firebase Storage URLs
      .map(async (url) => {
        try {
          const imageRef = ref(storage, url);
          await deleteObject(imageRef);
          console.log(`✅ Deleted image: ${url.split('/').pop()}`);
        } catch (error) {
          console.warn(`⚠️ Failed to delete image ${url}:`, error);
        }
      });
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('❌ Error deleting images:', error);
  }
};

// Check if URL is a Firebase Storage URL
export const isFirebaseStorageUrl = (url: string): boolean => {
  return url.includes('firebasestorage.googleapis.com') || url.includes('firebase');
};

// Check if URL is base64 data
export const isBase64Url = (url: string): boolean => {
  return url.startsWith('data:image/');
};

// Get storage usage statistics
export const getStorageStats = async (propertyId: string): Promise<{
  imageCount: number;
  totalSizeKB: number;
}> => {
  try {
    const propertyImagesRef = ref(storage, `properties/${propertyId}`);
    const imagesList = await listAll(propertyImagesRef);
    
    let totalSizeKB = 0;
    for (const imageRef of imagesList.items) {
      try {
        const metadata = await getMetadata(imageRef);
        totalSizeKB += (metadata.size || 0) / 1024;
      } catch (error) {
        console.warn(`Could not get metadata for ${imageRef.name}`);
      }
    }
    
    return {
      imageCount: imagesList.items.length,
      totalSizeKB: Math.round(totalSizeKB)
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return { imageCount: 0, totalSizeKB: 0 };
  }
}; 