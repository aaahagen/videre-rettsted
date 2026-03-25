const fs = require('fs');
const file = 'src/lib/data.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /createdAt: new Date\('2023-10-25T14:30:00Z'\),/g,
  `createdAt: new Date('2023-10-25T14:30:00Z'),
    updatedAt: new Date('2023-10-25T14:30:00Z'),`
);
content = content.replace(
  /createdAt: new Date\('2023-10-26T09:15:00Z'\),/g,
  `createdAt: new Date('2023-10-26T09:15:00Z'),
    updatedAt: new Date('2023-10-26T09:15:00Z'),`
);
content = content.replace(
  /createdAt: new Date\('2023-10-24T16:45:00Z'\),/g,
  `createdAt: new Date('2023-10-24T16:45:00Z'),
    updatedAt: new Date('2023-10-24T16:45:00Z'),`
);
content = content.replace(
  /createdAt: new Date\('2023-10-27T11:20:00Z'\),/g,
  `createdAt: new Date('2023-10-27T11:20:00Z'),
    updatedAt: new Date('2023-10-27T11:20:00Z'),`
);
content = content.replace(
  /createdAt: new Date\('2023-10-26T14:00:00Z'\),/g,
  `createdAt: new Date('2023-10-26T14:00:00Z'),
    updatedAt: new Date('2023-10-26T14:00:00Z'),`
);
content = content.replace(
  /createdAt: new Date\('2023-10-28T08:30:00Z'\),/g,
  `createdAt: new Date('2023-10-28T08:30:00Z'),
    updatedAt: new Date('2023-10-28T08:30:00Z'),`
);

content = content.replace(
  /        place.hashtags.some\(tag => tag.toLowerCase\(\).includes\(query.toLowerCase\(\)\)\)/g,
  `        place.hashtags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))`
);

content = content.replace(
  /      return b.createdAt.getTime\(\) - a.createdAt.getTime\(\);/g,
  `      const timeA = (a.createdAt as Date).getTime ? (a.createdAt as Date).getTime() : 0;
      const timeB = (b.createdAt as Date).getTime ? (b.createdAt as Date).getTime() : 0;
      return timeB - timeA;`
);

fs.writeFileSync(file, content);
