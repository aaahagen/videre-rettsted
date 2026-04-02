const fs = require('fs');
const file = 'src/components/fleet/vehicle-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update images state to handle isMain
const targetImagesState = `    const [images, setImages] = useState<Array<{ url: string, preview?: string, file?: File }>>(
        initialData?.images || []
    );`;

const newImagesState = `    const [images, setImages] = useState<Array<{ url: string, preview?: string, file?: File, isMain?: boolean }>>(
        initialData?.images || []
    );`;

content = content.replace(targetImagesState, newImagesState);

// 2. Function to set main image
const targetAddCustomField = `    const handleAddCustomField = () => {`;
const newSetMainImage = `    const setMainImage = (index: number) => {
        setImages(prev => prev.map((img, i) => ({ ...img, isMain: i === index })));
    };

    const handleAddCustomField = () => {`;

content = content.replace(targetAddCustomField, newSetMainImage);

// 3. Keep isMain flag in submit
const targetFinalImages = `            const finalImages = [];
            for (const img of images) {
                if (img.file) {
                    const ext = img.file.name.split('.').pop() || 'jpg';
                    const vehicleIdFolder = initialData?.id || \`temp_\${uuidv4()}\`;
                    const path = \`vehicles/\${vehicleIdFolder}/\${uuidv4()}.\${ext}\`;
                    const url = await firebaseStorage.uploadFile(path, img.file);
                    finalImages.push({ url });
                } else {
                    finalImages.push({ url: img.url });
                }
            }`;

const newFinalImages = `            const finalImages = [];
            for (const img of images) {
                if (img.file) {
                    const ext = img.file.name.split('.').pop() || 'jpg';
                    const vehicleIdFolder = initialData?.id || \`temp_\${uuidv4()}\`;
                    const path = \`vehicles/\${vehicleIdFolder}/\${uuidv4()}.\${ext}\`;
                    const url = await firebaseStorage.uploadFile(path, img.file);
                    finalImages.push({ url, isMain: img.isMain });
                } else {
                    finalImages.push({ url: img.url, isMain: img.isMain });
                }
            }`;

content = content.replace(targetFinalImages, newFinalImages);

// 4. UI for selecting main image
const targetImageUI = `                        {images.map((img, index) => (
                            <div key={index} className="relative group rounded-md overflow-hidden border bg-white">
                                <div className="relative aspect-square w-full">
                                    <Image src={img.preview || img.url} alt={\`Bilde \${index + 1}\`} fill className="object-cover" />
                                </div>
                                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}`;

const newImageUI = `                        {images.map((img, index) => (
                            <div key={index} className={\`relative group rounded-md overflow-hidden border \${img.isMain ? 'border-primary ring-2 ring-primary ring-offset-1' : 'border-slate-200'} bg-white\`}>
                                <div className="relative aspect-square w-full">
                                    <Image src={img.preview || img.url} alt={\`Bilde \${index + 1}\`} fill className="object-cover" />
                                    {img.isMain && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[10px] font-bold text-center py-1 uppercase tracking-wider">
                                            Hovedbilde
                                        </div>
                                    )}
                                </div>
                                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button type="button" variant="destructive" size="icon" className="h-6 w-6" onClick={() => removeImage(index)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                    {!img.isMain && (
                                        <Button type="button" variant="secondary" size="icon" className="h-6 w-6 bg-white hover:bg-slate-100 text-slate-700" onClick={() => setMainImage(index)} title="Sett som hovedbilde">
                                            <Star className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}`;

content = content.replace(targetImageUI, newImageUI);

fs.writeFileSync(file, content);
