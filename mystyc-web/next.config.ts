const nextConfig = {
 reactStrictMode: false,
 allowedDevOrigins: ['mystyc.app', '127.0.0.1:3000'],
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
