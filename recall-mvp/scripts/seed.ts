/**
 * Database Seed Script
 * Seeds demo users and sample chapters for local development
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, sessions, chapters } from '../lib/infrastructure/adapters/db/schema';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/recall_mvp';

async function seed() {
    console.log('🌱 Starting database seed...');

    const client = postgres(DATABASE_URL);
    const db = drizzle(client);

    try {
        // Create demo Senior user
        const [seniorUser] = await db.insert(users).values({
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Arthur Pendelton',
            email: 'arthur@evermore.dev',
            role: 'senior',
            phoneNumber: '+1234567890',
            preferences: {
                // Conversation Preferences
                voiceTone: 'Warm',
                topicsLove: ['Childhood', 'Family vacations', 'Career milestones', 'Gardening', 'Classic cars'],
                topicsAvoid: ['Politics', 'Health concerns'],
                timezone: 'America/New_York',

                // Biographical Information (for AI context)
                birthYear: 1945,
                gender: 'male',
                location: 'Boston, Massachusetts',
                formerOccupation: 'History Teacher',
                aboutMe: 'A retired history teacher with a passion for gardening and classic films. Father of three, grandfather of five.',

                // Family Information
                spouseName: 'Mary',
                childrenCount: 3,
                grandchildrenCount: 5,

                // Memory Context
                favoriteDecade: '1960s',
                significantEvents: ['Moon Landing', 'Woodstock', 'Civil Rights Movement']
            }
        }).onConflictDoNothing().returning();

        console.log('✅ Created senior user:', seniorUser?.name || 'Already exists');

        // Create demo Family user
        const [familyUser] = await db.insert(users).values({
            id: '00000000-0000-0000-0000-000000000002',
            name: 'Emma',
            email: 'emma@evermore.dev',
            role: 'family',
            seniorId: '00000000-0000-0000-0000-000000000001',
            phoneNumber: '+1234567891',
            preferences: {
                timezone: 'America/New_York'
            }
        }).onConflictDoNothing().returning();

        console.log('✅ Created family user:', familyUser?.name || 'Already exists');

        // Create demo session
        const [demoSession] = await db.insert(sessions).values({
            id: '00000000-0000-0000-0000-000000000010',
            userId: '00000000-0000-0000-0000-000000000001',
            status: 'completed',
            duration: 1200,
            startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 1200000),
            transcriptRaw: JSON.stringify([
                { role: 'assistant', content: 'Tell me about your favorite holiday tradition.' },
                { role: 'user', content: 'Every Christmas Eve, our family would gather around the fireplace...' }
            ])
        }).onConflictDoNothing().returning();

        console.log('✅ Created demo session:', demoSession?.id || 'Already exists');

        // Create demo chapters/stories
        const demoChapters = [
            {
                id: '00000000-0000-0000-0000-000000000100',
                sessionId: '00000000-0000-0000-0000-000000000010',
                userId: '00000000-0000-0000-0000-000000000001',
                title: 'Christmas Eve Traditions',
                content: `Every Christmas Eve, our family would gather around the fireplace in my grandparents' old farmhouse. The smell of pine needles mixed with grandma's famous apple cider created an atmosphere I can still recall vividly today.\n\nMy grandfather would always wait until the clock struck seven before he'd ceremoniously light the Yule log. "It's not Christmas until the log burns," he'd say with a twinkle in his eye.\n\nThe children—my siblings, cousins, and I—would huddle together on the worn carpet, close enough to feel the fire's warmth on our faces. Grandma would bring out her ancient copy of "A Christmas Carol" and grandpa would read by candlelight, his deep voice bringing Scrooge and Tiny Tim to life.`,
                excerpt: 'Every Christmas Eve, our family would gather around the fireplace in my grandparents old farmhouse...',
                entities: [
                    { type: 'person', name: 'Grandfather', mentions: 2 },
                    { type: 'person', name: 'Grandmother', mentions: 2 },
                    { type: 'topic', name: 'Christmas', mentions: 4 },
                    { type: 'place', name: 'Farmhouse', mentions: 1 }
                ],
                metadata: {
                    sessionNumber: 1,
                    wordCount: 150,
                    emotionalTone: 'nostalgic',
                    lifePeriod: 'childhood'
                }
            },
            {
                id: '00000000-0000-0000-0000-000000000101',
                sessionId: '00000000-0000-0000-0000-000000000010',
                userId: '00000000-0000-0000-0000-000000000001',
                title: 'Summer at the Lake House',
                content: `The summer of 1965 was special. Our family rented a small cabin by Lake Michigan for the entire month of July. It was the first real vacation I remember—and perhaps the most formative.\n\nEvery morning, my father and I would wake before dawn to go fishing. The mist would hang low over the water, and we'd sit in companionable silence, waiting for the fish to bite. Those quiet moments taught me patience and the value of simply being present.\n\nAfternoons were for swimming and exploring the woods behind the cabin. My sister and I built a secret fort from fallen branches, convinced we were the first to discover that spot.`,
                excerpt: 'The summer of 1965 was special. Our family rented a small cabin by Lake Michigan...',
                entities: [
                    { type: 'person', name: 'Father', mentions: 1 },
                    { type: 'person', name: 'Sister', mentions: 1 },
                    { type: 'place', name: 'Lake Michigan', mentions: 1 },
                    { type: 'topic', name: 'Fishing', mentions: 1 }
                ],
                metadata: {
                    sessionNumber: 2,
                    wordCount: 140,
                    emotionalTone: 'joyful',
                    lifePeriod: 'childhood'
                }
            },
            {
                id: '00000000-0000-0000-0000-000000000102',
                sessionId: '00000000-0000-0000-0000-000000000010',
                userId: '00000000-0000-0000-0000-000000000001',
                title: 'First Day at the Factory',
                content: `I was eighteen when I walked through those heavy iron gates for the first time. The Ford assembly plant loomed before me, a cathedral of industry that would shape the next forty years of my life.\n\nThe foreman, a grizzled man named Joe Kowalski, took one look at my eager face and shook his head. "You'll learn," he said. And learn I did—about work, about life, about what it means to be part of something bigger than yourself.\n\nThat first day, I made three mistakes that I remember to this day. But Mr. Kowalski never raised his voice. He just showed me the right way, again and again, until I got it.`,
                excerpt: 'I was eighteen when I walked through those heavy iron gates for the first time...',
                entities: [
                    { type: 'person', name: 'Joe Kowalski', mentions: 2 },
                    { type: 'place', name: 'Ford Plant', mentions: 1 },
                    { type: 'topic', name: 'Career', mentions: 1 }
                ],
                metadata: {
                    sessionNumber: 3,
                    wordCount: 135,
                    emotionalTone: 'reflective',
                    lifePeriod: 'young adult'
                }
            }
        ] as any[];

        for (const chapter of demoChapters) {
            await db.insert(chapters).values(chapter).onConflictDoNothing();
        }

        console.log('✅ Created', demoChapters.length, 'demo chapters');
        console.log('🎉 Database seeding complete!');

    } catch (error) {
        console.error('❌ Seed error:', error);
        throw error;
    } finally {
        await client.end();
    }
}

seed().catch((err) => {
    console.error('Failed to seed database:', err);
    process.exit(1);
});
