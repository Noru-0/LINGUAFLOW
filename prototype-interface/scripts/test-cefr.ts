import axios from 'axios';
import * as cheerio from 'cheerio';

async function test(w: string) {
  try {
    const resVi = await axios.get(`https://dictionary.cambridge.org/vi/dictionary/english-vietnamese/${w}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36' }
    });
    const $vi = cheerio.load(resVi.data);
    console.log(`=== VI DICT FOR '${w}' ===`);
    $vi('.def-block, .def-head, .pos-header, .entry-body__el, .ddef_block, .def-block').each((_, el) => {
      const level1 = $vi(el).find('.epp-xref, .dxref, .cefr, [class*="epp"], [class*="cefr"], [class*="dxref"]').text().trim();
      if (level1) {
        console.log('Found VI level:', level1);
      }
    });

    const resEn = await axios.get(`https://dictionary.cambridge.org/dictionary/english/${w}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36' }
    });
    const $en = cheerio.load(resEn.data);
    console.log(`=== EN DICT FOR '${w}' ===`);
    $en('.def-block, .def-head, .pos-header, .entry-body__el, .ddef_block, .ddef-head').each((_, el) => {
      const level = $en(el).find('.epp-xref, .dxref, .cefr, [class*="epp"], [class*="cefr"], [class*="dxref"]').text().trim();
      if (level) {
        console.log('Found EN level:', level);
      }
    });
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

async function run() {
  await test('accomplish');
  await test('raid');
  await test('resilience');
  await test('innovative');
}

run();
