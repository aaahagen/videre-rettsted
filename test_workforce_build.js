const fs = require('fs');
const { execSync } = require('child_process');

try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log("Build successful.");
} catch (e) {
    console.log("Build failed.");
}
