'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();
  const [name, setName] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('requestForm');
    if (stored) {
      const data = JSON.parse(stored);
      setName(data.name || '');
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center px-5 py-10">
      {/* Success icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {/* Sparkles */}
        <span className="absolute -top-1 -right-1 text-2xl animate-bounce">✨</span>
        <span className="absolute -bottom-2 -left-2 text-xl animate-bounce delay-150">🎉</span>
      </div>

      <h1 className="text-2xl font-extrabold text-white text-center mb-2">
        Захиалга амжилттай илгээгдлээ!
      </h1>
      {name && (
        <p className="text-slate-300 text-center mb-2">
          Сайн байна уу, <span className="font-semibold text-white">{name}</span> таны захиалга хүлээн авлаа.
        </p>
      )}
      <p className="text-slate-400 text-center text-sm max-w-xs mb-8 leading-relaxed">
        Манай мэргэжилтэн тантай <span className="text-blue-400 font-medium">24 цагийн дотор</span> холбогдоно. Та утасны дугаараа нээлттэй байнгал хүлээнэ үү.
      </p>

      {/* Info card */}
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📞</span>
          <div>
            <p className="text-slate-400 text-xs">Утасны холбоо</p>
            <p className="text-white font-semibold text-sm">+976 9900-0000</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">📨</span>
          <div>
            <p className="text-slate-400 text-xs">И-мэйл</p>
            <p className="text-white font-semibold text-sm">info@mongolhubcars.mn</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <p className="text-slate-400 text-xs">Facebook Messenger</p>
            <p className="text-white font-semibold text-sm">@MongolHubCars</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={() => router.push('/')}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition text-base"
        >
          🔍 Дахин машин хайх
        </button>
        <button
          onClick={() => {
            sessionStorage.clear();
            router.push('/');
          }}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 rounded-2xl transition text-sm"
        >
          Нүүр хуудас руу буцах
        </button>
      </div>
    </main>
  );
}
