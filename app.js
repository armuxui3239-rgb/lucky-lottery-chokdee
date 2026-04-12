/**
 * @file app.js
 * @description Client-side logic for "ล็อตลี่ โชคดี" Dashboard
 */

// --- Configuration ---
const SUPABASE_URL = 'https://qitdcchnszvlvszzdajy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_O4f0nj6cxJjvBw4w30AgBw_gfhIsBdH';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DOM Elements ---
const lottoForm = document.getElementById('lottoForm');
const ticketList = document.getElementById('ticketList');
const themeToggle = document.getElementById('themeToggle');
const searchInput = document.getElementById('uiSearch');

// --- State Management ---
let tickets = [];

// --- Dark Mode Logic ---
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});

if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
}

// --- Data Fetching ---
async function fetchTickets() {
    document.getElementById('loading').classList.remove('hidden');
    const { data, error } = await _supabase
        .from('lotto_tickets')
        .select('*')
        .order('created_at', { ascending: false });

    document.getElementById('loading').classList.add('hidden');
    if (error) return showToast('❌ Error: ' + error.message);

    tickets = data;
    renderTickets(tickets);
    updateStats();
}

function renderTickets(data) {
    const statusConfig = {
        pending: { label: 'รอผล', color: 'text-amber-600 bg-amber-100' },
        win: { label: 'ถูกรางวัล', color: 'text-emerald-600 bg-emerald-100' },
        paid: { label: 'จ่ายเงินแล้ว', color: 'text-blue-600 bg-blue-100' },
        lose: { label: 'ไม่ถูกรางวัล', color: 'text-slate-400 bg-slate-100' }
    };

    ticketList.innerHTML = data.map(t => `
        <tr class="hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
            <td class="px-6 py-4 text-sm text-slate-500">${new Date(t.created_at).toLocaleDateString('th-TH')}</td>
            <td class="px-6 py-4 font-mono font-bold text-xl text-blue-600 dark:text-blue-400">${t.ticket_number}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase italic ${statusConfig[t.status]?.color || ''}">
                    ${statusConfig[t.status]?.label || t.status}
                </span>
            </td>
            <td class="px-6 py-4 text-center">
                <button onclick="deleteTicket('${t.id}')" class="text-slate-400 hover:text-red-500 transition-colors">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function updateStats() {
    document.getElementById('totalTickets').innerText = tickets.length;
    document.getElementById('totalAmount').innerText = tickets.reduce((sum, t) => sum + (t.amount || 0), 0);
}

// --- Form Submission ---
lottoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ticketNumber = document.getElementById('ticketNumber').value;
    const amount = parseInt(document.getElementById('amount').value);

    if (!/^[0-9]{6}$/.test(ticketNumber)) return showToast('⚠️ เลขสลากต้องเป็นตัวเลข 6 หลัก');

    const { error } = await _supabase.from('lotto_tickets').insert([{ ticket_number: ticketNumber, amount, status: 'pending' }]);

    if (error) showToast('❌ Error: ' + error.message);
    else {
        showToast('✅ บันทึกเลข ' + ticketNumber + ' สำเร็จ!');
        lottoForm.reset();
        fetchTickets();
    }
});

// --- Helper Functions ---
window.deleteTicket = async (id) => {
    if (!confirm('ยืนยันการลบข้อมูล?')) return;
    const { error } = await _supabase.from('lotto_tickets').delete().eq('id', id);
    if (!error) fetchTickets();
};

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
}

// --- UI Search Logic (Mimic Grep Utility) ---
searchInput.addEventListener('input', (e) => {
    const term = e.target.value;
    const filtered = tickets.filter(t => t.ticket_number.includes(term));
    renderTickets(filtered);
});

// Initialize
fetchTickets();