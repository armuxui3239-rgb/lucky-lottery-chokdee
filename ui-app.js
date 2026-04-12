/**
 * @file ui-app.js
 * @description ระบบจัดการ UI และการเชื่อมต่อ Supabase สำหรับหน้าเว็บ
 */

// 1. Configuration (ใช้ค่าเดียวกับใน supabaseClient.js)
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Dark Mode Logic
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    darkModeToggle.textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';
});

// 3. Fetch Data Function
async function loadTickets(searchTerm = '') {
    const tbody = document.getElementById('lottoTableBody');

    let query = supabase
        .from('lotto_tickets')
        .select('*')
        .order('created_at', { ascending: false });

    if (searchTerm) {
        query = query.like('ticketNumber', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-10 text-gray-400">ไม่พบข้อมูล</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(ticket => `
        <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <td class="py-3 px-4 text-sm">${new Date(ticket.created_at).toLocaleDateString('th-TH')}</td>
            <td class="py-3 px-4 font-mono font-bold text-lg text-blue-600 dark:text-blue-400">${ticket.ticketNumber}</td>
            <td class="py-3 px-4 text-right">${ticket.amount} ใบ</td>
            <td class="py-3 px-4 text-center">
                <button onclick="deleteTicket('${ticket.id}')" class="text-red-500 hover:text-red-700">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// 4. Insert Data Function
const lottoForm = document.getElementById('lottoForm');
lottoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById('statusMsg');

    const ticketData = {
        ticketNumber: document.getElementById('ticketNumber').value,
        amount: parseInt(document.getElementById('amount').value),
        created_at: new Date().toISOString()
    };

    // แสดงสถานะ Loading
    statusMsg.className = 'mt-3 text-sm text-blue-500 block';
    statusMsg.textContent = 'กำลังบันทึกข้อมูล...';

    const { error } = await supabase.from('lotto_tickets').insert([ticketData]);

    if (error) {
        statusMsg.className = 'mt-3 text-sm text-red-500 block';
        statusMsg.textContent = 'เกิดข้อผิดพลาด: ' + error.message;
    } else {
        statusMsg.className = 'mt-3 text-sm text-green-500 block';
        statusMsg.textContent = 'บันทึกสำเร็จแล้ว! 🎉';
        lottoForm.reset();
        loadTickets(); // Refresh table
        setTimeout(() => statusMsg.classList.add('hidden'), 3000);
    }
});

// 5. Search Logic (เหมือน grep แต่แสดงผลใน UI)
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    loadTickets(e.target.value);
});

// 6. Delete Logic (Global for buttons)
window.deleteTicket = async (id) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
        const { error } = await supabase.from('lotto_tickets').delete().eq('id', id);
        if (!error) loadTickets();
    }
};

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    // เช็คสิทธิ์ dark mode จากระบบ
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
    loadTickets();
});