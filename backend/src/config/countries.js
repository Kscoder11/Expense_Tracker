// Pre-defined country list for instant loading
const TOP_COUNTRIES = [
  { name: 'United States', currency: 'USD' },
  { name: 'United Kingdom', currency: 'GBP' },
  { name: 'Canada', currency: 'CAD' },
  { name: 'Australia', currency: 'AUD' },
  { name: 'Germany', currency: 'EUR' },
  { name: 'France', currency: 'EUR' },
  { name: 'India', currency: 'INR' },
  { name: 'Japan', currency: 'JPY' },
  { name: 'China', currency: 'CNY' },
  { name: 'Brazil', currency: 'BRL' },
  { name: 'Mexico', currency: 'MXN' },
  { name: 'South Africa', currency: 'ZAR' },
  { name: 'Singapore', currency: 'SGD' },
  { name: 'Netherlands', currency: 'EUR' },
  { name: 'Switzerland', currency: 'CHF' },
  { name: 'Sweden', currency: 'SEK' },
  { name: 'Norway', currency: 'NOK' },
  { name: 'Denmark', currency: 'DKK' },
  { name: 'New Zealand', currency: 'NZD' },
  { name: 'South Korea', currency: 'KRW' }
];

// Cache for full country list
let fullCountriesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class CountryService {
  // Get top countries instantly
  getTopCountries() {
    return TOP_COUNTRIES.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get cached full list or fetch if needed
  async getFullCountries() {
    // Return cached data if available and fresh
    if (fullCountriesCache && cacheTimestamp && 
        (Date.now() - cacheTimestamp < CACHE_DURATION)) {
      return fullCountriesCache;
    }

    try {
      const axios = require('axios');
      const response = await axios.get(
        'https://restcountries.com/v3.1/all?fields=name,currencies',
        { timeout: 3000 } // 3 second timeout
      );
      
      const countries = response.data
        .map(country => ({
          name: country.name.common,
          currency: country.currencies ? Object.keys(country.currencies)[0] : 'USD'
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Update cache
      fullCountriesCache = countries;
      cacheTimestamp = Date.now();
      
      return countries;
    } catch (error) {
      console.warn('Failed to fetch full countries list, using top countries:', error.message);
      // Fallback to top countries if API fails
      return this.getTopCountries();
    }
  }

  // Get currency for a specific country
  getCurrencyForCountry(countryName) {
    // Check top countries first (instant)
    const topCountry = TOP_COUNTRIES.find(c => c.name === countryName);
    if (topCountry) return topCountry.currency;

    // Check full cache if available
    if (fullCountriesCache) {
      const country = fullCountriesCache.find(c => c.name === countryName);
      if (country) return country.currency;
    }

    // Default fallback
    return 'USD';
  }
}

module.exports = new CountryService();