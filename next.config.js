/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: "/",
          destination: "/home",
          permanent: true, // Redirección permanente (301)
        },
      ];
    },
    reactStrictMode: true,
    // async rewrites() {
    //   const backendUrl = process.env.API_BASE_URL;
    //   return [
    //     {
    //       source: "/api/:path*",
    //       destination: `${backendUrl}/:path*`,
    //     },
    //   ];š
    // },
    images: {
      // domains: ["127.0.0.1"],
    },
  };
  
  module.exports = nextConfig;
  