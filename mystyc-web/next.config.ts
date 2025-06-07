const nextConfig = {
 reactStrictMode: false,
 allowedDevOrigins: ['mystyc.app', 'www.mystyc.app', 'mystyc-client.loca.lt'],
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