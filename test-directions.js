const { Client } = require('@googlemaps/google-maps-services-js');
const client = new Client({});

async function test() {
  try {
    const response = await client.directions({
      params: {
        origin: { lat: 59.9139, lng: 10.7522 },
        destination: { lat: 60.3913, lng: 5.3221 },
        waypoints: [],
        optimize: true,
        key: 'INVALID_KEY',
      },
    });
    console.log('Success:', response.data);
  } catch (err) {
    console.error('Error response data:', err.response?.data);
    console.error('Error message:', err.message);
  }
}
test();
