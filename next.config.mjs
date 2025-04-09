/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Keep this or set to false if needed, but it's good practice
    // Add the transpilePackages option here
    transpilePackages: [
        '@mui/joy',
        '@mui/material', // Include if you ever use Material UI components too
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
      ],
  };
  
  export default nextConfig; // Use export default