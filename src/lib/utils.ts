import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility to clean objects for Firestore by removing undefined values
 * and recursively cleaning nested objects and arrays.
 * 
 * IMPORTANT: It ignores Firestore sentinels (FieldValues) to avoid breaking 
 * operations like deleteField(), serverTimestamp(), etc.
 */
export const cleanObject = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj
      .map(v => (v && typeof v === 'object' && !(v instanceof Date)) ? cleanObject(v) : v)
      .filter(v => v !== undefined);
  }
  
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    // Check if it's a Firestore FieldValue sentinel (hacky but effective for client SDK)
    if (obj._methodName || (obj.constructor && obj.constructor.name === 'FieldValue')) {
        return obj;
    }

    const newObj: any = {};
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      if (val === undefined) return;
      newObj[key] = cleanObject(val);
    });
    return newObj;
  }
  
  return obj;
};

export const compressImage = (file: File, maxWidth: number = 1024, maxHeight: number = 800): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height *= maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width *= maxHeight / height));
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Canvas to Blob failed'));
                    }
                }, 'image/jpeg', 0.8);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
