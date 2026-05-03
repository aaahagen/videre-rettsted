/**
 * Geocoding Utility for VIDERE RettSted
 * Uses Google Maps Geocoding API with a fallback to OpenStreetMap (Nominatim).
 */

export async function geocodeAddress(address: string): Promise<{ lat: number, lng: number } | null> {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!address || address.length < 3) {
        return null;
    }

    // 1. Try Google Maps Geocoding API
    if (apiKey) {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
            );
            
            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                console.log(`Geocoding (Google) Success: "${address}" ->`, location);
                return { 
                    lat: location.lat, 
                    lng: location.lng 
                };
            }
            
            console.warn(`Geocoding (Google) failed: ${data.status}`, data.error_message || '');
        } catch (error) {
            console.error("Geocoding (Google) Network Error:", error);
        }
    }

    // 2. Fallback to OpenStreetMap (Nominatim)
    // Note: Nominatim usage policy requires a User-Agent and limited requests.
    try {
        console.log("Geocoding: Trying OpenStreetMap fallback...");
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'VIDERE-RettSted-App'
                }
            }
        );
        
        const data = await response.json();

        if (data && data.length > 0) {
            const location = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
            console.log(`Geocoding (OSM) Success: "${address}" ->`, location);
            return location;
        }
        
        console.warn(`Geocoding (OSM) found no results for: "${address}"`);
    } catch (error) {
        console.error("Geocoding (OSM) Error:", error);
    }
    
    return null;
}
