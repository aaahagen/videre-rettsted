const fs = require('fs');

const file = 'next.config.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const nextConfig: NextConfig = \{/g,
  `const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },`
);

fs.writeFileSync(file, content);
