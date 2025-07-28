import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ReelsShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [videosPerSlide, setVideosPerSlide] = useState(3);
  const videoRefs = useRef({});

  // Your 9 reel videos - replace with your actual video URLs
  const reelsData = [
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1752426277/gorakhpurrentalstudio-20250713-0004_typtfx.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1752426276/gorakhpurrentalstudio-20250713-0001_z7ncxu.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1752426274/gorakhpurrentalstudio-20250713-0002_ekfrht.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1752426267/gorakhpurrentalstudio-20250713-0003_iips7p.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722793/gorakhpurrentalstudio-20250622-0001_feysxv.mp4", // Replace with your video URLs
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722795/gorakhpurrentalstudio-20250622-0002_lifot2.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722795/gorakhpurrentalstudio-20250622-0006_wam9eu.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722796/gorakhpurrentalstudio-20250622-0007_cfdxml.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722801/gorakhpurrentalstudio-20250622-0009_cm3uzq.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722801/gorakhpurrentalstudio-20250622-0010_fcst1a.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722805/gorakhpurrentalstudio-20250622-0008_t3uojv.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722807/gorakhpurrentalstudio-20250622-0012_axg3ep.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722807/gorakhpurrentalstudio-20250622-0011_i1fqwp.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722811/gorakhpurrentalstudio-20250622-0015_v6eund.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722811/gorakhpurrentalstudio-20250622-0014_in4kj4.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722812/gorakhpurrentalstudio-20250622-0005_spjurc.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722813/gorakhpurrentalstudio-20250622-0017_fnv3dt.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722814/gorakhpurrentalstudio-20250622-0016_xgnuco.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722815/gorakhpurrentalstudio-20250622-0013_wgl3lp.mp4",
    "https://res.cloudinary.com/dyupxhasl/video/upload/v1753722826/gorakhpurrentalstudio-20250622-0004_fggdv5.mp4"
  ];

  // Handle responsive videos per slide
  useEffect(() => {
    const updateVideosPerSlide = () => {
      const width = window.innerWidth;
      if (width >= 1536) {
        setVideosPerSlide(5); // 2xl: 5 videos
      } else if (width >= 1280) {
        setVideosPerSlide(4); // xl: 4 videos
      } else if (width >= 1024) {
        setVideosPerSlide(3); // lg: 3 videos
      } else if (width >= 640) {
        setVideosPerSlide(2); // sm: 2 videos
      } else {
        setVideosPerSlide(1); // mobile: 1 video
      }
    };

    updateVideosPerSlide();
    window.addEventListener('resize', updateVideosPerSlide);
    return () => window.removeEventListener('resize', updateVideosPerSlide);
  }, []);

  // Group videos based on current screen size
  const videoGroups = [];
  for (let i = 0; i < reelsData.length; i += videosPerSlide) {
    videoGroups.push(reelsData.slice(i, i + videosPerSlide));
  }

  // Auto-slide every 4 seconds to next group of videos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % videoGroups.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [videoGroups.length]);

  // Reset slide when videos per slide changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [videosPerSlide]);

  // Manual navigation
  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % videoGroups.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + videoGroups.length) % videoGroups.length);
  };

  return (
    <div className="relative w-full min-h-[60vh] bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 py-8">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-rose-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-300 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center px-4 lg:px-8">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 lg:mb-8">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 mb-3 lg:mb-4">
              Latest Reels
            </h2>
            <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our stunning collection through exclusive video showcases
            </p>
          </div>

          {/* Video Carousel Container */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 -ml-6"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 -mr-6"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>

            {/* Videos Container */}
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {videoGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="w-full flex-shrink-0">
                    <div className={`flex justify-center ${
                      videosPerSlide === 1 ? 'gap-0' : 
                      videosPerSlide === 2 ? 'gap-4' : 
                      videosPerSlide === 3 ? 'gap-6' : 
                      videosPerSlide === 4 ? 'gap-4' : 'gap-3'
                    }`}>
                      {group.map((videoUrl, videoIndex) => (
                        <div
                          key={`${groupIndex}-${videoIndex}`}
                          className={`relative bg-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ${
                            videosPerSlide === 1 ? 'w-full max-w-xs' :
                            videosPerSlide === 2 ? 'flex-1 max-w-sm' :
                            videosPerSlide === 3 ? 'flex-1 max-w-sm' :
                            videosPerSlide === 4 ? 'flex-1 max-w-xs' :
                            'flex-1 max-w-64'
                          }`}
                        >
                          <div className="w-full" style={{ aspectRatio: '9/16' }}>
                            <video
                              ref={(el) => videoRefs.current[`${groupIndex}-${videoIndex}`] = el}
                              src={videoUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-contain bg-black rounded-xl"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-4 lg:mt-6 space-x-3">
              {videoGroups.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-pink-500 scale-125' 
                      : 'bg-pink-200 hover:bg-pink-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* View All Button */}
          <div className="text-center mt-6 lg:mt-8">
            <button 
              onClick={() => window.location.href = 'https://www.instagram.com/gorakhpurrentalstudio/?hl=en'}
              className="px-6 lg:px-8 py-2.5 lg:py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 text-sm lg:text-base"
            >
              VIEW ALL REELS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}