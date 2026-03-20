import { db } from '../lib/db';
import { contacts } from '../lib/db/schema';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function listContacts() {
    console.log('Fetching contacts...');
    try {
        const allContacts = await db.select().from(contacts).limit(10);
        console.table(allContacts.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone
        })));
    } catch (error) {
        console.error('Error fetching contacts:', error);
    }
}

listContacts();
