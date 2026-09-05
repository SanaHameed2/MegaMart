import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  subtitle: string;
  title: string;
  discount: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: '/assets/images/image 2.png',
    subtitle: 'Best Deal Online on smart watches',
    title: 'SMART WEARABLE.',
    discount: 'UP to 80% OFF',
  },
  {
    id: 2,
    image: '/assets/images/iphone.png',
    subtitle: 'Best Deal Online on smartphones',
    title: 'SMARTPHONES.',
    discount: 'UP to 50% OFF',
  },
  {
    id: 3,
    image: '/assets/images/washing machine.png',
    subtitle: 'Best Deal Online on home appliances',
    title: 'HOME APPLIANCES.',
    discount: 'UP to 40% OFF',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 font-['HK_Grotesk',sans-serif]">
      {/* Container with overflow-hidden acting as Figma Mask Group */}
      <div className="relative rounded-3xl overflow-hidden bg-[#212844] h-[280px] sm:h-[320px] md:h-[360px] flex items-center shadow-lg">
        
        {/* Figma Layering: Group 16 Vector Circles */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Top Right Circle Arc Pair (Ellipse 27 & 29) */}
          <div className="absolute -right-20 -top-40 w-[550px] h-[550px] rounded-full border-[1.5px] border-white/10" />
          <div className="absolute -right-28 -top-48 w-[640px] h-[640px] rounded-full border-[1.5px] border-white/10" />

          {/* Bottom Center Circle Pair (Ellipse 28 & 30) */}
          <div className="absolute left-[58%] -bottom-48 -translate-x-1/2 w-[320px] h-[320px] rounded-full border-[1.5px] border-white/10" />
          <div className="absolute left-[58%] -bottom-56 -translate-x-1/2 w-[400px] h-[400px] rounded-full border-[1.5px] border-white/10" />
        </div>

        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out flex items-center justify-between px-10 sm:px-16 md:px-20 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Text Content */}
            <div className="max-w-xl z-20 text-white">
              <p className="text-lg sm:text-2xl md:text-[30px] font-semibold text-white/90 mb-2 leading-tight">
                {slide.subtitle}
              </p>

              <h1 className="text-3xl sm:text-5xl md:text-[63px] font-bold text-white tracking-wide uppercase leading-tight mb-3">
                {slide.title}
              </h1>

              <p className="text-lg sm:text-2xl md:text-[30px] font-semibold text-white/90 tracking-wide">
                {slide.discount}
              </p>
            </div>

            {/* Banner Image */}
            <div className="absolute right-12 sm:right-20 top-1/2 -translate-y-1/2 h-[85%] hidden sm:flex items-center justify-center z-20">
              <img
                src={slide.image}
                alt={slide.title}
                className="max-h-full w-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-[-20px] sm:left-[-24px] z-30 bg-white text-[#008ECC] w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-md flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6 ml-4" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-[-20px] sm:right-[-24px] z-30 bg-white text-[#008ECC] w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-md flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6 mr-4" />
        </button>

        {/* Dash Pagination */}
        <div className="absolute bottom-6 left-10 sm:left-16 md:left-20 z-30 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default HeroSlider;