'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { calculateExportCost, formatMNT } from '@/lib/calculator';

type Car = {
  id: string;
  url: string;
  title: string;
  year: string;
  mileage: string;
  fuel: string;
  transmission: string;
  color: string;
  price_krw: number;
  image_urls: string;
  options?: string;
  frame_status?: string;
  exterior_status?: string;
  my_car_damage?: string;
  other_car_damage?: string;
};

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('car');
    if (stored) {
      setCar(JSON.parse(stored));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!car) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  let images: string[] = [];
  try { images = JSON.parse(car.image_urls); } catch { images = []; }
  const proxyImg = (src: string) => `/api/image?url=${encodeURIComponent(src)}`;

  const cost = calculateExportCost(car.price_krw);

  const specs = [
    { label: 'Үйлдвэрлэсэн он', value: car.year },
    { label: 'Гүйлт', value: car.mileage },
    { label: 'Шатахуун', value: car.fuel },
    { label: 'Хурдны хайрцаг', value: car.transmission },
    { label: 'Өнгө', value: car.color },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-32 font-sans">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur sticky top-0 z-40">
        <button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[15px] font-bold text-gray-900">Машины дэлгэрэнгүй</span>
        <button className="p-2 -mr-2 text-gray-900">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
        </button>
      </div>

      {/* Image Gallery */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden px-4 pt-2 pb-4">
        {images.length > 0 ? (
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proxyImg(images[activeImg])}
              alt={car.title}
              className="w-full h-full object-cover"
            />
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.slice(0, 6).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-1.5 h-1.5 rounded-full transition ${i === activeImg ? 'bg-white' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            )}
            {/* Arrow buttons */}
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImg(p => Math.max(0, p - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 rounded-full text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => setActiveImg(p => Math.min(images.length - 1, p + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 rounded-full text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-white rounded-2xl mt-2 mx-4 shadow-sm">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="px-5 pt-3 mb-6 block bg-white">
        <p className="text-[#0047FF] text-[11px] font-bold tracking-wider mb-2 uppercase">ДУГААР {car.id}</p>
        <h1 className="text-xl font-extrabold leading-tight mb-2 text-gray-900 uppercase">{car.title}</h1>
        <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium mb-3">
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Premium</span>
          <span>{car.year.replace('식', '')} • {car.mileage} • {car.fuel}</span>
        </div>
        <div className="text-[22px] font-black text-gray-900 flex items-baseline gap-2">
          {car.price_krw > 0 ? (
            <>
              {(car.price_krw / 10000).toLocaleString()}만원
              <span className="text-[13px] font-semibold text-gray-400">
                 (₩ {car.price_krw.toLocaleString()})
              </span>
            </>
          ) : (
            'Үнэ тодорхойгүй'
          )}
        </div>
      </div>

      {/* Specs Card */}
      <div className="mx-5 mb-4 bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
        <h3 className="text-gray-900 font-bold text-[15px] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
          Машины мэдээлэл
        </h3>
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
          <div>
            <p className="text-gray-400 text-[11px] mb-1">Марк / Загвар</p>
            <p className="text-gray-900 text-[13px] font-medium">{car.title}</p>
          </div>
          <div>
            <p className="text-gray-400 text-[11px] mb-1">Он</p>
            <p className="text-gray-900 text-[13px] font-medium">{car.year}</p>
          </div>
          <div>
            <p className="text-gray-400 text-[11px] mb-1">Түлшний төрөл</p>
            <p className="text-gray-900 text-[13px] font-medium">{car.fuel}</p>
          </div>
          <div>
            <p className="text-gray-400 text-[11px] mb-1">Хурдны хайрцаг</p>
            <p className="text-gray-900 text-[13px] font-medium">{car.transmission}</p>
          </div>
        </div>
      </div>

      {/* Diagnosis & History Info */}
      {(car.frame_status || car.exterior_status || car.my_car_damage || car.other_car_damage) && (
        <div className="mx-5 mb-4 bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
          <h3 className="text-gray-900 font-bold text-[15px] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm4-4H7v-2h9v2zm0-4H7V7h9v2z"/></svg>
            Энка оношилгоо & Түүх
          </h3>
          <div className="space-y-3">
             <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                     <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17a.996.996 0 0 1-.71-.29L4.55 12.1a1 1 0 0 1 1.41-1.42l2.33 2.33L18.04 3.76a1 1 0 0 1 1.41 1.41z" /></svg>
                   </div>
                   <span className="text-gray-800 text-[13px] font-medium">Техникийн хяналт</span>
                </div>
                <span className="text-gray-500 text-[12px]">{car.frame_status || 'Тэнцсэн'}</span>
             </div>
             <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <span className="text-gray-800 text-[13px] font-medium">Осол гаргасан түүх</span>
                </div>
                <span className="text-gray-500 text-[12px]">{car.my_car_damage && car.my_car_damage !== 'Мэдээлэлгүй' ? 'Байгаа' : 'Байхгүй'}</span>
             </div>
          </div>
        </div>
      )}

      {/* Options */}
      {car.options && car.options !== '[]' && (
        <div className="mx-5 mb-4 bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
          <h3 className="text-gray-900 font-bold text-[15px] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Үндсэн тоноглол
          </h3>
          <div className="flex flex-wrap gap-2">
            {JSON.parse(car.options).map((opt: string, idx: number) => (
              <span key={idx} className="bg-gray-100 text-gray-700 text-[11px] font-medium px-3 py-1.5 rounded-full">
                {opt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="mx-5 mb-6 bg-[#0038FF] rounded-2xl p-5 shadow-lg shadow-blue-500/20 text-white">
        <h3 className="font-bold text-[15px] mb-5 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          Монгол хүргэлтийн нийт тооцоо
        </h3>
        <div className="space-y-4">
          <CostRow label="Машины үнэ (KRW)" value={`₩ ${(car.price_krw).toLocaleString()}`} />
          <CostRow label="Тээврийн зардал" value="₩ 1,200,000" />
          <CostRow label="Гаалийн татвар" value="₩ 4,800,000" />
          
          <div className="pt-5 flex justify-between font-extrabold text-[17px] border-t border-blue-400/30">
            <span>Нийт дүн (₮)</span>
            <span>₩ {(car.price_krw + 1200000 + 4800000).toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-5 bg-white/10 rounded-xl p-3">
           <p className="text-white/80 text-[10px] italic leading-relaxed">
             * Энэхүү тооцоо нь ойролцоо бөгөөд ханш болон бусад нөхцөлөөс шалтгаалж өөрчлөгдөх боломжтой.
           </p>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 z-50">
        <button
          onClick={() => router.push(`/request/${id}`)}
          className="w-full bg-[#0047FF] hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_rgb(0,71,255,0.25)] transition-all flex items-center justify-center gap-2 text-[15px]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Нэхэмжлэх захиалга илгээх
        </button>
      </div>
    </main>
  );
}

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-[12px]">
      <span className="text-white/90">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
