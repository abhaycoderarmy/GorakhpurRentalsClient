import { useEffect, useState } from "react";
import HeroSection from "./Home/HetroSection";
import BrandShowcase from "./Home/BrandShowcase";
import OurRentalProcess from "./Home/OurRentalProcess";
import RentForACause from "./Home/RentForACause";
import Footer from "../components/Footer";
import InstagramPost from "./Home/InstagramPost";
import Reels from "./Home/Reels"
import Review from "./Home/Review"

export default function Homepage() {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Brand Showcase */}
      <BrandShowcase />

    
      
      {/* Our Rental Process */}
      <OurRentalProcess />

      
      
      {/* Rent for a Cause */}
      <RentForACause />


  {/* Reels Showcase */}
      <Reels />
      
      <Review />

      {/* Instagram Post Section */}
      <InstagramPost />

      <Footer />
    </div>
  );
}