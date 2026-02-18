
import React from 'react';

interface ShareActionProps {
  title: string;
  text: string;
  url?: string;
  image?: string;
  variant?: 'minimal' | 'full';
}

const ShareAction: React.FC<ShareActionProps> = ({ title, text, url = window.location.href, image, variant = 'minimal' }) => {
  const shareData = {
    title: `Noor Wisdom: ${title}`,
    text: `${text}\n\nShared via Noor AI`,
    url: url,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      // Fallback: Copy to clipboard or open custom menu
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const fullText = `${text}\n\n${url}\n\n— Shared via Noor AI`;
    navigator.clipboard.writeText(fullText);
    alert("Wisdom copied to clipboard for sharing.");
  };

  const shareToWhatsApp = () => {
    const encodedText = encodeURIComponent(`${text}\n\nRead more at: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const shareToFacebook = () => {
    const encodedUrl = encodeURIComponent(url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-1.5 md:gap-2">
        <button 
          onClick={handleNativeShare}
          className="p-3 bg-[#F7F5EF] text-[#7A7A7A] rounded-xl hover:text-[#C6A85E] active:scale-95 transition-all shadow-sm flex items-center justify-center"
          title="Share via Instagram / Mobile"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
        </button>
        <button 
          onClick={shareToWhatsApp}
          className="p-3 bg-[#E6F4EC] text-[#1E8E5F] rounded-xl hover:bg-emerald-100 active:scale-95 transition-all shadow-sm flex items-center justify-center"
          title="Share to WhatsApp"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.413-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.654zm6.749-3.936c1.55.918 3.012 1.398 4.781 1.399 5.227 0 9.482-4.254 9.485-9.482.001-2.533-.988-4.913-2.783-6.708-1.795-1.795-4.175-2.784-6.708-2.784-5.231 0-9.486 4.255-9.489 9.483-.001 1.908.525 3.391 1.546 4.937l-.938 3.421 3.506-.92zm9.961-6.221c-.24-.12-.442-.19-.442-.19s-.201-.089-.481.18c-.28.271-.561.569-.687.684-.126.115-.251.127-.491.007-.24-.12-.914-.337-1.741-1.074-.643-.573-1.078-1.28-1.204-1.498-.125-.218-.013-.335.107-.454.108-.108.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.481-1.16-.659-1.589-.174-.419-.347-.361-.481-.361-.134 0-.28-.01-.442-.01-.161 0-.422.06-.643.3-.221.24-.843.823-.843 2.008 0 1.185.863 2.329.983 2.489.12.16 1.7 2.595 4.118 3.639.575.249 1.025.397 1.375.508.578.183 1.104.157 1.519.095.463-.07 1.417-.58 1.619-1.14.201-.56.201-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="text-[10px] font-black uppercase text-[#7A7A7A] tracking-widest text-center">Share this Barakah</p>
      <div className="grid grid-cols-3 gap-3">
        <button 
          onClick={handleNativeShare}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#E5E2D8] active:bg-slate-50 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </div>
          <span className="text-[8px] font-black uppercase">Instagram</span>
        </button>
        <button 
          onClick={shareToWhatsApp}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#E5E2D8] active:bg-slate-50 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <span className="text-[8px] font-black uppercase">WhatsApp</span>
        </button>
        <button 
          onClick={shareToFacebook}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#E5E2D8] active:bg-slate-50 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </div>
          <span className="text-[8px] font-black uppercase">Facebook</span>
        </button>
      </div>
    </div>
  );
};

export default ShareAction;
