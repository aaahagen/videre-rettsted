const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetImage = `<Image src={img.preview || img.url} alt={\`Bilde \${index + 1}\`} fill className="object-cover" />`;
const newImage = `<Image src={img.preview || img.url} alt={\`Bilde \${index + 1}\`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />`;

content = content.replace(targetImage, newImage);
fs.writeFileSync(file, content);
