import { NextRequest, NextResponse } from 'next/server';
import { translate, translateTextContaining } from '@/lib/translator';

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────
type CarRecord = {
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
  options: string;
  frame_status: string;
  exterior_status: string;
  my_car_damage: string;
  other_car_damage: string;
};

// ─────────────────────────────────────────────────────────────────────
// Extract Car ID from any Encar URL format
// ─────────────────────────────────────────────────────────────────────
function extractEncarId(url: string): string | null {
  const m = url.match(/car[Ii]d=(\d+)/i);
  if (m) return m[1];
  const m3 = url.match(/\/(?:cars?|detail)\/(\d{6,})/i);
  if (m3) return m3[1];
  const m4 = url.match(/(\d{7,})/);
  if (m4) return m4[1];
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// Remove HTML tags from a string
// ─────────────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─────────────────────────────────────────────────────────────────────
// Extract image URLs from HTML using regex
// ─────────────────────────────────────────────────────────────────────
function extractImages(html: string): string[] {
  const imgRegex = /(?:src|data-src)=["']([^"']*(?:ci\.encar\.com|image\.encar\.com)[^"']*)/gi;
  const urls: string[] = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    let src = match[1];
    if (src && !src.includes('logo') && !src.includes('icon')) {
      if (src.startsWith('//')) src = 'https:' + src;
      if (urls.indexOf(src) === -1) urls.push(src);
    }
  }
  return urls;
}

// ─────────────────────────────────────────────────────────────────────
// Scrape using fetch + regex (works on Cloudflare Workers)
// ─────────────────────────────────────────────────────────────────────
async function scrapeWithFetch(carId: string) {
  const url = 'https://fem.encar.com/cars/detail/' + carId;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9',
    },
  });

  if (!res.ok) {
    throw new Error('Encar returned status ' + res.status);
  }

  const html = await res.text();
  const bodyText = stripHtml(html);

  // Parse specs using regex on the clean text
  let title = '';
  let year = '';
  let mileage = '';
  let fuel = '';
  const transmission = '오토';
  const color = '';
  let price_krw = 0;

  // Title: text between "사진 모두보기" and "연식"
  const titleMatch = bodyText.match(/사진 모두보기\s+(.+?)\s+연식/);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  // Year
  const yearMatch = bodyText.match(/연식\s*(\d{2}\/\d{2}식(?:\s*\(\d+년형\))?)/);
  if (yearMatch) year = yearMatch[1].trim();

  // Mileage
  const mileageMatch = bodyText.match(/주행거리\s*([0-9,]+km)/);
  if (mileageMatch) mileage = mileageMatch[1];

  // Fuel
  const fuelMatch = bodyText.match(/연료\s*(가솔린|디젤|LPG|하이브리드|전기|수소)/);
  if (fuelMatch) fuel = fuelMatch[1];

  // Price: look for NNN만원 pattern before 총비용계산기
  const beforeCalc = bodyText.split('총비용계산기')[0] || bodyText;
  const priceMatches = beforeCalc.match(/(\d{1,4},?\d{0,3})만원/g);
  if (priceMatches) {
    const lastPrice = priceMatches[priceMatches.length - 1];
    const v = parseInt(lastPrice.replace(/[^0-9]/g, ''), 10);
    if (v > 0) price_krw = v * 10000;
  }

  // Options: extract "옵션명 있음" patterns from the options section
  const options: string[] = [];
  const optSection = bodyText.match(/옵션 설명 보기([\s\S]*?)(?:\d+개 옵션 모두보기|차량 상태|렌트 정보|차량이력)/);
  if (optSection) {
    const optText = optSection[1];
    const optPairs = optText.match(/([^\s]+(?:\s*\([^)]+\))?)\s+있음/g);
    if (optPairs) {
      for (let i = 0; i < optPairs.length; i++) {
        const optName = optPairs[i].replace(/\s+있음$/, '').trim();
        if (optName && optName !== '옵션 설명 보기') {
          options.push(optName);
        }
      }
    }
  }

  // Accident history
  let myCarDamage = '';
  let otherCarDamage = '';
  const myDamageMatch = bodyText.match(/내차 피해\s*(총\s*[0-9,]+원\s*\(\d+회\)|없음)/);
  if (myDamageMatch) myCarDamage = myDamageMatch[1].trim();
  const otherDamageMatch = bodyText.match(/타차 가해\s*(총\s*[0-9,]+원\s*\(\d+회\)|없음)/);
  if (otherDamageMatch) otherCarDamage = otherDamageMatch[1].trim();

  // Frame status
  let frameStatus = '';
  if (bodyText.includes('프레임') && bodyText.includes('무사고')) frameStatus = '무사고';

  // Images from HTML
  const imageUrls = extractImages(html);
  if (imageUrls.length === 0) {
    imageUrls.push('https://ci.encar.com/carpicture/carpicture' + carId.substring(0, 2) + '/pic' + carId.substring(0, 4) + '/' + carId + '_001.jpg');
  }

  return {
    title: title || ('엔카 차량 #' + carId),
    price_krw,
    year,
    mileage,
    fuel,
    transmission,
    color,
    options,
    frameStatus,
    myCarDamage,
    otherCarDamage,
    imageUrls: imageUrls.slice(0, 10),
  };
}

// ─────────────────────────────────────────────────────────────────────
// POST /api/car  { url: string }
// ─────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawUrl: string = body?.url ?? '';

    if (!rawUrl.includes('encar.com') && !rawUrl.match(/\d{7,}/)) {
      return NextResponse.json({ error: '엔카 URL만 지원됩니다.' }, { status: 400 });
    }

    const carId = extractEncarId(rawUrl);
    if (!carId) {
      return NextResponse.json({ error: 'URL에서 차량 ID를 찾을 수 없습니다.' }, { status: 400 });
    }

    const parsed = await scrapeWithFetch(carId);

    if (!parsed || !parsed.title) {
      return NextResponse.json({ error: '데이터를 가져오지 못했습니다.' }, { status: 502 });
    }

    const translatedOptions = [];
    for (let i = 0; i < (parsed.options || []).length; i++) {
      translatedOptions.push(translate(parsed.options[i]));
    }

    const car: CarRecord = {
      id: carId,
      url: 'https://fem.encar.com/cars/detail/' + carId,
      title: translateTextContaining(parsed.title) || ('엔카 차량 #' + carId),
      year: parsed.year,
      mileage: parsed.mileage.replace('km', ' км').replace('만km', '만 км'),
      fuel: translate(parsed.fuel),
      transmission: translate(parsed.transmission),
      color: translate(parsed.color),
      price_krw: parsed.price_krw,
      image_urls: JSON.stringify(parsed.imageUrls),
      options: JSON.stringify(translatedOptions),
      frame_status: translate(parsed.frameStatus || ''),
      exterior_status: '',
      my_car_damage: translate(parsed.myCarDamage || ''),
      other_car_damage: translate(parsed.otherCarDamage || ''),
    };

    return NextResponse.json({ car });

  } catch (err: unknown) {
    console.error('Car API error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
