import type { NextConfig } from 'next';

// Note, need latest Canary for PPR

const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   ppr: 'incremental',
  // },
  eslint: {
    ignoreDuringBuilds: true,
},
};

export default nextConfig;
