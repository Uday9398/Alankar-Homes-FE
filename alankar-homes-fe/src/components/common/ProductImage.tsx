import React, { useState } from 'react';
import { Gift } from 'lucide-react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

// Asks Cloudinary for the best format and quality for the browser (WebP/AVIF, compressed)
const optimise = (url: string) =>
  url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('/upload/f_auto')
    ? url.replace('/upload/', '/upload/f_auto,q_auto/')
    : url;

// Shows a soft placeholder when a product has no photo or the photo is missing
export const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-[#0a2f29] to-[#031a17] ${className}`}>
        <Gift className="w-1/4 h-1/4 max-w-12 max-h-12 text-[#caa060]/40" strokeWidth={1.25} />
      </div>
    );
  }

  return <img src={optimise(src)} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
};
