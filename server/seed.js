import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "./models/Movie.js";
import Show from "./models/Show.js";

dotenv.config();

const sampleMovies = [
  {
    _id: "550",
    title: "Fight Club",
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    release_date: "1999-10-15",
    original_language: "en",
    tagline: "Mischief. Mayhem. Soap.",
    genres: [{ id: 18, name: "Drama" }, { id: 53, name: "Thriller" }],
    casts: [
      { name: "Brad Pitt", character: "Tyler Durden", profile_path: "/cckcYc2v0yh1tc9QjRelptsqRJ4.jpg" },
      { name: "Edward Norton", character: "The Narrator", profile_path: "/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg" },
      { name: "Helena Bonham Carter", character: "Marla Singer", profile_path: "/DDeItnRqwAY8Ki1zQYmffMlhgT.jpg" }
    ],
    vote_average: 8.4,
    runtime: 139
  },
  {
    _id: "27205",
    title: "Inception",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: 'inception'.",
    poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    release_date: "2010-07-16",
    original_language: "en",
    tagline: "Your mind is the scene of the crime.",
    genres: [{ id: 28, name: "Action" }, { id: 878, name: "Science Fiction" }, { id: 12, name: "Adventure" }],
    casts: [
      { name: "Leonardo DiCaprio", character: "Dom Cobb", profile_path: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg" },
      { name: "Joseph Gordon-Levitt", character: "Arthur", profile_path: "/4PCOl9a044z5nL8eGqJ41h2q3X9.jpg" },
      { name: "Elliot Page", character: "Ariadne", profile_path: "/tp1eozWk9T0vS6FzHq7n9Lp3k8.jpg" }
    ],
    vote_average: 8.4,
    runtime: 148
  },
  {
    _id: "157336",
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    release_date: "2014-11-07",
    original_language: "en",
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    genres: [{ id: 12, name: "Adventure" }, { id: 18, name: "Drama" }, { id: 878, name: "Science Fiction" }],
    casts: [
      { name: "Matthew McConaughey", character: "Cooper", profile_path: "/e9Z2Vtwg74qO9zYl8eGqJ41h2q3.jpg" },
      { name: "Anne Hathaway", character: "Brand", profile_path: "/tLpq59apbtmh0B9utCFdsQhxM.jpg" },
      { name: "Jessica Chastain", character: "Murph", profile_path: "/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg" }
    ],
    vote_average: 8.4,
    runtime: 169
  },
  {
    _id: "155",
    title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime. With the help of allies Lt. Jim Gordon and DA Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    release_date: "2008-07-18",
    original_language: "en",
    tagline: "Welcome to a world without rules.",
    genres: [{ id: 18, name: "Drama" }, { id: 28, name: "Action" }, { id: 80, name: "Crime" }, { id: 53, name: "Thriller" }],
    casts: [
      { name: "Christian Bale", character: "Bruce Wayne / Batman", profile_path: "/b7fTC9WFkgqGOv771QIezE5.jpg" },
      { name: "Heath Ledger", character: "Joker", profile_path: "/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg" },
      { name: "Aaron Eckhart", character: "Harvey Dent / Two-Face", profile_path: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg" }
    ],
    vote_average: 8.5,
    runtime: 152
  },
  {
    _id: "1022789",
    title: "Inside Out 2",
    overview: "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust aren't sure how to feel when Anxiety shows up.",
    poster_path: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    backdrop_path: "/xg27NrXi7EgCGUrKVzYzvt9cSU.jpg",
    release_date: "2024-06-14",
    original_language: "en",
    tagline: "Make room for new emotions.",
    genres: [{ id: 16, name: "Animation" }, { id: 10751, name: "Family" }, { id: 35, name: "Comedy" }, { id: 12, name: "Adventure" }],
    casts: [
      { name: "Amy Poehler", character: "Joy (voice)", profile_path: "/b7fTC9WFkgqGOv771QIezE5.jpg" },
      { name: "Maya Hawke", character: "Anxiety (voice)", profile_path: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg" },
      { name: "Kensington Tallman", character: "Riley Andersen (voice)", profile_path: "/5XBzD5WuTyVQZeS4VI25z2moMeY.jpg" }
    ],
    vote_average: 7.6,
    runtime: 96
  }
];

async function seedData() {
  try {
    const mongoUri = process.env.MONGODB_URI ? `${process.env.MONGODB_URI}/quickshow` : "mongodb://127.0.0.1:27017/quickshow";
    console.log("Connecting to MongoDB:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected for seeding");

    await Movie.deleteMany({});
    await Show.deleteMany({});

    console.log("Cleared existing movies and shows");

    await Movie.insertMany(sampleMovies);
    console.log(`Inserted ${sampleMovies.length} movies.`);

    const shows = [];
    const showTimes = ["10:00:00", "13:30:00", "16:45:00", "19:30:00", "22:15:00"];
    const prices = [120, 150, 200, 250, 300];

    // Create upcoming shows for the next 7 days
    const today = new Date();
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const showDate = new Date(today);
      showDate.setDate(today.getDate() + dayOffset);
      const dateStr = showDate.toISOString().split("T")[0];

      sampleMovies.forEach((movie, mIdx) => {
        showTimes.slice(0, 3 + (mIdx % 3)).forEach((timeStr, tIdx) => {
          const dateTime = new Date(`${dateStr}T${timeStr}`);
          shows.push({
            movie: movie._id,
            showDateTime: dateTime,
            showPrice: prices[(mIdx + tIdx) % prices.length],
            occupiedSeats: {}
          });
        });
      });
    }

    await Show.insertMany(shows);
    console.log(`Inserted ${shows.length} upcoming shows.`);

    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedData();
