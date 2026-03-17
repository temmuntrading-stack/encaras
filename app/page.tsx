'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Алдаа гарлаа. Дахин оролдоно уу.');
        return;
      }
      // Pass car data via sessionStorage to avoid long URL
      sessionStorage.setItem('car', JSON.stringify(data.car));
      router.push(`/car/${data.car.id}`);
    } catch {
      setError('Серверт холбогдож чадсангүй. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <span className="text-gray-900 font-bold text-xl tracking-tight">MongolHub Cars</span>
        </div>
        <button className="text-gray-600 p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center px-6 py-8 text-center mt-4">
        <div className="mb-6 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold tracking-widest uppercase">
          СОЛОНГОСООС МОНГОЛ РУУ
        </div>
        <h1 className="text-[32px] sm:text-4xl font-extrabold text-gray-900 leading-[1.15] mb-6">
          Солонгосын<br/>машиныг<br/>монголоор харна<br/>уу
        </h1>
        <p className="text-gray-500 text-[15px] sm:text-base max-w-[280px] sm:max-w-sm mb-12 leading-relaxed">
          Encar.com дээрх машины холбоосыг хуулж тавиад дэлгэрэнгүй мэдээллийг монгол хэлээр авна уу.
        </p>

        {/* Search Card */}
        <form onSubmit={handleSearch} className="w-full max-w-md">
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-gray-200/50">
            <label className="block text-gray-800 text-[13px] font-semibold mb-3 text-left">
              Encar.com машины холбоос
            </label>
            <div className="relative mb-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.encar.com/dc/dc_"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-2xl px-4 py-4 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition pr-10"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 text-red-500 text-xs bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-left">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0047FF] hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-[0_8px_20px_rgb(0,71,255,0.25)] text-[15px] flex items-center justify-center gap-2"
            >
              {loading ? 'Уншиж байна...' : 'Машин хайх'}
            </button>
            
            <p className="mt-5 text-gray-400 text-[11px] leading-relaxed">
              Жишээ нь:<br/>www.encar.com/dc/dc_cardetailview.do?<br/>carid=12345678
            </p>
          </div>
        </form>
      </section>

      {/* Feature Icons */}
      <section className="px-6 py-8 flex justify-between max-w-sm mx-auto w-full mb-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
          </div>
          <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">Монгол хэл</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
          <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">Экспортын<br/>тооцоо</span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">Нэхэмжлэх<br/>захиалга</span>
        </div>
      </section>

      {/* Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-between px-8 py-3 pb-safe z-50">
        <button className="flex flex-col items-center gap-1.5 min-w-[64px]">
          <svg className="w-6 h-6 text-[#0047FF]" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span className="text-[9px] font-bold text-[#0047FF] uppercase tracking-wider">НҮҮР</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 min-w-[64px]">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">ХАЙЛТ</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 min-w-[64px]">
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">миний</span>
        </button>
      </nav>
    </main>
  );
}
