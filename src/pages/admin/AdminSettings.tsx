import React, { useState, useEffect } from 'react';
import { Palette, Type, Save, Image, Globe, Phone, Mail, CreditCard, Users, Bell, Wrench } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSiteConfig } from '../../lib/SiteConfigContext';

export const AdminSettings = () => {
  const { config, updateConfig, loading } = useSiteConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleUpdate = (key: string, value: string) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    try {
      await updateConfig(key as any, localConfig[key as keyof typeof localConfig]);
      toast.success(`บันทึก ${key} สำเร็จ`, {
        style: { borderRadius: '1.5rem', background: '#1e293b', color: '#fff', fontFamily: 'Prompt' }
      });
    } catch (error: any) {
      toast.error('บันทึกล้มเหลว: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const keys = Object.keys(localConfig) as (keyof typeof localConfig)[];
      for (const key of keys) {
        if (localConfig[key] !== config[key]) {
          await updateConfig(key, localConfig[key]);
        }
      }
      toast.success('บันทึกการตั้งค่าทั้งหมดสำเร็จ!', {
        style: { borderRadius: '1.5rem', background: '#1e293b', color: '#fff', fontFamily: 'Prompt' }
      });
    } catch (error: any) {
      toast.error('บันทึกล้มเหลว: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white  uppercase tracking-tighter flex items-center gap-3">
            <Palette className="text-primary" size={28} /> 
            จัดการตั้งค่าเว็บไซต์ (CMS)
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
            แก้ไขข้อมูลที่แสดงบนหน้าผู้ใช้ได้ทั้งหมด
          </p>
        </div>
        <button 
          onClick={saveAll}
          disabled={saving}
          className="h-14 px-8 bg-primary text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest  shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
          บันทึกทั้งหมด
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* === BRAND & THEME === */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Image size={20} className="text-primary" /> แบรนด์และธีม
          </h3>

          <SettingRow 
            icon={<Type size={16} />}
            label="ชื่อเว็บไซต์"
            value={localConfig.site_name}
            onChange={(v) => handleUpdate('site_name', v)}
            onSave={() => handleSave('site_name')}
            saving={saving}
          />

          <SettingRow 
            icon={<Type size={16} />}
            label="สโลแกน"
            value={localConfig.site_tagline}
            onChange={(v) => handleUpdate('site_tagline', v)}
            onSave={() => handleSave('site_tagline')}
            saving={saving}
          />

          <SettingRow 
            icon={<Image size={16} />}
            label="โลโก้ (Emoji หรือ URL)"
            value={localConfig.site_logo}
            onChange={(v) => handleUpdate('site_logo', v)}
            onSave={() => handleSave('site_logo')}
            saving={saving}
          />
          <div className="flex items-center gap-4 -mt-2">
            <div className="size-16 bg-slate-950 rounded-2xl flex items-center justify-center text-3xl border border-slate-800">
              {localConfig.site_logo?.startsWith('/') || localConfig.site_logo?.startsWith('http') 
                ? <img src={localConfig.site_logo} alt="logo" className="w-10 h-10 object-contain" />
                : localConfig.site_logo}
            </div>
            <p className="text-[10px] text-slate-500">ตัวอย่างโลโก้ที่แสดงบนหน้าเว็บ</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">สีหลัก (Primary Color)</label>
            <div className="flex gap-3">
              <input 
                type="color" 
                value={localConfig.primary_color} 
                onChange={(e) => handleUpdate('primary_color', e.target.value)}
                className="size-14 bg-slate-950 border border-slate-800 rounded-2xl p-1 cursor-pointer"
              />
              <input 
                value={localConfig.primary_color} 
                onChange={(e) => handleUpdate('primary_color', e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-mono font-bold uppercase"
              />
              <button 
                onClick={() => handleSave('primary_color')}
                disabled={saving}
                className="px-4 bg-primary text-white rounded-xl font-black text-xs uppercase disabled:opacity-50"
              >
                บันทึก
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">สีรอง (Secondary Color)</label>
            <div className="flex gap-3">
              <input 
                type="color" 
                value={localConfig.secondary_color} 
                onChange={(e) => handleUpdate('secondary_color', e.target.value)}
                className="size-14 bg-slate-950 border border-slate-800 rounded-2xl p-1 cursor-pointer"
              />
              <input 
                value={localConfig.secondary_color} 
                onChange={(e) => handleUpdate('secondary_color', e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-mono font-bold uppercase"
              />
              <button 
                onClick={() => handleSave('secondary_color')}
                disabled={saving}
                className="px-4 bg-primary text-white rounded-xl font-black text-xs uppercase disabled:opacity-50"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>

        {/* === HERO & CONTENT === */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Globe size={20} className="text-primary" /> เนื้อหาหน้าหลัก
          </h3>

          <SettingRow 
            icon={<Type size={16} />}
            label="หัวข้อ Hero"
            value={localConfig.hero_title}
            onChange={(v) => handleUpdate('hero_title', v)}
            onSave={() => handleSave('hero_title')}
            saving={saving}
          />

          <SettingRow 
            icon={<Type size={16} />}
            label="คำอธิบาย Hero"
            value={localConfig.hero_subtitle}
            onChange={(v) => handleUpdate('hero_subtitle', v)}
            onSave={() => handleSave('hero_subtitle')}
            saving={saving}
          />

          <SettingRow 
            icon={<Bell size={16} />}
            label="ประกาศ (Announcement)"
            value={localConfig.announcement}
            onChange={(v) => handleUpdate('announcement', v)}
            onSave={() => handleSave('announcement')}
            saving={saving}
          />

          <SettingRow 
            icon={<Type size={16} />}
            label="Meta Description (SEO)"
            value={localConfig.meta_description}
            onChange={(v) => handleUpdate('meta_description', v)}
            onSave={() => handleSave('meta_description')}
            saving={saving}
            multiline
          />

          <SettingRow 
            icon={<Type size={16} />}
            label="Meta Keywords (SEO)"
            value={localConfig.meta_keywords}
            onChange={(v) => handleUpdate('meta_keywords', v)}
            onSave={() => handleSave('meta_keywords')}
            saving={saving}
          />
        </div>

        {/* === CONTACT & SOCIAL === */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Phone size={20} className="text-primary" /> ติดต่อและโซเชียล
          </h3>

          <SettingRow 
            icon={<Phone size={16} />}
            label="เบอร์โทรศัพท์"
            value={localConfig.contact_phone}
            onChange={(v) => handleUpdate('contact_phone', v)}
            onSave={() => handleSave('contact_phone')}
            saving={saving}
          />

          <SettingRow 
            icon={<Mail size={16} />}
            label="อีเมล"
            value={localConfig.contact_email}
            onChange={(v) => handleUpdate('contact_email', v)}
            onSave={() => handleSave('contact_email')}
            saving={saving}
          />

          <SettingRow 
            icon={<CreditCard size={16} />}
            label="PromptPay ID"
            value={localConfig.promptpay_id}
            onChange={(v) => handleUpdate('promptpay_id', v)}
            onSave={() => handleSave('promptpay_id')}
            saving={saving}
          />

          <SettingRow 
            icon={<Globe size={16} />}
            label="Line URL"
            value={localConfig.line_url}
            onChange={(v) => handleUpdate('line_url', v)}
            onSave={() => handleSave('line_url')}
            saving={saving}
          />

          <SettingRow 
            icon={<Globe size={16} />}
            label="Facebook URL"
            value={localConfig.facebook_url}
            onChange={(v) => handleUpdate('facebook_url', v)}
            onSave={() => handleSave('facebook_url')}
            saving={saving}
          />

          <SettingRow 
            icon={<Globe size={16} />}
            label="TikTok URL"
            value={localConfig.tiktok_url}
            onChange={(v) => handleUpdate('tiktok_url', v)}
            onSave={() => handleSave('tiktok_url')}
            saving={saving}
          />

          <SettingRow 
            icon={<Globe size={16} />}
            label="Telegram URL"
            value={localConfig.telegram_url}
            onChange={(v) => handleUpdate('telegram_url', v)}
            onSave={() => handleSave('telegram_url')}
            saving={saving}
          />
        </div>

        {/* === SYSTEM SETTINGS === */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Wrench size={20} className="text-primary" /> ตั้งค่าระบบ
          </h3>

          <SettingRow 
            icon={<CreditCard size={16} />}
            label="ราคาสลาก (บาท)"
            value={localConfig.ticket_price}
            onChange={(v) => handleUpdate('ticket_price', v)}
            onSave={() => handleSave('ticket_price')}
            saving={saving}
          />

          <SettingRow 
            icon={<CreditCard size={16} />}
            label="ฝากขั้นต่ำ (บาท)"
            value={localConfig.min_deposit}
            onChange={(v) => handleUpdate('min_deposit', v)}
            onSave={() => handleSave('min_deposit')}
            saving={saving}
          />

          <SettingRow 
            icon={<CreditCard size={16} />}
            label="ถอนขั้นต่ำ (บาท)"
            value={localConfig.min_withdraw}
            onChange={(v) => handleUpdate('min_withdraw', v)}
            onSave={() => handleSave('min_withdraw')}
            saving={saving}
          />

          <SettingRow 
            icon={<Users size={16} />}
            label="Affiliate Rate (%)"
            value={localConfig.affiliate_rate}
            onChange={(v) => handleUpdate('affiliate_rate', v)}
            onSave={() => handleSave('affiliate_rate')}
            saving={saving}
          />

          <SettingRow 
            icon={<CreditCard size={16} />}
            label="Welcome Bonus (บาท)"
            value={localConfig.welcome_bonus}
            onChange={(v) => handleUpdate('welcome_bonus', v)}
            onSave={() => handleSave('welcome_bonus')}
            saving={saving}
          />

          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <p className="text-sm font-bold text-white">โหมด Maintenance</p>
              <p className="text-[10px] text-slate-500">ปิดเว็บไซต์ชั่วคราวสำหรับการปรับปรุง</p>
            </div>
            <button
              onClick={() => {
                const newValue = localConfig.maintenance_mode === 'true' ? 'false' : 'true';
                handleUpdate('maintenance_mode', newValue);
                handleSave('maintenance_mode');
              }}
              className={`relative w-14 h-8 rounded-full transition-all ${localConfig.maintenance_mode === 'true' ? 'bg-primary' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 size-6 rounded-full bg-white transition-all ${localConfig.maintenance_mode === 'true' ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingRow = ({ 
  icon, 
  label, 
  value, 
  onChange, 
  onSave, 
  saving,
  multiline = false 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  multiline?: boolean;
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
      {icon} {label}
    </label>
    <div className="flex gap-3">
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm resize-none focus:ring-2 focus:ring-primary/50 outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:ring-2 focus:ring-primary/50 outline-none"
        />
      )}
      <button 
        onClick={onSave}
        disabled={saving}
        className="px-4 bg-primary text-white rounded-xl font-black text-xs uppercase disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
      >
        {saving ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
      </button>
    </div>
  </div>
);
