import React, { useState, useEffect } from 'react';
import { Star, Camera, X, ThumbsUp, Edit2, Trash2, Send, ImageIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Star Rating Component
const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRatingChange?.(star)}
          className={`${sizeClasses[size]} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`w-full h-full ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Rating Distribution Component
const RatingDistribution = ({ ratingStats }) => {
  if (!ratingStats) return null;

  const { averageRating, totalReviews, ratingDistribution } = ratingStats;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
      
      <div className="flex items-center space-x-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{averageRating}</div>
          <StarRating rating={Math.round(averageRating)} readonly size="sm" />
          <div className="text-sm text-gray-600 mt-1">{totalReviews} reviews</div>
        </div>
        
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2 mb-1">
              <span className="text-sm w-3">{rating}</span>
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{
                    width: `${totalReviews > 0 ? (ratingDistribution[rating] / totalReviews) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">
                {ratingDistribution[rating] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Write Review Component
const WriteReview = ({ productId, onReviewSubmitted, existingReview, onCancel }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState([]);
  const [reviewerName, setReviewerName] = useState(existingReview?.reviewerName || '');
  const [reviewerEmail, setReviewerEmail] = useState(existingReview?.reviewerEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage or context
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (!existingReview) {
        setReviewerName(parsedUser.name || '');
        setReviewerEmail(parsedUser.email || '');
      }
    }
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    if (!user && (!reviewerName.trim() || !reviewerEmail.trim())) {
      toast.error('Please provide your name and email');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('comment', comment);
      
    //   if (!user) {
    //     formData.append('reviewerName', reviewerName);
    //     formData.append('reviewerEmail', reviewerEmail);
    //   }

      images.forEach((image) => {
  console.log('Appending image:', image.name, image.size); // Debug log
  formData.append('images', image); // NOT 'images[]'
});

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      };

      let response;
      if (existingReview) {
        response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/reviews/${existingReview._id}`,
          formData,
          config
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/reviews/product/${productId}`,
          formData,
          config
        );
      }

      toast.success(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
      onReviewSubmitted?.(response.data.data);
      
      // Reset form if creating new review
      if (!existingReview) {
        setRating(0);
        setComment('');
        setImages([]);
        if (!user) {
          setReviewerName('');
          setReviewerEmail('');
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">
        {existingReview ? 'Edit Review' : 'Write a Review'}
      </h3>
      
      {/* Fixed: Changed from div to form element */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
        </div>

        {!user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Email *
              </label>
              <input
                type="email"
                value={reviewerEmail}
                onChange={(e) => setReviewerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share your experience with this product..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos (Optional)
          </label>
          <div className="space-y-3">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="review-images"
            />
            <label
              htmlFor="review-images"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Photos
            </label>
            
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
          {existingReview && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Individual Review Component
const ReviewItem = ({ review, currentUser, onReviewUpdated, onReviewDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState(review.helpfulVotes || 0);

  useEffect(() => {
    if (currentUser && review.helpfulBy) {
      setIsHelpful(review.helpfulBy.includes(currentUser.id));
    }
  }, [currentUser, review.helpfulBy]);

  const handleHelpful = async () => {
    if (!currentUser) {
      toast.error('Please login to mark reviews as helpful');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/reviews/${review._id}/helpful`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setIsHelpful(response.data.data.helpful);
      setHelpfulVotes(response.data.data.helpfulVotes);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error marking helpful:', error);
      toast.error('Failed to update helpful status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/reviews/${review._id}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      toast.success('Review deleted successfully');
      onReviewDeleted?.(review._id);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canEditOrDelete = currentUser && (
    (review.userId && review.userId.toString() === currentUser.id) ||
    currentUser.isAdmin
  );

  if (isEditing) {
    return (
      <WriteReview
        productId={review.productId}
        existingReview={review}
        onReviewSubmitted={(updatedReview) => {
          setIsEditing(false);
          onReviewUpdated?.(updatedReview);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {review.userId?.profilePhoto ? (
                <img
                  src={review.userId.profilePhoto}
                  alt={review.userId?.name || review.reviewerName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium">
                   {(review.userId?.name || review.reviewerName)?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">
  {review.userId?.name || review.reviewerName}
</div>
              <div className="text-sm text-gray-600">{formatDate(review.createdAt)}</div>
            </div>
          </div>
          {review.isVerified && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Verified Purchase
            </span>
          )}
        </div>

        {canEditOrDelete && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 p-1"
              title="Edit review"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 p-1"
              title="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mb-3">
        <StarRating rating={review.rating} readonly />
      </div>

      <p className="text-gray-700 mb-4">{review.comment}</p>

      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={`Review image ${index + 1}`}
                className="w-full h-16 object-cover rounded-md cursor-pointer hover:opacity-80"
                onClick={() => {
                  setSelectedImageIndex(index);
                  setShowImages(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600">
        <button
          onClick={handleHelpful}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
            isHelpful
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100'
          }`}
          disabled={!currentUser}
        >
          <ThumbsUp className={`w-4 h-4 ${isHelpful ? 'fill-current' : ''}`} />
          <span>Helpful ({helpfulVotes})</span>
        </button>
      </div>

      {/* Image Modal */}
      {showImages && review.images && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-full p-4">
            <div className="relative">
              <img
                src={review.images[selectedImageIndex]?.url}
                alt={`Review image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain"
              />
              <button
                onClick={() => setShowImages(false)}
                className="absolute top-4 right-4 bg-white bg-opacity-20 text-white rounded-full p-2 hover:bg-opacity-30"
              >
                <X className="w-6 h-6" />
              </button>
              
              {review.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(
                      selectedImageIndex === 0 ? review.images.length - 1 : selectedImageIndex - 1
                    )}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white rounded-full p-2 hover:bg-opacity-30"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(
                      (selectedImageIndex + 1) % review.images.length
                    )}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white rounded-full p-2 hover:bg-opacity-30"
                  >
                    →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Reviews Component
const Reviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    rating: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [productId, filters, pagination.current]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 10,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.rating && { rating: filters.rating })
      });

      // Fixed: Added /api/v1 prefix to match the endpoint structure
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/reviews/product/${productId}?${params}`
      );

      setReviews(response.data.data.reviews);
      setPagination(response.data.data.pagination);
      setRatingStats(response.data.data.ratingStats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setShowWriteReview(false);
    fetchReviews(); // Refresh to get updated stats
  };

  const handleReviewUpdated = (updatedReview) => {
    setReviews(prev =>
      prev.map(review =>
        review._id === updatedReview._id ? updatedReview : review
      )
    );
    fetchReviews(); // Refresh to get updated stats
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews(prev => prev.filter(review => review._id !== reviewId));
    fetchReviews(); // Refresh to get updated stats
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RatingDistribution ratingStats={ratingStats} />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={filters.rating}
            onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy, sortOrder }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="rating-desc">Highest Rating</option>
            <option value="rating-asc">Lowest Rating</option>
            <option value="helpfulVotes-desc">Most Helpful</option>
          </select>
        </div>

        <button
          onClick={() => setShowWriteReview(!showWriteReview)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showWriteReview ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {showWriteReview && (
        <WriteReview
          productId={productId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              currentUser={currentUser}
              onReviewUpdated={handleReviewUpdated}
              onReviewDeleted={handleReviewDeleted}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No reviews yet</p>
            <p className="text-gray-400">Be the first to review this product!</p>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPagination(prev => ({ ...prev, current: i + 1 }))}
              className={`px-3 py-2 rounded-md ${
                pagination.current === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
