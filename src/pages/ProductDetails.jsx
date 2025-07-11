// import { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useCart } from "../context/CartContext";
// import Footer from "../components/Footer";
// import Reviews from "../components/Review"; // Import the Reviews component
// // import toast from "react-hot-toast";

// export default function ProductDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { addToCart } = useCart();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [selectedSize, setSelectedSize] = useState("");
//   const [selectedRentDuration, setSelectedRentDuration] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
//   const [showDescription, setShowDescription] = useState(true);
//   const [showReviews, setShowReviews] = useState(false);
//   const [isAutoPlaying, setIsAutoPlaying] = useState(true);
//   const [slideInterval, setSlideInterval] = useState(null);
//   const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

//   // New state for date booking
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
//   const [availabilityStatus, setAvailabilityStatus] = useState(null);
//   const [dateError, setDateError] = useState("");
//   // const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");

  

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/products/${id}`
//         );
//         setProduct(res.data);

//         // Set default selections
//         if (res.data.sizes && res.data.sizes.length > 0) {
//           setSelectedSize(res.data.sizes[0]);
//         }
//         if (res.data.rentDuration && res.data.rentDuration.length > 0) {
//           setSelectedRentDuration(res.data.rentDuration[0]);
//         }

//         setError("");
//       } catch (err) {
//         console.error("Failed to fetch product", err);
//         setError("Failed to load product details. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchProduct();
//     }
//   }, [id]);

//   // Function to get minimum date (today)
//   const getMinDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   // Function to get minimum rental days from duration
//   const getMinRentalDays = (duration) => {
//     if (!duration) return 1;

//     if (duration.includes("day")) {
//       return parseInt(duration.match(/\d+/)[0]);
//     } else if (duration.includes("week")) {
//       return parseInt(duration.match(/\d+/)[0]) * 7;
//     } else if (duration.includes("month")) {
//       return parseInt(duration.match(/\d+/)[0]) * 30;
//     }
//     return 1;
//   };

//   // Function to calculate minimum end date based on rental duration
//   const getMinEndDate = (startDate, duration) => {
//     if (!startDate || !duration) return getMinDate();

//     const start = new Date(startDate);
//     const minDays = getMinRentalDays(duration);
//     const minEnd = new Date(start);
//     minEnd.setDate(start.getDate() + minDays);

//     return minEnd.toISOString().split("T")[0];
//   };

//   // Validate date selection based on rental duration
//   const validateDateSelection = useCallback((start, end, duration) => {
//     if (!start || !end || !duration)
//       return { valid: false, message: "Please select both dates" };

//     const startDate = new Date(start);
//     const endDate = new Date(end);
//     const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
//     const minDays = getMinRentalDays(duration);

//     if (daysDiff < minDays) {
//       return {
//         valid: false,
//         message: `Minimum rental period is ${minDays} days for ${duration}`,
//       };
//     }

//     return { valid: true, message: "" };
//   }, []);

//   // Auto-validate dates when they change
//   useEffect(() => {
//     if (startDate && endDate && selectedRentDuration) {
//       const validation = validateDateSelection(
//         startDate,
//         endDate,
//         selectedRentDuration
//       );
//       if (!validation.valid) {
//         setDateError(validation.message);
//         setAvailabilityStatus(null);
//         return;
//       } else {
//         setDateError("");
//       }
//     }
//   }, [startDate, endDate, selectedRentDuration]);

//   // Check availability function
//   const checkAvailability = useCallback(async () => {
//     if (!startDate || !endDate) {
//       setDateError("Please select both start and end dates");
//       return;
//     }

//     const validation = validateDateSelection(
//       startDate,
//       endDate,
//       selectedRentDuration
//     );
//     if (!validation.valid) {
//       setDateError(validation.message);
//       return;
//     }

//     try {
//       setIsCheckingAvailability(true);
//       setDateError("");

//       const response = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/products/${id}/check-availability`,
//         { startDate, endDate }
//       );

//       setAvailabilityStatus(response.data);
//     } catch (error) {
//       console.error("Error checking availability:", error);
//       setDateError("Failed to check availability. Please try again.");
//       setAvailabilityStatus(null);
//     } finally {
//       setIsCheckingAvailability(false);
//     }
//   }, [startDate, endDate, selectedRentDuration, id]);

