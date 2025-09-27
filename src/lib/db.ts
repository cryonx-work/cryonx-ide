import mongoose from "mongoose";

// src/lib/db.ts

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

declare global {
    var _mongooseCache: MongooseCache | undefined;
}

const cache = global._mongooseCache ?? (global._mongooseCache = { conn: null, promise: null });

/**
 * Connect to MongoDB using mongoose. Uses a global cache so that
 * during hot-reloads (Next.js dev) we don't create multiple connections.
 */
export default async function connectDB(): Promise<typeof mongoose> {
    if (cache.conn) {
        return cache.conn;
    }

    if (!cache.promise) {
        cache.promise = mongoose.connect(MONGODB_URI!).then((m) => m);
    }

    cache.conn = await cache.promise;
    return cache.conn;
}