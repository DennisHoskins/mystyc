const nextConfig = {
 reactStrictMode: false,
 experimental: {
   allowedDevOrigins: ['mystyc.app', 'www.mystyc.app']
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