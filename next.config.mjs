/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URI: process.env.API_URI,
    NEXT_PUBLIC_AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  },
  transpilePackages: ['react-latex-next'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "declare-models.s3.eu-north-1.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "declare-models.s3.amazonaws.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
