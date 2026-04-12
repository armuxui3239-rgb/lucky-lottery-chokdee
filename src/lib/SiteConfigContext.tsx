import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';

export interface SiteConfig {
  site_name: string;
  site_tagline: string;
  site_logo: string;
  primary_color: string;
  secondary_color: string;
  hero_title: string;
  hero_subtitle: string;
  banner_1_url: string;
  banner_2_url: string;
  banner_3_url: string;
  announcement: string;
  promptpay_id: string;
  telegram_url: string;
  line_url: string;
  facebook_url: string;
  tiktok_url: string;
  meta_description: string;
  meta_keywords: string;
  leaderboard_mock_mode: string;
  maintenance_mode: string;
}

const defaultConfig: SiteConfig = {
  site_name: 'ล็อตเตอรี่โชคดี',
  site_tagline: 'ซื้อง่าย จ่ายจริง ปลอดภัย 100%',
  site_logo: '/logo-main.png',
  primary_color: '#ec131e',
  secondary_color: '#990000',
  hero_title: 'สลาก 6 หลัก',
  hero_subtitle: 'เลือกเองได้เลย!',
  banner_1_url: '/banner_lottery_horizontal_1.png',
  banner_2_url: '/banner_lottery_horizontal_2.png',
  banner_3_url: '/banner_lottery_horizontal_3.png',
  announcement: '📢 ยินดีต้อนรับสู่ ล็อตเตอรี่โชคดี!',
  promptpay_id: '0812345678',
  telegram_url: '',
  line_url: '',
  facebook_url: '',
  tiktok_url: '',
  meta_description: 'ล็อตเตอรี่โชคดี - ระบบซื้อสลากกินแบ่งรัฐบาลพรีเมียม ปลอดภัย จ่ายจริง',
  meta_keywords: 'ล็อตเตอรี่, หวย, โชคดี, ล็อตเตอรี่โชคดี, สลากกินแบ่ง',
  leaderboard_mock_mode: 'false',
  maintenance_mode: 'false',
};

const SiteConfigContext = createContext<{
  config: SiteConfig;
  updateConfig: (key: keyof SiteConfig, value: string) => Promise<void>;
  loading: boolean;
}>({
  config: defaultConfig,
  updateConfig: async () => {},
  loading: true,
});

export const useSiteConfig = () => useContext(SiteConfigContext);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*');

      if (fetchError) throw fetchError;

      if (data) {
        const newConfig = { ...defaultConfig };
        data.forEach((item: { key: string; value: string }) => {
          if (item.key in newConfig) {
            (newConfig as any)[item.key] = item.value;
          }
        });
        setConfig(newConfig);
        applyTheme(newConfig);
      }
    } catch (err) {
      console.error('Error fetching site config:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (key: keyof SiteConfig, value: string) => {
    const { error } = await supabase.from('site_settings').upsert({ key, value });
    if (error) throw error;
    await fetchConfig();
  };

  const applyTheme = (conf: SiteConfig) => {
    document.documentElement.style.setProperty('--theme-primary', conf.primary_color);
    document.documentElement.style.setProperty('--theme-secondary', conf.secondary_color);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, loading, updateConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

