const nextConfig = {
  reactStrictMode: false,
  experimental: {
    logging: {
      level: 'verbose'
    }
  },
  allowedDevOrigins: ['mystyc.app', '127.0.0.1:3000'],
  transpilePackages: ['mystyc-common'],
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