//   // Auto-check availability when dates change
//   useEffect(() => {
//     if (startDate && endDate && product && !dateError) {
//       const timeoutId = setTimeout(() => {
//         checkAvailability();
//       }, 500);

//       return () => clearTimeout(timeoutId);
//     }
//   }, [startDate, endDate, product?.id, dateError]);

//   useEffect(() => {
//     if (isAutoPlaying && product?.images && product.images.length > 1) {
//       const interval = setInterval(() => {
//         setCurrentImageIndex(
//           (prevIndex) => (prevIndex + 1) % product.images.length
//         );
//       }, 3000); // 3 seconds

//       setSlideInterval(interval);

//       return () => clearInterval(interval);
//     } else if (slideInterval) {
//       clearInterval(slideInterval);
//       setSlideInterval(null);
//     }
//   }, [isAutoPlaying, product?.images?.length]);
//   const showToast = (message, type = 'success') => {
//   setToast({ show: true, message, type });
//   setTimeout(() => {
//     setToast({ show: false, message: '', type: 'success' });
//   }, 3000); // Hide after 3 seconds
// };
//   const handleAddToCart = async () => {
//     if (!startDate || !endDate) {
//       showToast("Please select both start and end dates for rental", "error");
//       return;
//     }

//     const validation = validateDateSelection(
//       startDate,
//       endDate,
//       selectedRentDuration
//     );
//     if (!validation.valid) {
//       setDateError(validation.message);
//       return;
//     }

//     if (!availabilityStatus || !availabilityStatus.available) {
//       setDateError("Product is not available for selected dates");
//       return;
//     }

//     if (product) {
//       const cartItem = {
//         ...product,
//         selectedSize,
//         selectedRentDuration,
//         quantity,
//         startDate,
//         endDate,
//         rentalDates: {
//           start: startDate,
//           end: endDate,
//         },
//       };
//       const result = await addToCart(product._id, quantity, startDate, endDate);
//       if (result.success) {
//         showToast(`${product.name} added to cart successfully!`, 'success');
//       } else {
//         showToast(result.message, 'error');
//       }
//     }
//   };

//   const goToPreviousImage = useCallback(() => {
//     if (product && product.images) {
//       setIsAutoPlaying(false);
//       if (slideInterval) clearInterval(slideInterval);

//       setCurrentImageIndex((prevIndex) =>
//         prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
//       );

//       setTimeout(() => setIsAutoPlaying(true), 10000);
//     }
//   }, [product, slideInterval]);

//   const goToNextImage = useCallback(() => {
//     if (product && product.images) {
//       setIsAutoPlaying(false);
//       if (slideInterval) clearInterval(slideInterval);

//       setCurrentImageIndex(
//         (prevIndex) => (prevIndex + 1) % product.images.length
//       );

//       setTimeout(() => setIsAutoPlaying(true), 10000);
//     }
//   }, [product, slideInterval]);

//   const selectImage = useCallback(
//     (index) => {
//       setIsAutoPlaying(false);
//       if (slideInterval) clearInterval(slideInterval);

//       setCurrentImageIndex(index);

//       setTimeout(() => setIsAutoPlaying(true), 10000);
//     },
//     [slideInterval]
//   );

//   const openFullscreen = useCallback(() => {
//     setIsFullscreenOpen(true);
//     document.body.style.overflow = "hidden";
//   }, []);

//   const closeFullscreen = useCallback(() => {
//     setIsFullscreenOpen(false);
//     document.body.style.overflow = "unset";
//   }, []);

//   // Handle keyboard navigation in fullscreen
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (isFullscreenOpen) {
//         if (e.key === "Escape") {
//           closeFullscreen();
//         } else if (e.key === "ArrowLeft") {
//           goToPreviousImage();
//         } else if (e.key === "ArrowRight") {
//           goToNextImage();
//         }
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);
//     return () => document.removeEventListener("keydown", handleKeyDown);
//   }, [isFullscreenOpen, closeFullscreen, goToPreviousImage, goToNextImage]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-600 mb-4">
//             Product Not Found
//           </h2>
//           <button
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }
//  return (
//   <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">

