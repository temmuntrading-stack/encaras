-- lib/schema.sql
DROP TABLE IF EXISTS cars;
CREATE TABLE cars (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    year TEXT,
    mileage TEXT,
    fuel TEXT,
    transmission TEXT,
    color TEXT,
    price_krw INTEGER,
    image_urls TEXT, -- JSON array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
