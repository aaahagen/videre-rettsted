const fs = require('fs');
const file = 'src/app/dashboard/places/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import for react-zoom-pan-pinch
content = content.replace(
  /import \{ PrintPlace \} from '@\/components\/places\/print-place';/g,
  `import { PrintPlace } from '@/components/places/print-place';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';`
);

// Replace the image inside the DialogContent with the TransformWrapper
const originalImageContent = `<div className="relative w-full h-[90vh] flex items-center justify-center">
                                      <Image
                                        src={img.url}
                                        alt={img.description || \`Bilde \${index + 1}\`}
                                        fill
                                        className="object-contain"
                                        priority
                                      />
                                      <DialogClose asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-10 w-10 z-50 shadow-lg backdrop-blur-sm"
                                        >
                                          <X className="h-6 w-6" />
                                        </Button>
                                      </DialogClose>
                                    </div>`;

const zoomedImageContent = `<div className="relative w-full h-[90vh] flex items-center justify-center">
                                      <TransformWrapper
                                        initialScale={1}
                                        minScale={1}
                                        maxScale={8}
                                        centerOnInit={true}
                                        wheel={{ step: 0.1 }}
                                      >
                                        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                                          <React.Fragment>
                                            <div className="absolute top-4 left-4 z-50 flex gap-2">
                                              <Button variant="secondary" size="icon" onClick={() => zoomIn()} className="rounded-full shadow-lg h-10 w-10 bg-white/80 hover:bg-white backdrop-blur-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zoom-in h-5 w-5"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
                                              </Button>
                                              <Button variant="secondary" size="icon" onClick={() => zoomOut()} className="rounded-full shadow-lg h-10 w-10 bg-white/80 hover:bg-white backdrop-blur-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zoom-out h-5 w-5"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
                                              </Button>
                                              <Button variant="secondary" size="icon" onClick={() => resetTransform()} className="rounded-full shadow-lg h-10 w-10 bg-white/80 hover:bg-white backdrop-blur-sm" title="Tilbakestill zoom">
                                                 <Maximize2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                                              <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
                                                <Image
                                                  src={img.url}
                                                  alt={img.description || \`Bilde \${index + 1}\`}
                                                  fill
                                                  className="object-contain cursor-grab active:cursor-grabbing"
                                                  priority
                                                />
                                              </div>
                                            </TransformComponent>
                                          </React.Fragment>
                                        )}
                                      </TransformWrapper>
                                      <DialogClose asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-10 w-10 z-50 shadow-lg backdrop-blur-sm"
                                        >
                                          <X className="h-6 w-6" />
                                        </Button>
                                      </DialogClose>
                                    </div>`;

content = content.replace(originalImageContent, zoomedImageContent);

fs.writeFileSync(file, content);
