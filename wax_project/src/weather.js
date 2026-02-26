// === Weather Module (Proxy through Backend) ===

let cachedWeather = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function getWeather(city = 'Yuzhno-Sakhalinsk') {
    const now = Date.now();
    if (cachedWeather && (now - cacheTime) < CACHE_DURATION) {
        return cachedWeather;
    }

    try {
        console.log('Fetching weather proxy for:', city);
        // Using relative path to use Nginx proxy to backend
        const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        if (!res.ok) throw new Error('Weather Proxy error: ' + res.status);
        const data = await res.json();
        
        const current = data.current_condition?.[0];
        if (!current) throw new Error('No weather data in response');

        const code = parseInt(current.weatherCode);

        cachedWeather = {
            temp: parseInt(current.temp_C),
            feelsLike: parseInt(current.FeelsLikeC),
            humidity: parseInt(current.humidity),
            weatherCode: code,
            description: current.lang_ru?.[0]?.value || current.weatherDesc?.[0]?.value || '',
            icon: getWeatherIcon(code),
            isBadWeather: checkBadWeather(code),
        };
        cacheTime = now;
        return cachedWeather;
    } catch (e) {
        console.error('Weather Proxy Fetch Error:', e);
        // Return a valid object but with nulls so the UI knows there's no data
        return {
            temp: null,
            feelsLike: null,
            humidity: null,
            weatherCode: 0,
            description: 'Сервис временно недоступен',
            icon: '🌤️',
            isBadWeather: false,
        };
    }
}

function checkBadWeather(code) {
    const badCodes = [
        176, 179, 182, 185, 200, 227, 230, 248, 260,
        263, 266, 281, 284, 293, 296, 299, 302, 305, 308,
        311, 314, 317, 320, 323, 326, 329, 332, 335, 338,
        350, 353, 356, 359, 362, 365, 368, 371, 374, 377,
        386, 389, 392, 395
    ];
    return badCodes.includes(code);
}

function getWeatherIcon(code) {
    if (code === 113) return '☀️';
    if (code === 116) return '⛅';
    if (code === 119 || code === 122) return '☁️';
    if ([143, 248, 260].includes(code)) return '🌫️';
    if ([176, 263, 266, 293, 296].includes(code)) return '🌦️';
    if ([299, 302, 305, 308, 353, 356, 359].includes(code)) return '🌧️';
    if ([179, 182, 185, 227, 230, 323, 326, 329, 332, 335, 338, 368, 371].includes(code)) return '🌨️';
    if ([200, 386, 389, 392, 395].includes(code)) return '⛈️';
    return '🌤️';
}

export async function getBonusCashbackMultiplier(isBadWeather) {
    return isBadWeather ? 2 : 1; 
}
