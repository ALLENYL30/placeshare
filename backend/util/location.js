const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = `${process.env.GOOGLE_MAPS_API_KEY}`;

async function getCoordsForAddress(address) {
  console.log(`Attempting to get coordinates for address: ${address}`);

  try {
    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
        )}&key=${API_KEY}`
    );

    const data = response.data;

    if (!data || data.status === 'ZERO_RESULTS') {
      console.log('No results found for the given address');
      throw new HttpError(
          'Could not find location for the specified address.',
          422
      );
    }

    if (data.status !== 'OK') {
      console.error(`Google Maps API returned status: ${data.status}`);
      throw new HttpError('Failed to fetch coordinates from Google Maps API.', 500);
    }

    const coordinates = data.results[0].geometry.location;
    console.log(`Coordinates found: ${JSON.stringify(coordinates)}`);

    return coordinates;
  } catch (error) {
    console.error('Error in getCoordsForAddress:', error.message);
    if (error instanceof HttpError) {
      throw error;
    }
    if (error.response) {
      console.error('Google API error response:', error.response.data);
    }
    throw new HttpError('Failed to fetch coordinates. Please try again.', 500);
  }
}

module.exports = getCoordsForAddress;