//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//       {/* Breadcrumb */}
//       <nav className="flex items-center space-x-2 text-sm text-gray-700 mb-6 font-medium">
//         <button onClick={() => navigate("/")} className="hover:text-rose-600 transition-colors">
//           Home
//         </button>
//         <span className="text-rose-400">›</span>
//         <span className="text-gray-900">{product.name}</span>
//       </nav>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//         {/* Left Column - Product Images */}
//         <div className="lg:col-span-7">
//           <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6">
//             {/* Main Image */}
//             <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-pink-50 rounded-xl overflow-hidden mb-6 shadow-inner">
//               {product.images && product.images.length > 0 ? (
//                 <>
//                   <img
//                     src={product.images[currentImageIndex]}
//                     alt={product.name}
//                     className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-all duration-500 ease-out"
//                     onClick={openFullscreen}
//                   />

//                   {/* Zoom indicator */}
//                   <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded-full text-xs font-medium backdrop-blur-sm">
//                     🔍 Click to zoom
//                   </div>

//                   {/* Navigation arrows */}
//                   {product.images.length > 1 && (
//                     <>
//                       <button
//                         onClick={goToPreviousImage}
//                         className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-xl rounded-full p-3 hover:bg-pink-50 transition-all duration-200 hover:scale-110"
//                       >
//                         <svg
//                           className="w-6 h-6 text-gray-700"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2.5}
//                             d="M15 19l-7-7 7-7"
//                           />
//                         </svg>
//                       </button>

//                       <button
//                         onClick={goToNextImage}
//                         className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-xl rounded-full p-3 hover:bg-pink-50 transition-all duration-200 hover:scale-110"
//                       >
//                         <svg
//                           className="w-6 h-6 text-gray-700"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2.5}
//                             d="M9 5l7 7-7 7"
//                           />
//                         </svg>
//                       </button>
//                     </>
//                   )}
//                 </>
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-pink-100">
//                   <svg
//                     className="w-32 h-32 text-gray-300"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={1}
//                       d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                     />
//                   </svg>
//                 </div>
//               )}
//             </div>

//             {/* Thumbnail Images */}
//             {product.images && product.images.length > 1 && (
//               <div className="flex space-x-3 overflow-x-auto pb-2">
//                 {product.images.map((image, index) => (
//                   <button
//                     key={index}
//                     onClick={() => selectImage(index)}
//                     className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-200 ${
//                       index === currentImageIndex
//                         ? "border-rose-400 ring-2 ring-rose-200 shadow-lg scale-105"
//                         : "border-pink-200 hover:border-pink-300 hover:scale-105"
//                     }`}
//                   >
//                     <img
//                       src={image}
//                       alt={`${product.name} ${index + 1}`}
//                       className="w-full h-full object-cover"
//                     />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right Column - Product Info */}
//         <div className="lg:col-span-5">
//           <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8">
//             {/* Product Title */}
//             <div className="mb-6">
//               <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3 tracking-tight">
//                 {product.name}
//               </h1>
//             </div>

//             {/* Price Section */}
//             <div className="mb-8">
//               <div className="flex items-baseline space-x-3">
//                 <span className="text-4xl font-bold text-gray-900 tracking-tight">
//                   ₹{product.price?.toLocaleString('en-IN')}
//                 </span>
//               </div>
//               <p className="text-sm text-gray-600 mt-2 font-medium">
//                 Inclusive of all taxes
//               </p>
//             </div>

//             {/* Availability */}
//             <div className="mb-8">
//               <div className="flex items-center space-x-3 bg-green-50 rounded-lg px-4 py-3">
//                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
//                 <span className="text-green-700 font-semibold">In Stock</span>
//               </div>
//             </div>

