/**
 * Geocoding Utility for VIDERE RettSted
 * Uses Google Maps Geocoding API with a fallback to OpenStreetMap (Nominatim).
 */

export async function geocodeAddress(address: string): Promise<{ lat: number, lng: number } | null> {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!address || address.length < 3) {
        return null;
    }

    // 1. Try Google Maps Geocoding API (Direct Fetch)
    // NOTE: Direct fetch might fail if the API key has Referrer restrictions.
    // In that case, it falls back to OSM.
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
            
            if (data.status === 'REQUEST_DENIED') {
                // Suppress error in console to avoid clutter if fallback is intended
                console.warn("Geocoding (Google) Denied: Likely due to API Key Referrer restrictions. Falling back to OpenStreetMap...");
            } else if (data.status === 'OVER_QUERY_LIMIT') {
                console.warn("Geocoding (Google) Limit Exceeded. Falling back to OpenStreetMap...");
            } else if (data.status !== 'ZERO_RESULTS') {
                console.warn(`Geocoding (Google) status: ${data.status}. Falling back to OpenStreetMap...`);
            }
        } catch (error) {
            console.warn("Geocoding (Google) Network Error. Falling back to OpenStreetMap...");
        }
    }

    // 2. Fallback to OpenStreetMap (Nominatim)
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'VIDERE-RettSted-App (contact@videre.no)'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`OSM Geocoding failed with status: ${response.status}`);
        }

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
