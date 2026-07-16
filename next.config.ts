import type { NextConfig } from 'next';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
// This is the key fix for the DATABASE_URL issue during build
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

console.log('🔍 Environment loading check:');
console.log('📌 DATABASE_URL exists:', !!process.env.DATABASE_URL);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Pass environment variables to the build process
  env: {
    DATABASE_URL: process.env.DATABASE_URL || '',
    STORAGE_URL: process.env.STORAGE_URL || '',
  },
  
  // Optional: If you have images from external sources
  images: {
    domains: [], // Add any external image domains here
  },
  
  // Optional: Enable this if you want to see more build details
  // logging: {
  //   fetches: {
  //     fullUrl: true,
  //   },
  // },
};

export default nextConfig;