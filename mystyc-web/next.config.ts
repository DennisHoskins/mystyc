const nextConfig = {
  reactStrictMode: false,
  experimental: {
    allowedDevOrigins: ['https://mystyc.app', 'https://www.mystyc.app']
  },
  async redirects() {
    return [
      {
        source: '/__/auth/action',
        destination: '/action',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;