//             {/* Size Selection */}
//             {product.sizes && product.sizes.length > 0 && (
//               <div className="mb-8">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                   Select Size:
//                 </h3>
//                 <div className="flex flex-wrap gap-3">
//                   {product.sizes.map((size) => (
//                     <button
//                       key={size}
//                       onClick={() => setSelectedSize(size)}
//                       className={`min-w-14 px-4 py-3 border-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
//                         selectedSize === size
//                           ? "border-rose-400 bg-rose-50 text-rose-700 shadow-md scale-105"
//                           : "border-pink-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50 hover:scale-105"
//                       }`}
//                     >
//                       {size}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Date Selection */}
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 Select Rental Dates:
//               </h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     Start Date
//                   </label>
//                   <input
//                     type="date"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                     min={getMinDate()}
//                     className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-3">
//                     End Date
//                   </label>
//                   <input
//                     type="date"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                     min={getMinEndDate(startDate, selectedRentDuration)}
//                     className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Date Error */}
//             {dateError && (
//               <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
//                 <div className="flex">
//                   <svg
//                     className="w-5 h-5 text-red-500 mr-3 mt-0.5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                     />
//                   </svg>
//                   <span className="text-sm text-red-700 font-medium">{dateError}</span>
//                 </div>
//               </div>
//             )}

//             {/* Availability Status */}
//             {isCheckingAvailability && (
//               <div className="mb-6 flex items-center text-blue-600 bg-blue-50 rounded-xl p-4">
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
//                 <span className="text-sm font-medium">Checking availability...</span>
//               </div>
//             )}

//             {availabilityStatus && (
//               <div
//                 className={`mb-6 p-4 rounded-xl border-2 ${
//                   availabilityStatus.available
//                     ? "bg-green-50 border-green-200 text-green-800"
//                     : "bg-red-50 border-red-200 text-red-800"
//                 }`}
//               >
//                 <div className="flex items-center">
//                   {availabilityStatus.available ? (
//                     <svg
//                       className="w-6 h-6 mr-3"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2.5}
//                         d="M5 13l4 4L19 7"
//                       />
//                     </svg>
//                   ) : (
//                     <svg
//                       className="w-6 h-6 mr-3"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2.5}
//                         d="M6 18L18 6M6 6l12 12"
//                       />
//                     </svg>
//                   )}
//                   <span className="text-sm font-semibold">
//                     {availabilityStatus.available
//                       ? "✨ Available for selected dates!"
//                       : "❌ Not available for selected dates. Please choose different dates."}
//                   </span>
//                 </div>
//               </div>
//             )}

//             {/* Action Buttons */}
//             <div className="space-y-4">
//               <button
//                 onClick={handleAddToCart}
//                 disabled={
//                   !availabilityStatus?.available || !startDate || !endDate
//                 }
//                 className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
//               >
//                 🛒 Add to Cart
//               </button>

//               {/* Additional Info */}
//               <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-pink-100">
//                 <div className="text-center">
//                   <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-3 w-12 h-12 mx-auto mb-3">
//                     <svg
//                       className="w-6 h-6 text-blue-600 mx-auto"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
//                       />
//                     </svg>
//                   </div>
//                   <p className="text-xs text-gray-700 font-semibold">Best Price</p>
//                 </div>
//                 <div className="text-center">
//                   <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-3 w-12 h-12 mx-auto mb-3">
//                     <svg
//                       className="w-6 h-6 text-green-600 mx-auto"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                       />
//                     </svg>
//                   </div>
//                   <p className="text-xs text-gray-700 font-semibold">Quality Assured</p>
//                 </div>
//                 <div className="text-center">
//                   <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full p-3 w-12 h-12 mx-auto mb-3">
//                     <svg
//                       className="w-6 h-6 text-purple-600 mx-auto"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
//                       />
//                     </svg>
//                   </div>
//                   <p className="text-xs text-gray-700 font-semibold">Secure Payment</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Product Details and Reviews Tabs */}
//       <div className="mt-12 bg-white rounded-2xl shadow-lg border border-pink-100">
//         {/* Tab Navigation */}
//         <div className="border-b-2 border-pink-100">
//           <nav className="flex">
//             <button
//               onClick={() => {
//                 setShowDescription(true);
//                 setShowReviews(false);
//               }}
//               className={`py-6 px-8 text-lg font-bold border-b-4 transition-all duration-200 ${
//                 showDescription
//                   ? "border-rose-400 text-rose-600 bg-rose-50"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-pink-200 hover:bg-pink-50"
//               }`}
//             >
//               📋 Product Details
//             </button>
//             <button
//               onClick={() => {
//                 setShowDescription(false);
//                 setShowReviews(true);
//               }}
//               className={`py-6 px-8 text-lg font-bold border-b-4 transition-all duration-200 ${
//                 showReviews
//                   ? "border-rose-400 text-rose-600 bg-rose-50"
//                   : "border-transparent text-gray-500 hover:text-gray-700 hover:border-pink-200 hover:bg-pink-50"
//               }`}
//             >
//               ⭐ Reviews & Ratings
//             </button>
//           </nav>
//         </div>

