import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import toast from 'react-hot-toast';
import {
  Shield, ShieldCheck, ShieldX, Search, RefreshCw,
  Eye, X, CheckCircle, XCircle, Clock, FileText,
  User, Camera, CreditCard
} from 'lucide-react';
import { getAllKycDocuments, approveKyc, rejectKyc, type KycDocument } from '../../services/adminApi';

const statusConfig = {
  pending: { label: 'รอตรวจสอบ', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock },
  approved: { label: 'อนุมัติแล้ว', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
  rejected: { label: 'ปฏิเสธแล้ว', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
};

export const AdminKYC = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<KycDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<KycDocument | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllKycDocuments(filterStatus || undefined);
      setDocs(data);
    } catch (e: any) {
      toast.error('โหลด KYC ล้มเหลว: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleApprove = async (doc: KycDocument) => {
    if (!user?.id || !window.confirm(`ยืนยันอนุมัติ KYC ของ ${(doc.profiles as any)?.full_name}?`)) return;
    setProcessing(true);
    const t = toast.loading('กำลังอนุมัติ...');
    try {
      const result = await approveKyc(doc.user_id, user.id);
      if (!result.success) throw new Error(result.message);
      toast.success('อนุมัติ KYC สำเร็จ! ส่งการแจ้งเตือนถึงผู้ใช้แล้ว ✅', { id: t });
      setSelectedDoc(null);
      fetchDocs();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (doc: KycDocument) => {
    if (!user?.id || !rejectReason.trim()) {
      toast.error('กรุณาระบุเหตุผลที่ปฏิเสธ');
      return;
    }
    setProcessing(true);
    const t = toast.loading('กำลังปฏิเสธ...');
    try {
      const result = await rejectKyc(doc.user_id, user.id, rejectReason);
      if (!result.success) throw new Error(result.message);
      toast.success('ปฏิเสธ KYC เรียบร้อย', { id: t });
      setSelectedDoc(null);
      setRejectReason('');
      fetchDocs();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    } finally {
      setProcessing(false);
    }
  };

  const filtered = docs.filter(d =>
    !search ||
    (d.profiles as any)?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (d.profiles as any)?.phone?.includes(search) ||
    d.id_card_number?.includes(search)
  );

  const counts = {
    pending: docs.filter(d => d.status === 'pending').length,
    approved: docs.filter(d => d.status === 'approved').length,
    rejected: docs.filter(d => d.status === 'rejected').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-black text-white  tracking-tighter uppercase">
            ยืนยันตัวตน KYC
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
            รอ {counts.pending} · อนุมัติ {counts.approved} · ปฏิเสธ {counts.rejected}
          </p>
        </div>
        <button onClick={fetchDocs} className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-xl transition-all self-start">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5">
          {(['pending', 'approved', 'rejected', ''] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                filterStatus === s ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-white'
              }`}>
              {s === 'pending' ? `รอดำเนินการ (${counts.pending})` :
               s === 'approved' ? 'อนุมัติ' :
               s === 'rejected' ? 'ปฏิเสธ' : 'ทั้งหมด'}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="ค้นหา ชื่อ / เบอร์ / เลขบัตร..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl pl-9 pr-4 py-3 text-[11px] font-bold focus:border-red-500 outline-none transition-all" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(doc => {
          const cfg = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.pending;
          const StatusIcon = cfg.icon;
          return (
            <div key={doc.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-[2rem] p-6 space-y-4 transition-all hover:shadow-xl group">
              {/* User Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">
                    {(doc.profiles as any)?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">{(doc.profiles as any)?.full_name || 'ไม่ระบุ'}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{(doc.profiles as any)?.phone}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${cfg.bg} ${cfg.color}`}>
                  <StatusIcon size={10} /> {cfg.label}
                </span>
              </div>

              {/* ID Number */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
                <CreditCard size={12} className="text-slate-500" />
                <p className="text-[11px] font-mono text-slate-300">{doc.id_card_number || 'ยังไม่ได้ระบุ'}</p>
              </div>

              {/* Document Thumbnails */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'หน้าบัตร', url: doc.id_card_front_url },
                  { label: 'หลังบัตร', url: doc.id_card_back_url },
                  { label: 'Selfie', url: doc.selfie_url },
                ].map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700 relative group/img">
                    {img.url ? (
                      <>
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        <button onClick={() => setPreviewImg(img.url!)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                          <Eye size={16} className="text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <Camera size={14} className="text-slate-600" />
                        <p className="text-[8px] text-slate-600 font-black uppercase text-center px-1">{img.label}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submitted */}
              <p className="text-[9px] text-slate-600 font-black uppercase">
                ส่งเมื่อ: {new Date(doc.submitted_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
              </p>

              {/* Actions */}
              {doc.status === 'pending' && (
                <button onClick={() => { setSelectedDoc(doc); setRejectReason(''); }}
                  className="w-full bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                  <Eye size={14} /> ตรวจสอบเอกสาร
                </button>
              )}
              {doc.status === 'rejected' && doc.rejection_reason && (
                <p className="text-[9px] text-red-400 font-black bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  เหตุผล: {doc.rejection_reason}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {loading && <div className="text-center py-20 font-black text-slate-500 uppercase text-[10px] animate-pulse tracking-widest">กำลังโหลด...</div>}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-[3rem] text-slate-600 font-black uppercase text-xs tracking-widest">
          <Shield size={40} className="mx-auto mb-4 opacity-20" />
          ไม่พบรายการ KYC
        </div>
      )}

      {/* Review Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-sans font-black text-white  tracking-tighter uppercase">
                ตรวจสอบ KYC
              </h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* User Detail */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex items-center justify-center text-white font-black shadow-lg">
                  {(selectedDoc.profiles as any)?.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-black text-white text-lg">{(selectedDoc.profiles as any)?.full_name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{(selectedDoc.profiles as any)?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-4 py-2">
                <CreditCard size={14} className="text-slate-500" />
                <p className="text-sm font-mono text-white">{selectedDoc.id_card_number}</p>
              </div>
            </div>

            {/* Document Images Full */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'บัตรประชาชน (หน้า)', url: selectedDoc.id_card_front_url, icon: FileText },
                { label: 'บัตรประชาชน (หลัง)', url: selectedDoc.id_card_back_url, icon: FileText },
                { label: 'รูป Selfie', url: selectedDoc.selfie_url, icon: User },
              ].map((img, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">{img.label}</p>
                  <div className="aspect-[3/2] rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                    {img.url ? (
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewImg(img.url!)} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center flex-col gap-2 text-slate-600">
                        <img.icon size={24} />
                        <p className="text-[9px] font-black uppercase">ไม่มีรูป</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reject Reason */}
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase block mb-2">เหตุผลที่ปฏิเสธ (กรอกก่อนกดปฏิเสธ)</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                rows={2} placeholder="เช่น: รูปภาพไม่ชัด, บัตรหมดอายุ, ข้อมูลไม่ตรง..."
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none resize-none" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={() => handleApprove(selectedDoc)} disabled={processing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-900/20">
                <ShieldCheck size={16} /> อนุมัติ KYC
              </button>
              <button onClick={() => handleReject(selectedDoc)} disabled={processing || !rejectReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-900/20">
                <ShieldX size={16} /> ปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {previewImg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setPreviewImg(null)}>
          <img src={previewImg} alt="Preview" className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl" />
          <button onClick={() => setPreviewImg(null)} className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

