const fs = require('fs');
const file = 'src/app/dashboard/places/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldIframe = `<iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={apiKey ? embedUrl : fallbackEmbedUrl}
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Google Maps"
                      ></iframe>`;

const newIframe = `{apiKey ? (
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={embedUrl}
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Google Maps"
                        ></iframe>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                            <Map className="h-10 w-10 text-slate-400 mb-2" />
                            <p className="text-slate-500 font-medium">Forhåndsvisning av kart er ikke tilgjengelig</p>
                            <p className="text-slate-400 text-sm mt-1">Bruk knappen under for å åpne i Google Maps</p>
                        </div>
                      )}`;

if (content.includes(oldIframe)) {
    content = content.replace(oldIframe, newIframe);
    fs.writeFileSync(file, content);
    console.log('patched');
} else {
    console.log('not found');
}
