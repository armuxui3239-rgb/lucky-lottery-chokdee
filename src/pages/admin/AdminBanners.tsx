import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  Image, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Save, 
  UploadCloud,
  Layout,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSiteConfig } from '../../lib/SiteConfigContext';

const AdminBanners: React.FC = () => {
  const { config, updateConfig } = useSiteConfig();
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([
    { id: 1, url: config.banner_1_url || '', active: true },
    { id: 2, url: config.banner_2_url || '', active: true },
    { id: 3, url: config.banner_3_url || '', active: true }
  ]);

  useEffect(() => {
    setBanners([
      { id: 1, url: config.banner_1_url || '', active: true },
      { id: 2, url: config.banner_2_url || '', active: true },
      { id: 3, url: config.banner_3_url || '', active: true }
    ]);
  }, [config]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save each banner using updateConfig
      await updateConfig('banner_1_url', banners[0].url);
      await updateConfig('banner_2_url', banners[1].url);
      await updateConfig('banner_3_url', banners[2].url);
      
      toast.success('อัปเดตแบนเนอร์เรียบร้อย');
    } catch (error: any) {
      toast.error('บันทึกข้อมูลล้มเหลว: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBannerUrl = (id: number, url: string) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, url } : b));
  };

  return (
    <div className="space-y-6 font-prompt text-white">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
            <Image size={24} className="text-primary" />
            จัดการแบนเนอร์ประชาสัมพันธ์
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">ตั้งค่ารูปภาพแบนเนอร์สไลด์ที่หน้าหลัก (แนะนำขนาด 3:1)</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={loading}
          className="h-12 px-8 bg-primary text-white rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          {loading ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          บันทึกการตั้งค่า
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {banners.map((banner, index) => (
          <div key={banner.id} className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-10 shadow-2xl relative overflow-hidden group">
             <div className="flex flex-col md:flex-row gap-10">
                {/* Preview Area */}
                <div className="w-full md:w-80 space-y-4">
                   <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white uppercase tracking-widest italic group-hover:text-primary transition-colors">แบนเนอร์ที่ {banner.id}</h4>
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                         <CheckCircle2 size={16} />
                      </div>
                   </div>
                   <div className="aspect-[3/1] bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative">
                      {banner.url ? (
                        <img src={banner.url} alt={`Preview ${banner.id}`} className="w-full h-full object-cover" />
                      ) : (
                        <Layout size={32} className="text-slate-800" />
                      )}
                      {!banner.url && <p className="absolute bottom-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">ยังไม่ได้อัปโหลด</p>}
                   </div>
                </div>

                {/* Settings Area */}
                <div className="flex-1 space-y-6">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">ลิ้งก์รูปภาพ (Image URL)</label>
                      <div className="relative">
                         <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                         <input 
                           type="text" 
                           placeholder="https://example.com/banner.png"
                           value={banner.url}
                           onChange={(e) => updateBannerUrl(banner.id, e.target.value)}
                           className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all text-white placeholder:text-slate-700 outline-none"
                         />
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => window.open(banner.url, '_blank')}
                        disabled={!banner.url}
                        className="h-12 px-6 bg-white text-slate-950 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-30"
                      >
                         <Eye size={14} />
                         ดูตัวอย่าง
                      </button>
                      <button className="h-12 px-6 bg-slate-800 border border-slate-700 text-slate-400 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:border-primary/40 hover:text-white transition-all active:scale-95">
                         <UploadCloud size={14} />
                         อัปโหลด
                      </button>
                   </div>
                </div>
             </div>
             
             {/* Background Decoration */}
             <div className="absolute -right-6 -bottom-6 size-40 text-slate-950 -rotate-12 pointer-events-none group-hover:text-primary/5 transition-colors">
                <Image size={160} />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBanners;
