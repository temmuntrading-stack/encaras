import { NextRequest, NextResponse } from 'next/server';
import { translate, translateTextContaining } from '@/lib/translator';
import puppeteer from 'puppeteer-core';
import fs from 'fs';

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
// Scrape using Puppeteer to bypass JS bot protection
// ─────────────────────────────────────────────────────────────────────
async function scrapeWithPuppeteer(carId: string) {
  const executablePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/opt/google/chrome/chrome'
  ];
  
  let browser;
  for (const p of executablePaths) {
    if (fs.existsSync(p)) {
      try {
        browser = await puppeteer.launch({ 
          executablePath: p, 
          headless: true, // changed from 'new' to true for TS compatibility
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        break;
      } catch (e) {
        // ignore and try next
      }
    }
  }

  if (!browser) {
    throw new Error('서버에 브라우저(Chrome/Edge)가 설치되어 있지 않습니다.');
  }

  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ko-KR,ko;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    // Use the mobile site as it doesn't redirect headless browsers as strictly
    const url = `https://fem.encar.com/cars/detail/${carId}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait explicitly for the price or options to appear, or max 3 seconds
    try {
       await page.waitForFunction(() => {
          return document.body.innerText.includes('만원') || document.body.innerText.includes('주요옵션');
       }, { timeout: 3000 });
    } catch(e) { /* ignore timeout */ }
    
    // Additional pause to ensure CSR finishes rendering everything
    await new Promise(r => setTimeout(r, 2000));
    
    const data = await page.evaluate((carId) => {
      // 1. Text parsing for specs & price
      const text = document.body.innerText;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      
      let year = '', mileage = '', fuel = '', transmission = '오토', color = '';
      let price_krw = 0;
      let title = '';
      
      for (let i = 0; i < lines.length; i++) {
         const line = lines[i];
         
         // Price 
         if (line.match(/^[0-9,]+만?원$/)) {
             const v = parseInt(line.replace(/[^0-9]/g, ''), 10);
             if (v > 0 && price_krw === 0) price_krw = line.includes('만') ? v * 10000 : v;
         } else if (line.match(/^[0-9,]+$/) && lines[i+1] === '만원') {
             const v = parseInt(line.replace(/[^0-9]/g, ''), 10);
             if (v > 0 && price_krw === 0) price_krw = v * 10000;
         }
         
         // Specs
         if (line.includes('연식') && lines[i+1] && lines[i+1].match(/[0-9]{2}\/[0-9]{2}식/)) year = lines[i+1];
         else if (line.match(/^[0-9]{2}\/[0-9]{2}식/)) year = line;
         
         if (line.includes('주행거리') && lines[i+1] && lines[i+1].includes('km')) mileage = lines[i+1];
         else if (line.match(/^[0-9,]+km$/i)) mileage = line;
         
         if (line === '연료' && lines[i+1] && lines[i+1].match(/가솔린|디젤|LPG|하이브리드|전기|수소/)) fuel = lines[i+1];
         else if (line.match(/^(가솔린|디젤|LPG|하이브리드|전기|수소)$/)) fuel = line;
         
         // Title is usually a few lines before '연식' and has vehicle name length.
         // We can find it by looking backwards from '연식'
         if ((line.includes('연식') || line.match(/^[0-9]{2}\/[0-9]{2}식/)) && !title) {
            // go back a few lines
            for (let j = 1; j <= 5; j++) {
               if (i-j >= 0 && lines[i-j].length > 4 && !lines[i-j].includes('사진') && !lines[i-j].includes('이전이미지')) {
                  title = lines[i-j];
                  break;
               }
            }
         }
      }

      // Options
      const options: string[] = [];
      document.querySelectorAll('.list_option li').forEach(li => {
         const optName = li.querySelector('.name');
         if (optName && optName.textContent) {
            options.push(optName.textContent.trim());
         }
      });
      // Fallback for options if different structure
      if (options.length === 0) {
         document.querySelectorAll('.cars_option li, .box_opt li').forEach(el => {
            if (el.textContent) options.push(el.textContent.trim());
         });
         
         if (options.length === 0) {
           const dts = Array.from(document.querySelectorAll('dt'));
           const optDt = dts.find(d => d.textContent?.includes('주요옵션'));
           if (optDt && optDt.nextElementSibling) {
              optDt.nextElementSibling.querySelectorAll('span').forEach(span => {
                 if (span.textContent) options.push(span.textContent.trim());
              });
           }
         }
      }

      // Text fallback
      if (options.length === 0) {
         const optStartIdx = lines.findIndex(l => l.includes('주요옵션'));
         if (optStartIdx !== -1) {
            for (let i = optStartIdx + 1; i < lines.length; i++) {
                if (lines[i] === '차량 상태' || lines[i] === '차량이력' || lines[i].includes('옵션 모두보기')) break;
                if (lines[i] === '있음' && lines[i-1]) {
                    let optName = lines[i-1];
                    if (optName.startsWith('(') && lines[i-2]) {
                       optName = lines[i-2] + ' ' + optName;
                    }
                    if (optName !== '옵션 설명 보기') {
                       options.push(optName);
                    }
                }
            }
         }
      }

      // Diagnosis (Frame/Exterior)
      let frameStatus = '', exteriorStatus = '';
      const diagWrap = document.querySelector('.wrap_diagnosis, .box_health');
      if (diagWrap) {
         const rows = diagWrap.querySelectorAll('dl, li, tr');
         rows.forEach(row => {
            const text = row.textContent || '';
            if (text.includes('프레임')) {
               if (text.includes('정상')) frameStatus = '정상';
               else if (text.includes('교환')) frameStatus = '교환';
            }
            if (text.includes('외부패널')) {
               if (text.includes('정상')) exteriorStatus = '정상';
               else if (text.includes('교환')) exteriorStatus = '교환';
               else if (text.includes('판금')) exteriorStatus = '판금';
            }
         });
      }

      // Accident History
      let myCarDamage = '', otherCarDamage = '';
      const historyWrap = document.querySelector('.wrap_history, .box_history');
      if (historyWrap) {
         const texts = Array.from(historyWrap.querySelectorAll('dt, dd, span, p')).map(e => e.textContent || '');
         for (let i = 0; i < texts.length; i++) {
            if (texts[i].includes('내차 피해') && texts[i+1]) myCarDamage = texts[i+1].trim();
            if (texts[i].includes('타차 가해') && texts[i+1]) otherCarDamage = texts[i+1].trim();
         }
      }

      // Fallback history text search
      if (!myCarDamage && text.includes('내차 피해')) {
         const m = text.match(/내차 피해\s*(총[^원]+원[^)]+\)|없음|[0-9,]+원)/);
         if (m) myCarDamage = m[1];
      }
      if (!otherCarDamage && text.includes('타차 가해')) {
         const m = text.match(/타차 가해\s*(총[^원]+원[^)]+\)|없음|[0-9,]+원)/);
         if (m) otherCarDamage = m[1];
      }

      // Images
      const imgUrls: string[] = [];
      Array.from(document.querySelectorAll('img')).forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
        if (src && (src.includes('ci.encar.com') || src.includes('image.encar.com')) && !src.includes('logo') && !src.includes('icon')) {
          imgUrls.push(src);
        }
      });
      const uniqueImgs = Array.from(new Set(imgUrls));
      if (uniqueImgs.length === 0) {
         uniqueImgs.push(`https://ci.encar.com/carpicture${carId}/001.jpg`);
      }

      return {
        title: title || `엔카 차량 #${carId}`,
        price_krw,
        year,
        mileage,
        fuel,
        transmission,
        color,
        options,
        frameStatus,
        exteriorStatus,
        myCarDamage,
        otherCarDamage,
        imageUrls: uniqueImgs.slice(0, 10)
      };
    }, carId);

    console.log('--- Puppeteer Extracted Data ---', data);
    return data;
  } finally {
    await browser.close();
  }
}

