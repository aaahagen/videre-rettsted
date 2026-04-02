const fs = require('fs');
const path = require('path');

let storageInterfacePath = path.join(__dirname, 'src/lib/storage.ts');
let storageInterfaceCode = fs.readFileSync(storageInterfacePath, 'utf8');

storageInterfaceCode = storageInterfaceCode.replace(
    'uploadFile(path: string, file: File): Promise<string>;',
    'uploadFile(path: string, file: File, metadata?: object): Promise<string>;'
);
fs.writeFileSync(storageInterfacePath, storageInterfaceCode);

let firebaseStoragePath = path.join(__dirname, 'src/lib/firebase/storage.ts');
let firebaseStorageCode = fs.readFileSync(firebaseStoragePath, 'utf8');
firebaseStorageCode = firebaseStorageCode.replace(
    'async uploadFile(path: string, file: File): Promise<string> {',
    'async uploadFile(path: string, file: File, metadata?: object): Promise<string> {'
);
firebaseStorageCode = firebaseStorageCode.replace(
    'await uploadBytes(storageRef, file);',
    'await uploadBytes(storageRef, file, metadata);'
);
fs.writeFileSync(firebaseStoragePath, firebaseStorageCode);

