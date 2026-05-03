/**
 * Geocoding Utility for VIDERE RettSted
 * Uses Google Maps Geocoding API to convert written addresses to Lat/Lng coordinates.
 */

export async function geocodeAddress(address: string): Promise<{ lat: number, lng: number } | null> {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!apiKey) {
        console.error("Geocoding Error: No API Key found in environment variables (NEXT_PUBLIC_FIREBASE_API_KEY).");
        return null;
    }

    if (!address || address.length < 5) {
        return null;
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
        );
        
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            console.log(`Geocoding Success: "${address}" ->`, location);
            return { 
                lat: location.lat, 
                lng: location.lng 
            };
        }
        
        if (data.status === 'ZERO_RESULTS') {
            console.warn(`Geocoding: No results found for address "${address}".`);
        } else {
            console.error(`Geocoding API Error: ${data.status}`, data.error_message || '');
        }
        
        return null;
    } catch (error) {
        console.error("Geocoding Network Error:", error);
        return null;
    }
}
