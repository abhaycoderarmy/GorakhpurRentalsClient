import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Trash2,
  Check,
  X,
  Eye,
  Star,
  Calendar,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

const AdminReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    averageRating: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    rating: "",
    isApproved: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 20,
  });
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/reviews/admin/all?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.data.reviews);
        setStats(data.data.stats);
        setPagination(data.data.pagination);
      } else {
        console.error("Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
    setSelectedReviews([]);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle single review approval
  const handleApproveReview = async (reviewId, isApproved) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/reviews/${reviewId}/moderate`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ isApproved }),
        }
      );

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error moderating review:", error);
    }
  };

  // Handle single review deletion
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/reviews/${reviewId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          fetchReviews();
        }
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action, isApproved = null) => {
    if (selectedReviews.length === 0) return;

    setBulkActionLoading(true);
    try {
      let endpoint, method, body;

      if (action === "delete") {
        if (
          !window.confirm(
            `Are you sure you want to delete ${selectedReviews.length} reviews?`
          )
        ) {
          setBulkActionLoading(false);
          return;
        }
        endpoint = `${
          import.meta.env.VITE_BACKEND_URL
        }/reviews/admin/bulk-delete`;
        method = "DELETE";
        body = { reviewIds: selectedReviews };
      } else if (action === "moderate") {
        endpoint = `${
          import.meta.env.VITE_BACKEND_URL
        }/reviews/admin/bulk-moderate`;
        method = "PUT";
        body = { reviewIds: selectedReviews, isApproved };
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setSelectedReviews([]);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedReviews(reviews.map((r) => r._id));
    } else {
      setSelectedReviews([]);
    }
  };

  // Handle individual selection
  const handleSelectReview = (reviewId, checked) => {
    if (checked) {
      setSelectedReviews((prev) => [...prev, reviewId]);
    } else {
      setSelectedReviews((prev) => prev.filter((id) => id !== reviewId));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Render stars
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Review Management
          </h1>
          <p className="text-gray-600">Manage and moderate customer reviews</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalReviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.approvedReviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingReviews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.rating}
              onChange={(e) => handleFilterChange("rating", e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.isApproved}
              onChange={(e) => handleFilterChange("isApproved", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="true">Approved</option>
              <option value="false">Pending</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                handleFilterChange("sortBy", sortBy);
                handleFilterChange("sortOrder", sortOrder);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="rating-desc">Highest Rating</option>
              <option value="rating-asc">Lowest Rating</option>
              <option value="helpfulVotes-desc">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedReviews.length} review
                {selectedReviews.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction("moderate", true)}
                  disabled={bulkActionLoading}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkAction("moderate", false)}
                  disabled={bulkActionLoading}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                >
                  Disapprove All
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  disabled={bulkActionLoading}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No reviews found matching your criteria.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedReviews.length === reviews.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reviewer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating & Comment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.map((review) => (
                      <tr key={review._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedReviews.includes(review._id)}
                            onChange={(e) =>
                              handleSelectReview(review._id, e.target.checked)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {review.productId?.images?.[0] && (
                              <img
                                src={review.productId.images[0]}
                                alt={review.productId.name}
                                className="w-12 h-12 rounded-lg object-cover mr-3"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {review.productId?.name || "Product Deleted"}
                              </p>
                              {review.productId?.price && (
                                <p className="text-sm text-gray-500">
                                  ₹{review.productId.price}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {review.userId?.profilePhoto && (
                              <img
                                src={review.userId.profilePhoto}
                                alt={review.reviewerName}
                                className="w-8 h-8 rounded-full mr-3"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {review.reviewerName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {review.reviewerEmail}
                              </p>
                              {review.isVerified && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center mb-1">
                            {renderStars(review.rating)}
                            <span className="ml-1 text-sm text-gray-600">
                              ({review.rating})
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 line-clamp-3">
                            {review.comment}
                          </p>
                          {review.images?.length > 0 && (
                            <div className="mt-2">
                              <div className="flex flex-wrap gap-2">
                                {review.images
                                  .slice(0, 3)
                                  .map((image, index) => (
                                    <img
                                      key={index}
                                      src={image.url}
                                      alt={`Review image ${index + 1}`}
                                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                      onClick={() =>
                                        setSelectedImage(image.url)
                                      }
                                    />
                                  ))}
                                {review.images.length > 3 && (
                                  <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">
                                      +{review.images.length - 3}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {review.helpfulVotes > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {review.helpfulVotes} helpful votes
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              review.isApproved
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {review.isApproved ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(review.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {!review.isApproved && (
                              <button
                                onClick={() =>
                                  handleApproveReview(review._id, true)
                                }
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {review.isApproved && (
                              <button
                                onClick={() =>
                                  handleApproveReview(review._id, false)
                                }
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Disapprove"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(pagination.current - 1)}
                        disabled={pagination.current === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.current + 1)}
                        disabled={pagination.current === pagination.pages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(pagination.current - 1) * filters.limit + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              pagination.current * filters.limit,
                              pagination.total
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {pagination.total}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() =>
                              handlePageChange(pagination.current - 1)
                            }
                            disabled={pagination.current === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>

                          {Array.from(
                            { length: Math.min(5, pagination.pages) },
                            (_, i) => {
                              let pageNum;
                              if (pagination.pages <= 5) {
                                pageNum = i + 1;
                              } else if (pagination.current <= 3) {
                                pageNum = i + 1;
                              } else if (
                                pagination.current >=
                                pagination.pages - 2
                              ) {
                                pageNum = pagination.pages - 4 + i;
                              } else {
                                pageNum = pagination.current - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    pageNum === pagination.current
                                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}

                          <button
                            onClick={() =>
                              handlePageChange(pagination.current + 1)
                            }
                            disabled={pagination.current === pagination.pages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl max-h-full p-4">
              <img
                src={selectedImage}
                alt="Review image"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewManagement;
