import React from 'react';
import Image from 'next/image';

// Import your images
import Image1 from '../../../public/images/1.png';
import Image2 from '../../../public/images/2.png';
import Image3 from '../../../public/images/3.png';
import Image4 from '../../../public/images/4.png';
import Image5 from '../../../public/images/5.png';
import Image6 from '../../../public/images/6.png';
import Image7 from '../../../public/images/7.png';
import Image8 from '../../../public/images/8.png';
import Image9 from '../../../public/images/9.png';

const ImagesShow = () => {
  const images = [
    { src: Image1, alt: "Student Dashboard" },
    { src: Image2, alt: "Payment System" },
    { src: Image3, alt: "Results Management" },
    { src: Image4, alt: "Teacher Management" },
    { src: Image5, alt: "Attendance System" },
    { src: Image6, alt: "Class Management" },
    { src: Image7, alt: "System Overview 1" },
    { src: Image8, alt: "System Overview 2" },
    { src: Image9, alt: "System Overview 3" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
          System Images Gallery
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                <h3 className="text-lg font-semibold">{image.alt}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImagesShow;