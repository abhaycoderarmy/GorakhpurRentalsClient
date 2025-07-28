import React from 'react';

const InstagramFollowBanner = () => {
  const handleInstagramClick = () => {
    // Replace with your actual Instagram handle
    window.open('https://www.instagram.com/gorakhpurrentalstudio/', '_blank');
  };

  return (
    <div className="w-full bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="cursor-pointer transition-transform hover:scale-[1.02] duration-300">
          <img
            src="https://res.cloudinary.com/dyupxhasl/image/upload/v1753722089/Follow_us_on_Instagram_xy3udw.png"
            alt="Follow us on Instagram"
            onClick={handleInstagramClick}
            className="w-full h-auto rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default InstagramFollowBanner;