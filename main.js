/**
 * @file main.js
 * @description ศูนย์กลางการเรียกใช้งานระบบทั้งหมด (Search & Database)
 */

import { searchFiles } from './grepUtility.js';
import { safeInsertLotto } from './supabaseClient.js';

async function run() {
    const mode = process.argv[2];

    if (mode === 'search') {
        const term = process.argv[3] || 'dark:';
        await searchFiles(term, './src');
    }
    else if (mode === 'insert') {
        const ticket = {
            ticketNumber: '123456',
            amount: 1,
            purchaseDate: new Date().toISOString()
        };
        console.log('Attempting to insert test data...');
        const response = await safeInsertLotto(ticket);
        console.log('Response:', response);
    }
    else {
        console.log(`
ใช้งานอย่างไร:
  node main.js search [keyword]  - เพื่อค้นหาข้อความในโปรเจกต์
  node main.js insert           - เพื่อทดสอบการบันทึกข้อมูลล็อตเตอรี่
        `);
    }
}

run().catch(console.error);