// ─────────────────────────────────────────────────────────────────────
// POST /api/car  { url: string }
// ─────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawUrl: string = body?.url ?? '';

    if (!rawUrl.includes('encar.com')) {
      return NextResponse.json({ error: '엔카 URL만 지원됩니다.' }, { status: 400 });
    }

    const carId = extractEncarId(rawUrl);
    if (!carId) {
      return NextResponse.json({ error: 'URL에서 차량 ID를 찾을 수 없습니다.' }, { status: 400 });
    }

    // Attempt Scraping
    const parsed = await scrapeWithPuppeteer(carId);

    if (!parsed || !parsed.title) {
      return NextResponse.json({ error: '데이터를 가져오지 못했습니다. (판매 완료 또는 봇 차단)' }, { status: 502 });
    }

    const car: CarRecord = {
      id: carId,
      url: `https://fem.encar.com/cars/detail/${carId}`,
      title: translateTextContaining(parsed.title) || `엔카 차량 #${carId}`,
      year: parsed.year,
      mileage: parsed.mileage.replace('km', ' км').replace('만km', '만 км'),
      fuel: translate(parsed.fuel),
      transmission: translate(parsed.transmission),
      color: translate(parsed.color),
      price_krw: parsed.price_krw,
      image_urls: JSON.stringify(parsed.imageUrls),
      options: JSON.stringify((parsed.options || []).map(o => translate(o))),
      frame_status: translate(parsed.frameStatus || ''),
      exterior_status: translate(parsed.exteriorStatus || ''),
      my_car_damage: translate(parsed.myCarDamage || ''),
      other_car_damage: translate(parsed.otherCarDamage || '')
    };

    return NextResponse.json({ car });

  } catch (err: unknown) {
    console.error('Car API error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
