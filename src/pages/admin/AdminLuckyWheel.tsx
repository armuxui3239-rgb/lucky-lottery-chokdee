import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings2, Gift, Percent, Image as ImageIcon, Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LuckyWheelPrize {
    id: number;
    label: string;
    prize_value: number;
    win_probability: number;
    image_url: string | null;
    color: string;
    is_active: boolean;
    sort_order: number;
}

export const AdminLuckyWheel = () => {
    const [prizes, setPrizes] = useState<LuckyWheelPrize[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchPrizes = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('lucky_wheel_prizes')
            .select('*')
            .order('sort_order', { ascending: true });
        
        if (error) {
            toast.error('โหลดข้อมูลล้มเหลว: ' + error.message);
        } else if (data) {
            setPrizes(data);
        }
        setLoading(false);
    };

    useEffect(() => { fetchPrizes(); }, []);

    const handleUpdatePrize = (id: number, field: keyof LuckyWheelPrize, value: any) => {
        setPrizes(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const saveAll = async () => {
        setSaving(true);
        // ตรวจสอบความน่าจะเป็นรวม = 1.0
        const totalProb = prizes.reduce((sum, p) => sum + (p.win_probability || 0), 0);
        if (Math.abs(totalProb - 1.0) > 0.001) {
            toast.error(`โอกาสรวมต้อง = 100% (ตอนนี้ ${(totalProb * 100).toFixed(1)}%)`);
            setSaving(false);
            return;
        }

        const { error } = await supabase.from('lucky_wheel_prizes').upsert(prizes);
        if (!error) {
            toast.success('บันทึกการตั้งค่ากงล้อสำเร็จ!');
        } else {
            toast.error('บันทึกล้มเหลว: ' + error.message);
        }
        setSaving(false);
    };

    const addPrize = () => {
        const newId = prizes.length > 0 ? Math.max(...prizes.map(p => p.id)) + 1 : 1;
        const newPrize: LuckyWheelPrize = {
            id: newId,
            label: 'รางวัลใหม่',
            prize_value: 0,
            win_probability: 0.1,
            image_url: null,
            color: '#ec131e',
            is_active: true,
            sort_order: prizes.length + 1
        };
        setPrizes([...prizes, newPrize]);
    };

    const removePrize = (id: number) => {
        if (prizes.length <= 2) {
            toast.error('ต้องมีรางวัลอย่างน้อย 2 รางวัล');
            return;
        }
        setPrizes(prev => prev.filter(p => p.id !== id).map((p, idx) => ({ ...p, sort_order: idx + 1 })));
    };

    const normalizeProbabilities = () => {
        const total = prizes.reduce((sum, p) => sum + p.win_probability, 0);
        if (total === 0) return;
        setPrizes(prev => prev.map(p => ({ ...p, win_probability: p.win_probability / total })));
        toast.success('ปรับโอกาสให้รวม = 100% แล้ว');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const totalProbability = prizes.reduce((sum, p) => sum + (p.win_probability || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white  uppercase tracking-tighter flex items-center gap-3">
                        <Settings2 className="text-primary" /> ตั้งค่าวงล้อเสี่ยงโชค
                    </h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        จัดการรางวัลและโอกาสชนะ (ความน่าจะเป็นรวมต้อง = 100%)
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={normalizeProbabilities}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 border border-slate-700"
                    >
                        <RefreshCw size={14} /> ปรับให้รวม 100%
                    </button>
                    <button 
                        onClick={addPrize}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2"
                    >
                        <Plus size={14} /> เพิ่มรางวัล
                    </button>
                    <button 
                        onClick={saveAll} 
                        disabled={saving}
                        className="bg-primary hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
                    >
                        {saving ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                        บันทึกทั้งหมด
                    </button>
                </div>
            </div>

            {/* Probability Warning */}
            <div className={`p-4 rounded-2xl border ${Math.abs(totalProbability - 1.0) < 0.001 
                ? 'bg-emerald-950/30 border-emerald-500/30' 
                : 'bg-amber-950/30 border-amber-500/30'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    <Percent size={20} className={Math.abs(totalProbability - 1.0) < 0.001 ? 'text-emerald-500' : 'text-amber-500'} />
                    <div>
                        <p className="text-sm font-bold text-white">โอกาสชนะรวม: {(totalProbability * 100).toFixed(1)}%</p>
                        <p className="text-[10px] text-slate-400">{Math.abs(totalProbability - 1.0) < 0.001 ? 'สมดุลแล้ว ✓' : 'ต้องปรับให้ = 100%'}</p>
                    </div>
                </div>
            </div>

            {/* Prizes Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {prizes.map((prize, index) => (
                    <div key={prize.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:border-primary/50 transition-colors group">
                        <div className="flex gap-6">
                            {/* Image & Color */}
                            <div className="flex flex-col gap-3">
                                <div 
                                    className="relative size-24 rounded-2xl overflow-hidden flex items-center justify-center border-2"
                                    style={{ borderColor: prize.color, backgroundColor: prize.color + '20' }}
                                >
                                    {prize.image_url ? (
                                        <img src={prize.image_url} className="size-full object-cover" />
                                    ) : (
                                        <Gift className="text-slate-500" size={32} />
                                    )}
                                </div>
                                <input
                                    type="color"
                                    value={prize.color}
                                    onChange={(e) => handleUpdatePrize(prize.id, 'color', e.target.value)}
                                    className="w-full h-8 rounded-lg cursor-pointer"
                                />
                            </div>

                            {/* Fields */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">รางวัลที่ {index + 1}</span>
                                    <button 
                                        onClick={() => removePrize(prize.id)}
                                        className="text-slate-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ชื่อรางวัล</label>
                                        <input
                                            value={prize.label}
                                            onChange={(e) => handleUpdatePrize(prize.id, 'label', e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 mt-1 text-sm font-bold text-white outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">เครดิต (บาท)</label>
                                        <input
                                            type="number"
                                            value={prize.prize_value}
                                            onChange={(e) => handleUpdatePrize(prize.id, 'prize_value', parseInt(e.target.value) || 0)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 mt-1 text-sm font-bold text-white outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                        <span>โอกาสชนะ</span>
                                        <span className="text-primary">{(prize.win_probability * 100).toFixed(1)}%</span>
                                    </label>
                                    <input
                                        type="range" min="0" max="1" step="0.001"
                                        value={prize.win_probability}
                                        onChange={(e) => handleUpdatePrize(prize.id, 'win_probability', parseFloat(e.target.value))}
                                        className="w-full accent-primary mt-2"
                                    />
                                    <div className="flex justify-between text-[10px] font-mono text-slate-600 mt-1">
                                        <span>0%</span>
                                        <span>50%</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">URL รูปภาพ (ถ้ามี)</label>
                                    <input
                                        type="text"
                                        value={prize.image_url || ''}
                                        onChange={(e) => handleUpdatePrize(prize.id, 'image_url', e.target.value || null)}
                                        placeholder="https://..."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 mt-1 text-sm text-white outline-none focus:border-primary placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={prize.is_active}
                                        onChange={(e) => handleUpdatePrize(prize.id, 'is_active', e.target.checked)}
                                        className="size-5 rounded border-slate-700 accent-primary"
                                    />
                                    <label className="text-sm text-white">เปิดใช้งาน</label>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {prizes.length === 0 && (
                <div className="text-center py-20 bg-slate-900 rounded-[2.5rem] border border-slate-800">
                    <Gift size={48} className="text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">ยังไม่มีรางวัล</p>
                    <button onClick={addPrize} className="mt-4 text-primary font-black uppercase text-xs tracking-widest hover:underline">
                        + เพิ่มรางวัลแรก
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminLuckyWheel;
