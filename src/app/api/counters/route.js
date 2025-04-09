// src/app/api/counters/route.js
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Helper Functions (keep as is)
function convertRateToFloat(rateStr) {
    if (!rateStr || rateStr === 'N/A') return 0.0;
    try { return parseFloat(rateStr.replace('%', '').trim()); }
    catch (e) { console.warn(`Rate conversion failed for: ${rateStr}`); return 0.0; }
}

function loadHeroData() {
    try {
        const filePath = path.join(process.cwd(), 'hero_data.json');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContents);
        if (!Array.isArray(data)) return null;
        return data;
    } catch (error) {
        console.error("Error loading hero_data.json for counters:", error);
        return null;
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const heroName = searchParams.get('heroName');

    if (!heroName || typeof heroName !== 'string' || heroName.trim() === '') {
        return NextResponse.json({ error: 'Missing or invalid heroName query parameter' }, { status: 400 });
    }

    const allHeroData = loadHeroData();

    if (!allHeroData) {
        // Error loading data file itself
        return NextResponse.json({ error: 'Failed to load hero data source.' }, { status: 500 });
    }

    const searchNameLower = heroName.trim().toLowerCase();

    // *** ADD THIS CHECK: See if the requested hero exists in the data ***
    const heroExists = allHeroData.some(
        hero => hero && typeof hero.name === 'string' && hero.name.toLowerCase() === searchNameLower
    );

    if (!heroExists) {
        // Return 404 Not Found with the specific message
        return NextResponse.json({ error: "ไม่พบข้อมูลของฮีโร่" }, { status: 404 });
    }
    // *** END OF CHECK ***

    // If hero exists, proceed to find counters
    let heroesThatCounter = [];
    for (const heroEntry of allHeroData) {
         if (
            heroEntry && typeof heroEntry === 'object' &&
            heroEntry.name && heroEntry.type && heroEntry.win_rate && heroEntry.image &&
            Array.isArray(heroEntry.countered_heroes)
        ) {
            let foundMatch = false;
            for (const nameInList of heroEntry.countered_heroes) {
                // Compare against the list of countered heroes (case-insensitive)
                if (typeof nameInList === 'string' && nameInList.toLowerCase() === searchNameLower) {
                    foundMatch = true;
                    break;
                }
            }
            if (foundMatch) {
                // Add the hero that *does* the countering
                heroesThatCounter.push({
                    name: heroEntry.name,
                    type: heroEntry.type,
                    win_rate: heroEntry.win_rate,
                    image: heroEntry.image
                });
            }
        }
    }

    // Sort the results (will be empty array if no counters found for an existing hero)
    const sortedResults = heroesThatCounter.sort((a, b) => {
        return convertRateToFloat(b.win_rate) - convertRateToFloat(a.win_rate);
    });

    // Return 200 OK with results (potentially empty array)
    return NextResponse.json(sortedResults, { status: 200 });
}