//         {/* Tab Content */}
//         <div className="p-8">
//           {showDescription && (
//             <div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-6">
//                 About this item
//               </h3>
//               <div className="prose max-w-none">
//                 <p className="text-gray-700 leading-relaxed text-lg font-medium">
//                   {product.description ||
//                     "No description available for this product."}
//                 </p>
//               </div>
//             </div>
//           )}

//           {showReviews && (
//             <div>
//               <Reviews productId={product._id} />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Fullscreen Image Modal */}
//       {isFullscreenOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
//           <div className="relative w-full h-full flex items-center justify-center p-4">
//             <img
//               src={product.images[currentImageIndex]}
//               alt={product.name}
//               className="max-w-full max-h-full object-contain"
//             />

//             {/* Close button */}
//             <button
//               onClick={closeFullscreen}
//               className="absolute top-8 right-8 text-white hover:text-pink-300 transition-colors bg-black bg-opacity-50 rounded-full p-3"
//             >
//               <svg
//                 className="w-8 h-8"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2.5}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>

//             {/* Navigation arrows */}
//             {product.images.length > 1 && (
//               <>
//                 <button
//                   onClick={goToPreviousImage}
//                   className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white hover:text-pink-300 transition-colors bg-black bg-opacity-50 rounded-full p-4"
//                 >
//                   <svg
//                     className="w-8 h-8"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2.5}
//                       d="M15 19l-7-7 7-7"
//                     />
//                   </svg>
//                 </button>

//                 <button
//                   onClick={goToNextImage}
//                   className="absolute right-8 top-1/2 transform -translate-y-1/2 text-white hover:text-pink-300 transition-colors bg-black bg-opacity-50 rounded-full p-4"
//                 >
//                   <svg
//                     className="w-8 h-8"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2.5}
//                       d="M9 5l7 7-7 7"
//                     />
//                   </svg>
//                 </button>
//               </>
//             )}

