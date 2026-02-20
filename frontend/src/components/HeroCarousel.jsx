import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const images = [
  '/images/countryside-woman-holding-plant-leaves.jpg',
  '/images/countryside-workers-out-field.jpg',
  '/images/happy-cheerful-african-american-farm-worker-holding-crate-full-local-eco-friendly-ripe-leafy-greens-from-sustainable-crop-harvest-entrepreneurial-bio-permaculture-greenhouse-farm.jpg',
  '/images/strawberry-field.jpg',
  '/images/tractor-working-green-field.jpg',
  '/images/truck-working-field-sunny-day.jpg',
  '/images/woman-working-rural-farming-agriculture-sector-celebrate-women-working-field-labour-day.jpg',
];

const TRANSITION_DURATION = 5000; // 5 seconds per image

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % images.length);
          return 0;
        }
        return prev + (100 / (TRANSITION_DURATION / 50)); // Update every 50ms
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  return (
    <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
      {/* Background images */}
      <div className="absolute inset-0">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
            Empowering Agriculture Through Knowledge
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-slate-100 drop-shadow-md max-w-2xl mx-auto">
            Discover farming products, expert education, and sustainable practices to grow your agricultural success
          </p>
          <Link
            to="/blog"
            className="inline-block px-8 py-3 bg-white text-slate-800 rounded-lg font-semibold text-lg hover:bg-slate-100 transition-colors shadow-lg"
          >
            Explore Our Blog
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-50"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Image indicators (dots) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goToSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
