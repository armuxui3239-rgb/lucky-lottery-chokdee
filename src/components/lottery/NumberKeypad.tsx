import { Delete, Eraser, CheckCircle2 } from 'lucide-react';

interface NumberKeypadProps {
  isOpen: boolean;
  onClose: () => void;
  onNumberClick: (num: string) => void;
  onDeleteClick: () => void;
  onClearClick: () => void;
}

const NumberKeypad: React.FC<NumberKeypadProps> = ({ 
  isOpen, 
  onClose, 
  onNumberClick, 
  onDeleteClick, 
  onClearClick 
}) => {
  if (!isOpen) return null;

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col md:flex-row justify-end animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Keypad Container */}
      <div className="relative bg-white w-full md:w-[400px] h-fit md:h-screen rounded-t-[3.5rem] md:rounded-t-none md:rounded-l-[3.5rem] shadow-[0_-20px_80px_rgba(0,0,0,0.15)] md:shadow-[-20px_0_80px_rgba(0,0,0,0.15)] p-8 md:p-12 pb-12 md:pb-12 space-y-8 animate-in slide-in-from-bottom-full md:slide-in-from-right-full duration-500 border-t md:border-t-0 md:border-l border-slate-50 flex flex-col">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-50 shrink-0">
           <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] ">แผงปุ่มตัวเลขนำโชค</span>
           </div>
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-90 transition-all "
           >
             ตกลง <CheckCircle2 size={14} className="text-white" />
           </button>
        </div>

        {/* Number Grid - Centered on PC */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-3 gap-4">
             {/* Numbers 1-9 */}
             {numbers.slice(0, 9).map((num) => (
               <button
                 key={num}
                 onClick={() => onNumberClick(num)}
                 className="h-20 bg-slate-50 border-2 border-slate-100 rounded-[2rem] flex items-center justify-center text-3xl font-sans font-black  text-slate-900 hover:border-primary/20 hover:bg-white active:scale-90 transition-all shadow-sm group"
               >
                 <span className="group-active:scale-150 transition-transform duration-200">{num}</span>
               </button>
             ))}

             {/* Bottom Row */}
             <button
               onClick={onClearClick}
               className="h-20 bg-red-50 border-2 border-red-100 rounded-[2rem] flex flex-col items-center justify-center gap-1 group overflow-hidden relative active:scale-95 transition-all"
             >
               <Eraser size={20} className="text-primary group-hover:rotate-12 transition-transform" />
               <span className="text-[9px] font-black uppercase tracking-widest text-primary ">ล้างค่า</span>
             </button>

             <button
               onClick={() => onNumberClick('0')}
               className="h-20 bg-slate-50 border-2 border-slate-100 rounded-[2rem] flex items-center justify-center text-3xl font-sans font-black  text-slate-900 hover:border-primary/20 hover:bg-white active:scale-90 transition-all shadow-sm group"
             >
               <span className="group-active:scale-150 transition-transform duration-200">0</span>
             </button>

             <button
               onClick={onDeleteClick}
               className="h-20 bg-primary border-2 border-primary rounded-[2rem] flex flex-col items-center justify-center gap-1 group active:scale-95 transition-all shadow-xl shadow-primary/10"
             >
               <Delete size={20} className="text-white group-hover:-translate-x-1 transition-transform" />
               <span className="text-[9px] font-black uppercase tracking-widest text-white/70 ">แก้ไข</span>
             </button>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="text-center pt-8 shrink-0">
           <p className="text-[8px] font-black text-slate-200 uppercase tracking-[0.5em] ">Chokdee Official - Security Input Node</p>
        </div>

      </div>
    </div>
  );
};

export default NumberKeypad;

