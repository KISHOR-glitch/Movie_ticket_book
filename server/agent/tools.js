import Movie from '../models/Movie.js';
import Show from '../models/Show.js';

/**
 * search_movies tool
 * Searches the existing Movie collection by genre and/or title.
 * Uses actual Movie schema fields: genres (Array of {id, name}), title (String)
 *
 * @param {Object} params
 * @param {string} [params.genre]  - Genre name to filter by (case-insensitive)
 * @param {string} [params.title]  - Movie title keyword to search (case-insensitive)
 * @returns {Array} Matching movie documents (id, title, genres, poster_path, vote_average)
 */
export async function searchMovies({ genre, title }) {
    const query = {};

    if (genre) {
        // genres is an Array of objects: [{id: 35, name: "Comedy"}, ...]
        query['genres'] = {
            $elemMatch: { name: { $regex: genre, $options: 'i' } }
        };
    }

    if (title) {
        query['title'] = { $regex: title, $options: 'i' };
    }

    const movies = await Movie.find(query)
        .select('_id title genres poster_path vote_average overview')
        .limit(20);

    return movies.map(m => ({
        movieId: m._id,
        title: m.title,
        genres: m.genres.map(g => g.name),
        poster_path: m.poster_path,
        vote_average: m.vote_average,
        overview: m.overview,
    }));
}

/**
 * search_shows tool
 * Searches the existing Show collection using actual schema fields:
 * movie (String ref), showDateTime (Date), showPrice (Number)
 *
 * @param {Object} params
 * @param {string[]} [params.movieIds]  - Array of movie _id strings to search shows for
 * @param {string}  [params.date]       - "today" | "tomorrow" | "YYYY-MM-DD"
 * @param {string}  [params.minTime]    - Earliest time HH:MM in 24h format (e.g. "19:00")
 * @param {string}  [params.maxTime]    - Latest time HH:MM in 24h format (optional)
 * @param {number}  [params.maxPrice]   - Maximum showPrice per ticket
 * @param {number}  [params.ticketCount] - Number of tickets desired (1 to 5)
 * @returns {Array} Matching shows with embedded movie info and recommendedSeats
 */
export async function searchShows({ movieIds, date, minTime, maxTime, maxPrice, ticketCount, numTickets }) {
    const desiredTickets = ticketCount || numTickets || 1;
    const now = new Date();
    const query = {};

    // Build date range from date param
    const targetDate = resolveDate(date);
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Lower bound: whichever is later — start of day or right now
    const lowerBound = dayStart > now ? dayStart : now;

    // Apply minTime if provided
    let minBound = lowerBound;
    if (minTime) {
        const [h, m] = minTime.split(':').map(Number);
        const minDateTime = new Date(targetDate);
        minDateTime.setHours(h, m, 0, 0);
        minBound = minDateTime > lowerBound ? minDateTime : lowerBound;
    }

    // Apply maxTime if provided
    let maxBound = dayEnd;
    if (maxTime) {
        const [h, m] = maxTime.split(':').map(Number);
        const maxDateTime = new Date(targetDate);
        maxDateTime.setHours(h, m, 0, 0);
        maxBound = maxDateTime < dayEnd ? maxDateTime : dayEnd;
    }

    query.showDateTime = { $gte: minBound, $lte: maxBound };

    // Filter by movie IDs if provided
    if (movieIds && movieIds.length > 0) {
        query.movie = { $in: movieIds };
    }

    // Filter by max price using actual field name: showPrice
    if (maxPrice != null) {
        query.showPrice = { $lte: maxPrice };
    }

    const shows = await Show.find(query)
        .populate('movie', 'title poster_path genres vote_average')
        .sort({ showDateTime: 1 })
        .limit(10);

    const seatCount = Math.min(Math.max(Number(desiredTickets) || 1, 1), 5);

    return shows.map(show => {
        const dt = new Date(show.showDateTime);
        const dateStr = dt.toISOString().split('T')[0]; // YYYY-MM-DD for routing
        const recommendedSeats = getBestSeats(show.occupiedSeats || {}, seatCount);
        return {
            showId: show._id.toString(),
            movieId: show.movie?._id?.toString() || '',
            title: show.movie?.title || 'Unknown',
            poster_path: show.movie?.poster_path || '',
            genres: show.movie?.genres?.map(g => g.name) || [],
            showDateTime: show.showDateTime,
            showDateStr: dateStr,           // used for /movies/:id/:date navigation
            price: show.showPrice,
            availableSeatsCount: 90 - Object.keys(show.occupiedSeats || {}).length,
            recommendedSeats: recommendedSeats,
            ticketCount: seatCount,
        };
    });
}

/**
 * Finds the best contiguous prime seats in middle rows (E, F, D, G, C)
 */
function getBestSeats(occupiedSeats = {}, count = 1) {
    const desiredCount = Math.min(Math.max(Number(count) || 1, 1), 5);
    const rowPriority = ['E', 'F', 'D', 'G', 'C', 'H', 'B', 'I', 'A', 'J'];
    const occupiedSet = new Set(Object.keys(occupiedSeats));

    for (const row of rowPriority) {
        const starts = [];
        const mid = 5;
        for (let offset = 0; offset <= 9 - desiredCount; offset++) {
            const leftStart = mid - Math.floor(desiredCount / 2) - offset;
            const rightStart = mid - Math.floor(desiredCount / 2) + offset;
            if (leftStart >= 1 && leftStart + desiredCount - 1 <= 9 && !starts.includes(leftStart)) starts.push(leftStart);
            if (rightStart >= 1 && rightStart + desiredCount - 1 <= 9 && !starts.includes(rightStart)) starts.push(rightStart);
        }

        for (const start of starts) {
            const candidateSeats = [];
            let allFree = true;
            for (let i = 0; i < desiredCount; i++) {
                const seatId = `${row}${start + i}`;
                if (occupiedSet.has(seatId)) {
                    allFree = false;
                    break;
                }
                candidateSeats.push(seatId);
            }
            if (allFree && candidateSeats.length === desiredCount) {
                return candidateSeats;
            }
        }
    }

    const fallback = [];
    for (const row of rowPriority) {
        for (let col = 1; col <= 9; col++) {
            const seatId = `${row}${col}`;
            if (!occupiedSet.has(seatId)) {
                fallback.push(seatId);
                if (fallback.length === desiredCount) return fallback;
            }
        }
    }
    return fallback;
}

/**
 * Resolves a date string to a JavaScript Date object.
 * Supports "today", "tomorrow", or "YYYY-MM-DD"
 */
function resolveDate(dateStr) {
    const now = new Date();
    if (!dateStr || dateStr === 'today') {
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    if (dateStr === 'tomorrow') {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    }
    // YYYY-MM-DD
    return new Date(dateStr);
}
