// src/app/api/heronames/route.js
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

function loadHeroData() {
    try {
        const filePath = path.join(process.cwd(), 'hero_data.json');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContents);
        if (!Array.isArray(data)) return null;
        return data;
    } catch (error) {
        console.error("Error loading hero_data.json for names:", error);
        return null;
    }
}

export async function GET() {
    const allHeroData = loadHeroData();

    if (!allHeroData) {
        return NextResponse.json({ error: 'Failed to load hero data.' }, { status: 500 });
    }

    // Extract name and image, filtering out invalid entries
    const heroInfo = allHeroData
        .map(hero => (hero && hero.name && hero.image) ? { name: hero.name, image: hero.image } : null)
        .filter(Boolean); // Remove any null entries

    // Optional: Sort names alphabetically
    heroInfo.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(heroInfo, { status: 200 }); // Return array of objects
}