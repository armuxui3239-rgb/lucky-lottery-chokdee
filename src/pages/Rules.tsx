import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Scale, FileText, Lock, UserCheck, AlertCircle } from 'lucide-react';

const Rules: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'ความปลอดภัยและการเข้าใช้งาน',
      icon: Lock,
      content: [
        'ผู้สมัครสมาชิกต้องมีอายุไม่ต่ำกว่า 18 ปีบริบูรณ์',
        'หนึ่งหมายเลขโทรศัพท์สามารถสมัครสมาชิกได้เพียง 1 บัญชีเท่านั้น',
        'ข้อมูลการสมัครต้องเป็นข้อมูลจริง เพื่อประโยชน์ในการรับรางวัล',
        'ห้ามเปิดเผยรหัสผ่านและ PIN ให้แก่บุคคลอื่นเด็ดขาด'
      ]
    },
    {
      title: 'การซื้อและจองสลาก',
      icon: FileText,
      content: [
        'ระบบเปิดให้บริการซื้อสลากตลอด 24 ชั่วโมง ยกเว้นช่วงเวลาประกาศผล',
        'เมื่อทำการซื้อและชำระเงินสำเร็จแล้ว ไม่สามารถขอยกเลิกหรือคืนเงินได้',
        'สลากดิจิทัลที่ซื้อจะถูกเก็บไว้ในระบบภายใต้ชื่อสมาชิกของผู้ซื้อ',
        'ระบบของเราไม่มีเลขอั้น ท่านสามารถเลือกซื้อได้ทุกตัวเลขที่ต้องการตลอด 24 ชั่วโมง'
      ]
    },
    {
      title: 'การรับรางวัลและการโอนเงิน',
      icon: Scale,
      content: [
        'ระบบจะทำการตรวจสอบและปรับยอดเงินรางวัลให้อัตโนมัติหลังผลประกาศเป็นทางการ',
        'สมาชิกสามารถถอนเงินรางวัลได้ทันทีผ่านบัญชีธนาคารที่ลงทะเบียนไว้',
        'การถอนเงินอาจมีเวลาดำเนินการตามรอบธนาคาร (ปกติภายใน 5-15 นาที)',
        'กรณีถูกรางวัลใหญ่อาจมีการติดต่อเพิ่มเติมเพื่อยืนยันตัวตน'
      ]
    },
    {
      title: 'นโยบายการยืนยันตัวตน (KYC)',
      icon: UserCheck,
      content: [
        'สมาชิกต้องยืนยันตัวตนด้วยบัตรประชาชนเพื่อเพิ่มความปลอดภัยในการทำธุรกรรม',
        'เอกสารที่อัปโหลดต้องชัดเจนและข้อมูลตรงกับบัญชีธนาคาร',
        'ระบบจะเก็บรักษาข้อมูลของท่านเป็นความลับตามนโยบายความเป็นส่วนตัว'
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-50 py-5 px-6 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="size-11 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 rounded-2xl transition-all active:scale-90">
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-sans font-black leading-tight uppercase  tracking-tighter text-slate-900">กฎกติกาการใช้งาน</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ข้อกำหนดและเงื่อนไข (Terms & Conditions)</p>
          </div>
          <div className="size-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
             <ShieldCheck size={20} />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-10 space-y-12">
        {/* Intro */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-125">
            <Scale size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl font-sans font-black  tracking-tighter uppercase leading-none">มาตรฐาน <span className="text-primary ">ความยุติธรรม</span></h2>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">เราให้ความสำคัญกับความปลอดภัยและกติกาที่เป็นธรรมสำหรับสมาชิกทุกคน</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <section.icon size={22} />
                 </div>
                 <h3 className="text-lg font-sans font-black text-slate-900 uppercase  tracking-tighter leading-none">{section.title}</h3>
              </div>
              <ul className="grid grid-cols-1 gap-3">
                {section.content.map((item, idy) => (
                  <li key={idy} className="flex items-start gap-3 p-5 rounded-2xl bg-white border border-slate-50 hover:border-slate-100 shadow-sm group">
                    <div className="size-2 rounded-full bg-slate-200 group-hover:bg-primary mt-1.5 transition-colors shrink-0"></div>
                    <span className="text-xs font-medium text-slate-500 leading-relaxed tracking-wide">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Warning Policy */}
        <div className="p-8 rounded-[3rem] bg-amber-50 border border-amber-100 space-y-4 shadow-inner">
           <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle size={20} />
              <h4 className="text-sm font-black uppercase tracking-widest leading-none">นโยบายการระงับบัญชี</h4>
           </div>
           <p className="text-[10px] font-black text-amber-700/60 uppercase tracking-[0.15em] leading-relaxed">
             หากตรวจพบการทุจริต การเปิดบัญชีซ้ำซ้อน หรือการกระทำใดๆ ที่ผิดกฎหมาย ระบบขอสงวนสิทธิ์ในการระงับบัญชีและการถอนเงินโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
           </p>
        </div>

        {/* Timestamp */}
        <div className="text-center pb-20">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest  leading-none animate-pulse">อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </main>
    </div>
  );
};

export default Rules;

