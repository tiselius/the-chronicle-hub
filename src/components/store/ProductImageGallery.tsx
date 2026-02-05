 import { useState } from "react";
 import { ChevronLeft, ChevronRight } from "lucide-react";
 import { SanityImageSource, urlFor } from "@/lib/sanity";
 import { cn } from "@/lib/utils";
 
 interface ProductImageGalleryProps {
   images: SanityImageSource[];
   productName: string;
 }
 
 const MAX_VISIBLE_THUMBNAILS = 5;
 
 const ProductImageGallery = ({ images, productName }: ProductImageGalleryProps) => {
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isHovering, setIsHovering] = useState(false);
 
   // Filter out images without valid refs
   const validImages = images.filter((img) => img?.asset?._ref);
 
   if (validImages.length === 0) {
     return (
       <div className="aspect-square bg-secondary flex items-center justify-center text-muted-foreground">
         No image
       </div>
     );
   }
 
   const hasMultipleImages = validImages.length > 1;
   const showArrows = hasMultipleImages && isHovering;
 
   const goToPrevious = () => {
     setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
   };
 
   const goToNext = () => {
     setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
   };
 
   const currentImage = validImages[currentIndex];
 
   return (
     <div className="space-y-4">
       {/* Main Image */}
       <div
         className="aspect-square bg-secondary relative overflow-hidden"
         onMouseEnter={() => setIsHovering(true)}
         onMouseLeave={() => setIsHovering(false)}
       >
         <img
           src={urlFor(currentImage)}
           alt={currentImage.alt || `${productName} - bild ${currentIndex + 1}`}
           className="w-full h-full object-cover"
         />
 
         {/* Navigation Arrows */}
         {showArrows && (
           <>
             <button
               onClick={goToPrevious}
               className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 hover:bg-background rounded-full flex items-center justify-center transition-opacity shadow-sm"
               aria-label="Föregående bild"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button
               onClick={goToNext}
               className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/90 hover:bg-background rounded-full flex items-center justify-center transition-opacity shadow-sm"
               aria-label="Nästa bild"
             >
               <ChevronRight className="w-5 h-5" />
             </button>
           </>
         )}
       </div>
 
       {/* Thumbnails */}
       {hasMultipleImages && (
         <div className="flex gap-2 overflow-x-auto pb-1">
           {validImages.slice(0, MAX_VISIBLE_THUMBNAILS).map((image, index) => (
             <button
               key={index}
               onClick={() => setCurrentIndex(index)}
               className={cn(
                 "w-16 h-16 flex-shrink-0 bg-secondary overflow-hidden transition-opacity",
                 index === currentIndex
                   ? "ring-2 ring-foreground ring-offset-2"
                   : "opacity-60 hover:opacity-100"
               )}
               aria-label={`Visa bild ${index + 1}`}
             >
               <img
                 src={urlFor(image)}
                 alt={image.alt || `${productName} - miniatyr ${index + 1}`}
                 className="w-full h-full object-cover"
               />
             </button>
           ))}
           {validImages.length > MAX_VISIBLE_THUMBNAILS && (
             <div className="w-16 h-16 flex-shrink-0 bg-secondary flex items-center justify-center text-sm text-muted-foreground">
               +{validImages.length - MAX_VISIBLE_THUMBNAILS}
             </div>
           )}
         </div>
       )}
     </div>
   );
 };
 
 export default ProductImageGallery;