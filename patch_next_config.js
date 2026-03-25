const fs = require('fs');
const file = 'next.config.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const nextConfig: NextConfig = \{/g,
  `const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },`
);

fs.writeFileSync(file, content);
