'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RequestPage() {
  const router = useRouter();
  const { id } = useParams();

  const [carTitle, setCarTitle] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', note: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('car');
    if (stored) {
      const car = JSON.parse(stored);
      setCarTitle(car.title);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending request (wire up to email/Telegram later)
    await new Promise(r => setTimeout(r, 1500));
    sessionStorage.setItem('requestForm', JSON.stringify({ ...form, carId: id, carTitle }));
    router.push('/success');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white pb-10">
      {/* Nav */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm text-slate-400">Нэхэмжлэх захиалга</span>
      </div>

      <div className="px-4 pt-2">
        {/* Car reminder */}
        {carTitle && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
            <span className="text-2xl">🚗</span>
            <div>
              <p className="text-xs text-blue-400 font-semibold mb-0.5">Сонгосон машин</p>
              <p className="text-white text-sm leading-snug">{carTitle}</p>
            </div>
          </div>
        )}

        <h1 className="text-xl font-bold mb-1">Холбоо барих мэдээлэл</h1>
        <p className="text-slate-400 text-sm mb-6">Та доорх маягтыг бөглөнө үү. Бид тантай 24 цагийн дотор холбогдоно.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 font-medium mb-1.5">Таны нэр *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Жишээ нь: Болд Баатар"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 font-medium mb-1.5">Утасны дугаар *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="+976 9911 2233"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 font-medium mb-1.5">И-мэйл хаяг</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 font-medium mb-1.5">Нэмэлт тэмдэглэл</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              placeholder="Жишээ нь: Уур мандал, тоноглол талаар асуух зүйл..."
              className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition flex items-center justify-center gap-2 text-base mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Илгээж байна...
              </>
            ) : (
              '📬 Захиалга илгээх'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
