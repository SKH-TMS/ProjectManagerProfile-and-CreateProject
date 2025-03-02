import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define mongodb uri in env file");
}

// Define a global mongoose cache object to avoid reinitialization
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

// Attach cache to the global object
declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export async function connectToDatabase(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10, // Fixed the incorrect property name
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => mongoose.connection);
  }

  try {
    cached.conn = await cached.promise;
    console.log("Connected to MongoDB");
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection error:", error);
    throw error;
  }

  return cached.conn;
}
