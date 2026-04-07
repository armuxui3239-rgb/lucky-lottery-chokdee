/**
 * @file grepUtility.js
 * @description A high-performance, Node.js native implementation of recursive grep.
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * ค้นหาข้อความในไฟล์แบบ Recursive (เหมือน grep -rnw)
 * @param {string} pattern - ข้อความที่ต้องการค้นหา
 * @param {string} directory - โฟลเดอร์เริ่มต้น
 */
export async function searchFiles(pattern, directory) {
    let matchCount = 0;
    // สร้าง Regex สำหรับ "Whole Word" (-w)
    // ใช้ \b (word boundary) หรือตรวจสอบว่าไม่มีตัวอักษรต่อท้าย
    const regex = new RegExp(`(?<!\\w)${pattern}(?!\\w)`, 'g');

    async function walk(dir) {
        let files = await fs.readdir(dir);

        // ข้าม node_modules เพื่อความรวดเร็ว
        files = files.filter(file => file !== 'node_modules' && !file.startsWith('.'));

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stats = await fs.stat(fullPath);

            if (stats.isDirectory()) {
                await walk(fullPath);
            } else if (stats.isFile()) {
                try {
                    const content = await fs.readFile(fullPath, 'utf8');
                    const lines = content.split('\n');

                    lines.forEach((line, index) => {
                        if (regex.test(line)) {
                            matchCount++;
                            // แสดงผลลัพธ์ในรูปแบบ filename:line_number: content (-n)
                            console.log(`\x1b[35m${fullPath}\x1b[0m:\x1b[32m${index + 1}\x1b[0m: ${line.trim()}`);
                        }
                        // Reset regex state เนื่องจากใช้ flag 'g'
                        regex.lastIndex = 0;
                    });
                } catch (err) {
                    // ข้ามไฟล์ที่อ่านไม่ได้ (เช่น ไฟล์ binary)
                }
            }
        }
    }

    console.log(`Searching for "${pattern}" in ${directory}...`);
    await walk(directory);
    console.log(`\nSearch completed. Found ${matchCount} matches.`);
}

// รันเฉพาะเมื่อรันไฟล์นี้โดยตรง
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
    const pattern = process.argv[2] || 'dark:';
    const targetDir = process.argv[3] || './src';
    searchFiles(pattern, targetDir).catch(err => {
        console.error('Error during search:', err);
    });
}

export default searchFiles;