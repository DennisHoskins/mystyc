const nextConfig = {
  reactStrictMode: false,
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