//             {/* Image counter */}
//             <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-60 px-6 py-3 rounded-full text-lg font-bold backdrop-blur-sm">
//               {currentImageIndex + 1} / {product.images.length}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//    {/* Toast Notification */}
// {toast.show && (
//   <div className="fixed top-4 right-4 z-50 animate-fade-in">
//     <div className={`px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm border ${
//       toast.type === 'success' 
//         ? 'bg-green-500/90 border-green-400 text-white' 
//         : 'bg-red-500/90 border-red-400 text-white'
//     }`}>
//       <div className="flex items-center gap-3">
//         {toast.type === 'success' ? (
//           <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//           </svg>
//         ) : (
//           <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         )}
//         <span className="font-medium">{toast.message}</span>
//       </div>
//     </div>
//   </div>
// )}
//     <Footer />
//   </div>
// );
// }
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import Reviews from "../components/Review"; // Import the Reviews component
// import toast from "react-hot-toast";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedRentDuration, setSelectedRentDuration] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slideInterval, setSlideInterval] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // New state for date booking
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [dateError, setDateError] = useState("");
  // const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/products/${id}`
        );
        setProduct(res.data);

        // Set default selections
        if (res.data.sizes && res.data.sizes.length > 0) {
          setSelectedSize(res.data.sizes[0]);
        }
        if (res.data.rentDuration && res.data.rentDuration.length > 0) {
          setSelectedRentDuration(res.data.rentDuration[0]);
        }

        setError("");
      } catch (err) {
        console.error("Failed to fetch product", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Function to get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Function to get minimum rental days from duration
  const getMinRentalDays = (duration) => {
    if (!duration) return 1;

    if (duration.includes("day")) {
      return parseInt(duration.match(/\d+/)[0]);
    } else if (duration.includes("week")) {
      return parseInt(duration.match(/\d+/)[0]) * 7;
    } else if (duration.includes("month")) {
      return parseInt(duration.match(/\d+/)[0]) * 30;
    }
    return 1;
  };

  // Function to calculate minimum end date based on rental duration
  const getMinEndDate = (startDate, duration) => {
    if (!startDate || !duration) return getMinDate();

    const start = new Date(startDate);
    const minDays = getMinRentalDays(duration);
    const minEnd = new Date(start);
    minEnd.setDate(start.getDate() + minDays);

    return minEnd.toISOString().split("T")[0];
  };

  // Validate date selection based on rental duration
  const validateDateSelection = useCallback((start, end, duration) => {
    if (!start || !end || !duration)
      return { valid: false, message: "Please select both dates" };

    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const minDays = getMinRentalDays(duration);

    if (daysDiff < minDays) {
      return {
        valid: false,
        message: `Minimum rental period is ${minDays} days for ${duration}`,
      };
    }

    return { valid: true, message: "" };
  }, []);

  // Auto-validate dates when they change
  useEffect(() => {
    if (startDate && endDate && selectedRentDuration) {
      const validation = validateDateSelection(
        startDate,
        endDate,
        selectedRentDuration
      );
      if (!validation.valid) {
        setDateError(validation.message);
        setAvailabilityStatus(null);
        return;
      } else {
        setDateError("");
      }
    }
  }, [startDate, endDate, selectedRentDuration]);

  // Check availability function
  const checkAvailability = useCallback(async () => {
    if (!startDate || !endDate) {
      setDateError("Please select both start and end dates");
      return;
    }

    const validation = validateDateSelection(
      startDate,
      endDate,
      selectedRentDuration
    );
    if (!validation.valid) {
      setDateError(validation.message);
      return;
    }

    try {
      setIsCheckingAvailability(true);
      setDateError("");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/products/${id}/check-availability`,
        { startDate, endDate }
      );

      setAvailabilityStatus(response.data);
    } catch (error) {
      console.error("Error checking availability:", error);
      setDateError("Failed to check availability. Please try again.");
      setAvailabilityStatus(null);
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [startDate, endDate, selectedRentDuration, id]);

  // Auto-check availability when dates change
  useEffect(() => {
    if (startDate && endDate && product && !dateError) {
      const timeoutId = setTimeout(() => {
        checkAvailability();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [startDate, endDate, product?.id, dateError]);
  // Auto-calculate end date when start date or duration changes
  useEffect(() => {
    if (startDate && selectedRentDuration) {
      const start = new Date(startDate);
      const minDays = getMinRentalDays(selectedRentDuration);
      const calculatedEndDate = new Date(start);
      calculatedEndDate.setDate(start.getDate() + minDays);

      setEndDate(calculatedEndDate.toISOString().split("T")[0]);
    }
  }, [startDate, selectedRentDuration]);

  useEffect(() => {
    if (isAutoPlaying && product?.images && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % product.images.length
        );
      }, 3000); // 3 seconds

      setSlideInterval(interval);

      return () => clearInterval(interval);
    } else if (slideInterval) {
      clearInterval(slideInterval);
      setSlideInterval(null);
    }
  }, [isAutoPlaying, product?.images?.length]);
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000); // Hide after 3 seconds
  };
  const handleAddToCart = async () => {
  if (!startDate || !selectedRentDuration) {
    showToast("Please select start date and rental duration", "error");
    return;
  }

  // Remove the manual end date validation since it's auto-calculated
  if (!endDate) {
    showToast("End date calculation error. Please try again.", "error");
    return;
  }

    const validation = validateDateSelection(
      startDate,
      endDate,
      selectedRentDuration
    );
    if (!validation.valid) {
      setDateError(validation.message);
      return;
    }

    if (!availabilityStatus || !availabilityStatus.available) {
      setDateError("Product is not available for selected dates");
      return;
    }

    if (product) {
      const cartItem = {
        ...product,
        selectedSize,
        selectedRentDuration,
        quantity,
        startDate,
        endDate,
        rentalDates: {
          start: startDate,
          end: endDate,
        },
      };
      const result = await addToCart(product._id, quantity, startDate, endDate);
      if (result.success) {
        showToast(`${product.name} added to cart successfully!`, "success");
      } else {
        showToast(result.message, "error");
      }
    }
  };

  const goToPreviousImage = useCallback(() => {
    if (product && product.images) {
      setIsAutoPlaying(false);
      if (slideInterval) clearInterval(slideInterval);

      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );

      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  }, [product, slideInterval]);

  const goToNextImage = useCallback(() => {
    if (product && product.images) {
      setIsAutoPlaying(false);
      if (slideInterval) clearInterval(slideInterval);

      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % product.images.length
      );

      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  }, [product, slideInterval]);

  const selectImage = useCallback(
    (index) => {
      setIsAutoPlaying(false);
      if (slideInterval) clearInterval(slideInterval);

      setCurrentImageIndex(index);

      setTimeout(() => setIsAutoPlaying(true), 10000);
    },
    [slideInterval]
  );

  const openFullscreen = useCallback(() => {
    setIsFullscreenOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
    document.body.style.overflow = "unset";
  }, []);

  // Handle keyboard navigation in fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreenOpen) {
        if (e.key === "Escape") {
          closeFullscreen();
        } else if (e.key === "ArrowLeft") {
          goToPreviousImage();
        } else if (e.key === "ArrowRight") {
          goToNextImage();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreenOpen, closeFullscreen, goToPreviousImage, goToNextImage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Product Not Found
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-700 mb-6 font-medium">
          <button
            onClick={() => navigate("/")}
            className="hover:text-rose-600 transition-colors"
          >
            Home
          </button>
          <span className="text-rose-400">›</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Product Images */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6">
              {/* Main Image */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-pink-50 rounded-xl overflow-hidden mb-6 shadow-inner">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images[currentImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-all duration-500 ease-out"
                      onClick={openFullscreen}
                    />

                    {/* Zoom indicator */}
                    <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded-full text-xs font-medium backdrop-blur-sm">
                      🔍 Click to zoom
                    </div>

                    {/* Navigation arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={goToPreviousImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-xl rounded-full p-3 hover:bg-pink-50 transition-all duration-200 hover:scale-110"
                        >
                          <svg
                            className="w-6 h-6 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={goToNextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-xl rounded-full p-3 hover:bg-pink-50 transition-all duration-200 hover:scale-110"
                        >
                          <svg
                            className="w-6 h-6 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-pink-100">
                    <svg
                      className="w-32 h-32 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => selectImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-200 ${
                        index === currentImageIndex
                          ? "border-rose-400 ring-2 ring-rose-200 shadow-lg scale-105"
                          : "border-pink-200 hover:border-pink-300 hover:scale-105"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8">
              {/* Product Title */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3 tracking-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price Section */}
              <div className="mb-8">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-gray-900 tracking-tight">
                    ₹{product.price?.toLocaleString("en-IN")}
                  </span>
                  {selectedRentDuration && (
                    <span className="text-lg text-gray-600 font-medium">
                      / {selectedRentDuration}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Availability */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 bg-green-50 rounded-lg px-4 py-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-semibold">In Stock</span>
                </div>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Size:
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-14 px-4 py-3 border-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          selectedSize === size
                            ? "border-rose-400 bg-rose-50 text-rose-700 shadow-md scale-105"
                            : "border-pink-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50 hover:scale-105"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Rental Duration Selection */}
              {product.rentDuration && product.rentDuration.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Select Rental Duration:
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.rentDuration.map((duration) => (
                      <button
                        key={duration}
                        onClick={() => setSelectedRentDuration(duration)}
                        className={`px-4 py-3 border-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          selectedRentDuration === duration
                            ? "border-rose-400 bg-rose-50 text-rose-700 shadow-md scale-105"
                            : "border-pink-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50 hover:scale-105"
                        }`}
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Rental Date:
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={getMinDate()}
                      className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-200"
                    />
                  </div>

                  {/* Auto-calculated End Date Display */}
                  {startDate && selectedRentDuration && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        End Date (Auto-calculated)
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium bg-gray-50 text-gray-700">
                        {endDate || "Select start date and duration"}
                      </div>
                    </div>
                  )}

                  {/* Show rental period info */}
                  {startDate && endDate && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-blue-600 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm text-blue-800 font-medium">
                          Rental Period:{" "}
                          {Math.ceil(
                            (new Date(endDate) - new Date(startDate)) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Date Error */}
              {dateError && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <div className="flex">
                    <svg
                      className="w-5 h-5 text-red-500 mr-3 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-red-700 font-medium">
                      {dateError}
                    </span>
                  </div>
                </div>
              )}

              {/* Availability Status */}
              {isCheckingAvailability && (
                <div className="mb-6 flex items-center text-blue-600 bg-blue-50 rounded-xl p-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-sm font-medium">
                    Checking availability...
                  </span>
                </div>
              )}

              {availabilityStatus && (
                <div
                  className={`mb-6 p-4 rounded-xl border-2 ${
                    availabilityStatus.available
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <div className="flex items-center">
                    {availabilityStatus.available ? (
                      <svg
                        className="w-6 h-6 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    <span className="text-sm font-semibold">
                      {availabilityStatus.available
                        ? "✨ Available for selected dates!"
                        : "❌ Not available for selected dates. Please choose different dates."}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={
                    !availabilityStatus?.available || !startDate || !endDate
                  }
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  🛒 Add to Cart
                </button>

                {/* Additional Info */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-pink-100">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                      <svg
                        className="w-6 h-6 text-blue-600 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-700 font-semibold">
                      Best Price
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                      <svg
                        className="w-6 h-6 text-green-600 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-700 font-semibold">
                      Quality Assured
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                      <svg
                        className="w-6 h-6 text-purple-600 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-700 font-semibold">
                      Secure Payment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details and Reviews Tabs */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-pink-100">
          {/* Tab Navigation */}
          <div className="border-b-2 border-pink-100">
            <nav className="flex">
              <button
                onClick={() => {
                  setShowDescription(true);
                  setShowReviews(false);
                }}
                className={`py-6 px-8 text-lg font-bold border-b-4 transition-all duration-200 ${
                  showDescription
                    ? "border-rose-400 text-rose-600 bg-rose-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-pink-200 hover:bg-pink-50"
                }`}
              >
                📋 Product Details
              </button>
              <button
                onClick={() => {
                  setShowDescription(false);
                  setShowReviews(true);
                }}
                className={`py-6 px-8 text-lg font-bold border-b-4 transition-all duration-200 ${
                  showReviews
                    ? "border-rose-400 text-rose-600 bg-rose-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-pink-200 hover:bg-pink-50"
                }`}
              >
                ⭐ Reviews & Ratings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {showDescription && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  About this item
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg font-medium">
                    {product.description ||
                      "No description available for this product."}
                  </p>
                </div>
              </div>
            )}

            {showReviews && (
              <div>
                <Reviews productId={product._id} />
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Image Modal */}
        {isFullscreenOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />

              {/* Close button */}
              <button
                onClick={closeFullscreen}
                className="absolute top-8 right-8 text-white hover:text-pink-300 transition-colors bg-black bg-opacity-50 rounded-full p-3"
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white hover:text-pink-300 transition-colors bg-black bg-opacity-50 rounded-full p-4"
                  >
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={goToNextImage}
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 text-white hover:text-pink-300 transition-colors bg-black bg-opacity-50 rounded-full p-4"
                  >
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-60 px-6 py-3 rounded-full text-lg font-bold backdrop-blur-sm">
                {currentImageIndex + 1} / {product.images.length}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div
            className={`px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm border ${
              toast.type === "success"
                ? "bg-green-500/90 border-green-400 text-white"
                : "bg-red-500/90 border-red-400 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" ? (
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
