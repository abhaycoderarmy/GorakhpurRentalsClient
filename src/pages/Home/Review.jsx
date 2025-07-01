import { useState, useEffect } from 'react';
import { Star, User, Calendar, Quote, Heart } from 'lucide-react';

export default function ReviewsShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsPerSlide, setReviewsPerSlide] = useState(3);

  // Update reviews per slide based on screen size
  useEffect(() => {
    const updateReviewsPerSlide = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setReviewsPerSlide(1); // Mobile: 1 review
      } else if (width < 1024) {
        setReviewsPerSlide(2); // Tablet: 2 reviews
      } else {
        setReviewsPerSlide(3); // Desktop: 3 reviews
      }
    };

    updateReviewsPerSlide();
    window.addEventListener('resize', updateReviewsPerSlide);

    return () => window.removeEventListener('resize', updateReviewsPerSlide);
  }, []);

  // Fetch 5-star reviews from the database
  useEffect(() => {
    const fetchFiveStarReviews = async () => {
      try {
        setLoading(true);
        // Fetch 5-star reviews from your API endpoint
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/reviews/five-star?limit=20`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await response.json();
        setReviews(data.success ? data.data : []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err.message);
        // Fallback to mock data if API fails
        setReviews([
          {
            _id: '1',
            reviewerName: 'Sarah Johnson',
            comment: 'Absolutely amazing product! The quality exceeded my expectations and the customer service was outstanding. Highly recommend to everyone!',
            rating: 5,
            createdAt: '2024-06-15T10:30:00Z',
            isVerified: true,
            helpfulVotes: 12,
            userId: { profilePhoto: null },
            images: []
          },
          {
            _id: '2',
            reviewerName: 'Mike Chen',
            comment: 'Great value for money. Fast shipping and exactly as described. Will definitely purchase again!',
            rating: 5,
            createdAt: '2024-06-10T14:20:00Z',
            isVerified: true,
            helpfulVotes: 8,
            userId: { profilePhoto: null },
            images: []
          },
          {
            _id: '3',
            reviewerName: 'Emily Davis',
            comment: 'Love this! Perfect quality and arrived quickly. The packaging was beautiful too. Five stars!',
            rating: 5,
            createdAt: '2024-06-05T16:45:00Z',
            isVerified: false,
            helpfulVotes: 5,
            userId: { profilePhoto: null },
            images: []
          },
          {
            _id: '4',
            reviewerName: 'John Smith',
            comment: 'Exceptional service and product quality. This exceeded all my expectations. Will definitely order again!',
            rating: 5,
            createdAt: '2024-06-01T12:30:00Z',
            isVerified: true,
            helpfulVotes: 15,
            userId: { profilePhoto: null },
            images: []
          },
          {
            _id: '5',
            reviewerName: 'Lisa Wang',
            comment: 'Outstanding experience from start to finish. The attention to detail is remarkable. Highly recommended!',
            rating: 5,
            createdAt: '2024-05-28T09:15:00Z',
            isVerified: true,
            helpfulVotes: 11,
            userId: { profilePhoto: null },
            images: []
          },
          {
            _id: '6',
            reviewerName: 'David Brown',
            comment: 'Perfect product, perfect service. Everything arrived on time and exactly as described. Five stars!',
            rating: 5,
            createdAt: '2024-05-25T16:45:00Z',
            isVerified: false,
            helpfulVotes: 7,
            userId: { profilePhoto: null },
            images: []
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFiveStarReviews();
  }, []);

  // Group reviews based on current reviewsPerSlide
  const reviewGroups = [];
  for (let i = 0; i < reviews.length; i += reviewsPerSlide) {
    reviewGroups.push(reviews.slice(i, i + reviewsPerSlide));
  }

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (reviewGroups.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % reviewGroups.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [reviewGroups.length]);

  // Reset slide when reviewsPerSlide changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [reviewsPerSlide]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Truncate comment if too long
  const truncateComment = (comment, maxLength = 120) => {
    if (comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="relative w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 text-base font-medium">Loading amazing reviews...</p>
        </div>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <div className="relative w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to load reviews</h3>
          <p className="text-red-600 font-medium mb-4">Please check your connection</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all font-medium shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="relative w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-16 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600">Be the first to share your amazing experience!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-blue-200/20 to-indigo-300/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-r from-purple-200/20 to-pink-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 px-4">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className="w-6 h-6 text-yellow-400 fill-current drop-shadow-lg animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Customer Love
              </span>
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Discover why our customers can't stop raving about their experiences
            </p>
          </div>

          {/* Reviews Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {reviewGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="w-full flex-shrink-0 px-2">
                    <div className={`grid gap-4 max-w-5xl mx-auto ${
                      reviewsPerSlide === 1 
                        ? 'grid-cols-1' 
                        : reviewsPerSlide === 2 
                        ? 'grid-cols-1 md:grid-cols-2' 
                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                      {group.map((review, reviewIndex) => (
                        <div
                          key={`${groupIndex}-${reviewIndex}`}
                          className="group relative"
                          style={{ paddingTop: '12px' }}
                        >
                          {/* Review Card */}
                          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-h-[280px] flex flex-col relative">
                            {/* Quote Icon */}
                            <div className="absolute top-2 left-4">
                              <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                                <Quote className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>

                            {/* Customer Profile */}
                            <div className="flex items-center mb-4 pt-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                {review.userId?.profilePhoto ? (
                                  <img 
                                    src={review.userId.profilePhoto} 
                                    alt={review.reviewerName}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-indigo-600" />
                                )}
                              </div>
                              <div className="ml-3 flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800 truncate">
                                  {review.reviewerName}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(review.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Rating Stars */}
                            <div className="flex items-center justify-center mb-4">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className="w-4 h-4 text-yellow-400 fill-current mx-0.5" 
                                />
                              ))}
                            </div>

                            {/* Review Text - Highlighted */}
                            <div className="flex-1 mb-4">
                              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-l-4 border-indigo-400 shadow-sm">
                                <p className="text-gray-800 text-sm leading-relaxed text-center italic font-medium">
                                  "{truncateComment(review.comment, 120)}"
                                </p>
                              </div>
                            </div>

                            {/* Verified Badge */}
                            <div className="mt-auto">
                              {review.isVerified && (
                                <div className="flex justify-center">
                                  <span className="inline-flex items-center bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full font-medium border border-green-200 shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
                                    Verified Purchase
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

           
          </div>
        </div>
      </div>

      {/* Custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(180deg);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}