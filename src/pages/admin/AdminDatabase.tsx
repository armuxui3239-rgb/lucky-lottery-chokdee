import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { 
  Database, 
  Table as TableIcon, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  RefreshCw
} from 'lucide-react';

export const AdminDatabase = () => {
  const tables = [
    'profiles', 'wallets', 'lottery_rounds', 'lottery_tickets', 
    'lottery_results', 'transactions', 'site_settings', 'banks',
    'promotions', 'loyalty_points', 'loyalty_rewards', 'loyalty_redemptions', 'winners',
    'notifications', 'affiliate_commissions', 'kyc_documents'
  ];
  const [selectedTable, setSelectedTable] = useState('profiles');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isEditing, setIsEditing] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);

  useEffect(() => {
    fetchTableData();
  }, [selectedTable]);

  const fetchTableData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .from(selectedTable)
        .select('*')
        .order('id', { ascending: false }) // Assume most have id
        .limit(100);

      if (error) {
         // Fallback if no 'id' column for ordering
         const { data: altResult, error: altErr } = await supabase
           .from(selectedTable)
           .select('*')
           .limit(100);
         if (altErr) throw altErr;
         setData(altResult || []);
      } else {
         setData(result || []);
      }
    } catch (e: any) {
      toast.error(`Error loading table ${selectedTable}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(`คุณแน่ใจหรือไม่ที่จะลบข้อมูล #${id} จากตาราง ${selectedTable}?`);
    if (!confirm) return;

    const t = toast.loading('กำลังลบข้อมูล...');
    try {
      const { error } = await supabase.from(selectedTable).delete().eq('id', id);
      if (error) throw error;
      toast.success('ลบข้อมูลสำเร็จ', { id: t });
      fetchTableData();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
     e.preventDefault();
     const t = toast.loading('กำลังบันทึกข้อมูล...');
     try {
        const { id, created_at, ...updateData } = editRecord;
        
        let result;
        if (id && isEditing && !isCreating) {
           // Update existing
           result = await supabase.from(selectedTable).update(updateData).eq('id', id);
        } else {
           // Create new (Remove ID if it's auto-generated)
           const finalData = { ...updateData };
           if (!id) delete (finalData as any).id;
           result = await supabase.from(selectedTable).insert(finalData);
        }

        if (result.error) throw result.error;
        
        toast.success(id ? 'อัปเดตข้อมูลสำเร็จ' : 'สร้างข้อมูลใหม่สำเร็จ', { id: t });
        setIsEditing(false);
        setIsCreating(false);
        fetchTableData();
     } catch (e: any) {
        toast.error(e.message, { id: t });
     }
  };

  const [isCreating, setIsCreating] = useState(false);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] animate-in fade-in duration-500">
      
      {/* Sidebar: Table Selector */}
      <div className="w-full lg:w-64 space-y-4">
        <button 
          onClick={() => {
             if (data.length > 0) {
                const emptyRecord = Object.fromEntries(columns.map(c => [c, '']));
                delete (emptyRecord as any).id;
                delete (emptyRecord as any).created_at;
                setEditRecord(emptyRecord);
                setIsCreating(true);
                setIsEditing(true);
             } else {
                toast.error('Table is empty. Cannot determine schema for new record.');
             }
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/20 text-xs uppercase tracking-widest transition-all mb-4"
        >
           <Plus size={16} /> สร้างข้อมูลใหม่
        </button>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Database size={14} className="text-primary" /> เลือกตาราง (Tables)
           </h3>
           <div className="space-y-1">
              {tables.map(t => (
                 <button
                   key={t}
                   onClick={() => setSelectedTable(t)}
                   className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all flex items-center justify-between group ${
                     selectedTable === t ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
                   }`}
                 >
                    <div className="flex items-center gap-2">
                       <TableIcon size={12} className={selectedTable === t ? 'text-white' : 'text-slate-600'} />
                       {t}
                    </div>
                    <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedTable === t ? 'text-white' : 'text-slate-600'}`} />
                 </button>
              ))}
           </div>
        </div>
      </div>

      {/* Main Content: Table Explorer */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between gap-4">
           <div className="flex flex-col">
              <h2 className="text-2xl font-display font-black text-white italic tracking-tighter uppercase whitespace-nowrap">
                 Explorer: <span className="text-primary">{selectedTable}</span>
              </h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                 Total records shown: {data.length} (Live Sync Enabled)
              </p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                 <input 
                   type="text" 
                   placeholder="Search entries..." 
                   className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white w-48 focus:border-primary focus:w-64 transition-all outline-none"
                 />
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              </div>
              <button 
                onClick={fetchTableData}
                className="size-10 flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-500 hover:text-white rounded-xl transition-all"
              >
                 <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
           </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-950/50">
                       {columns.map(col => (
                         <th key={col} className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">{col}</th>
                       ))}
                       <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 text-center">Manage</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 font-bold">
                    {data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors group">
                         {columns.map(col => (
                            <td key={col} className="px-6 py-4 text-[11px] text-slate-300 whitespace-nowrap overflow-hidden max-w-[200px] truncate">
                               {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '-')}
                            </td>
                         ))}
                         <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                               <button 
                                 onClick={() => { setEditRecord(row); setIsEditing(true); }}
                                 className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all"
                               >
                                  <Edit2 size={12} />
                               </button>
                               <button 
                                 onClick={() => row.id && handleDelete(row.id)}
                                 className="size-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                               >
                                  <Trash2 size={12} />
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           {data.length === 0 && !loading && (
             <div className="py-20 text-center text-slate-700 font-black uppercase italic tracking-widest text-xs">This table is currently empty</div>
           )}
        </div>
      </div>

      {/* Generic Edit Modal (Dynamic Generator) */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm">
           <form onSubmit={handleUpdate} className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-w-2xl w-full max-h-[80vh] overflow-y-auto space-y-8 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                 <h3 className="text-2xl font-display font-black text-white italic tracking-tighter uppercase">
                    {isCreating ? 'Create New' : 'Edit'} <span className="text-primary">{selectedTable}</span> Record
                 </h3>
                 <button type="button" onClick={() => { setIsEditing(false); setIsCreating(false); }} className="text-slate-500 hover:text-white block">Close [Esc]</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {Object.keys(editRecord).map(key => (
                    <div key={key} className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{key}</label>
                       {typeof editRecord[key] === 'boolean' ? (
                          <select 
                             value={String(editRecord[key])} 
                             onChange={e => setEditRecord({...editRecord, [key]: e.target.value === 'true'})}
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none"
                          >
                             <option value="true">TRUE</option>
                             <option value="false">FALSE</option>
                          </select>
                       ) : (
                          <input 
                             type="text" 
                             disabled={!isCreating && (key === 'id' || key === 'created_at')}
                             value={typeof editRecord[key] === 'object' ? JSON.stringify(editRecord[key]) : (editRecord[key] ?? '')} 
                             onChange={e => setEditRecord({...editRecord, [key]: e.target.value})}
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none disabled:opacity-30 disabled:cursor-not-allowed"
                          />
                       )}
                    </div>
                 ))}
              </div>

              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-3">
                 <Plus size={16} /> {isCreating ? 'Insert New Entry' : 'Update Record Data'} (Atomic Sync)
              </button>
           </form>
        </div>
      )}

    </div>
  );
};
