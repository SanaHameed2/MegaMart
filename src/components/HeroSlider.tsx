import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  discount: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: '/assets/images/mango.jpg',
    title: 'FRESH MANGOES & FRUITS',
    subtitle: 'Get farm-fresh organic mangoes and seasonal fruits delivered to your doorstep.',
    discount: 'UP TO 30% OFF',
  },
  {
    id: 2,
    image: '/assets/images/iphone.png',
    title: 'SMARTPHONES & GADGETS',
    subtitle: 'Upgrade your tech with the latest models and exclusive online deals.',
    discount: 'SPECIAL OFFER',
  },
  {
    id: 3,
    image: '/assets/images/washing machine.png',
    title: 'HOME APPLIANCES',
    subtitle: 'High quality daily home essentials priced fair with fast delivery.',
    discount: 'MEGA SALE',
  },
];

export const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
      <div className="relative rounded-2xl overflow-hidden bg-[#212529] h-[260px] sm:h-[340px] md:h-[380px] shadow-sm flex items-center">
        
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-between px-8 sm:px-16 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="max-w-md z-20 text-white">
              <span className="inline-block bg-[#008ECC] text-white text-[11px] font-bold px-3 py-1 rounded-full mb-3 tracking-wide">
                {slide.discount}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 uppercase">
                {slide.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 mb-6 font-light">
                {slide.subtitle}
              </p>
              <button className="bg-[#008ECC] hover:bg-[#0077A9] text-white text-xs font-semibold px-6 py-2.5 rounded-lg transition-colors">
                Shop Now
              </button>
            </div>

            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-1/2 max-h-[80%] hidden sm:flex items-center justify-center">
              <img
                src={slide.image}
                alt={slide.title}
                className="max-h-[300px] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-3 z-30 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 z-30 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === index ? 'w-6 bg-[#008ECC]' : 'w-2 bg-gray-500/50'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default HeroSlider;