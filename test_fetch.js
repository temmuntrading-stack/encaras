const cheerio = require('cheerio');
const fs = require('fs');

async function testFetch(carId) {
  const res = await fetch(`https://fem.encar.com/cars/detail/${carId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'ko-KR,ko;q=0.9',
    }
  });
  const html = await res.text();
  fs.writeFileSync('fem_html.txt', html);
  
  const $ = cheerio.load(html);
  
  // Remove scripts and styles to get clean text
  $('script').remove();
  $('style').remove();
  $('noscript').remove();
  
  const bodyText = $('body').text();
  const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);
  
  // Save clean text
  fs.writeFileSync('fem_text.txt', lines.join('\n'));
  console.log('Saved fem_html.txt and fem_text.txt');
  console.log('Total lines:', lines.length);
  
  // Check key data presence
  console.log('Contains 연식:', lines.some(l => l.includes('연식')));
  console.log('Contains 만원:', lines.some(l => l.includes('만원')));
  console.log('Contains 주요옵션:', lines.some(l => l.includes('주요옵션')));
  
  // Print lines with key data
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('연식') || lines[i].includes('만원') || lines[i].match(/^[0-9,]+km$/) || lines[i].match(/가솔린|디젤/) || lines[i].includes('주요옵션')) {
      console.log(`Line ${i}: "${lines[i]}"`);
    }
  }
}

testFetch('41644496').catch(console.error);
