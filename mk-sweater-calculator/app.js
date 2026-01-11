document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     POMOCNÉ FUNKCE
  ========================== */

  const $ = (id) => document.getElementById(id);

  const EVEN = (n) => Math.round(n / 2) * 2;

  function readInt(id, fallback) {
    const el = $(id);
    if (!el) return fallback;
    const v = Number(el.value);
    return Number.isFinite(v) ? Math.round(v) : fallback;
  }

  function readFloat(id, fallback) {
    const el = $(id);
    if (!el) return fallback;
    const v = Number(el.value);
    return Number.isFinite(v) ? v : fallback;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  /* =========================
     HLAVNÍ VÝPOČET
  ========================== */

  function generate() {

    /* === 1) VSTUPY === */

    const chest = readInt('chest', 96);          // obvod hrudníku
    const ease  = readInt('fit', 10);            // volnost
    const finished = chest + ease;               // hotový obvod

    const sts  = readInt('sts', 22);              // oka / 10 cm
    const rows = readInt('rows', 30);             // řady / 10 cm

    const armCirc = readInt('armCirc', 36);       // obvod paže
    const sleeveOverride = readInt('sleeveTopOverride', null);

    const armRatio = clamp(readFloat('armRatio', 0.245), 0.18, 0.30);

    /* === 2) ZÁKLADNÍ PŘEPOČTY === */

    const stsPerCm  = sts / 10;
    const rowsPerCm = rows / 10;

    const totalSts = EVEN(finished * stsPerCm);
    const pieceSts = totalSts / 2;

    /* === 3) TĚLO A PRŮRAMEK === */

    const armDepthCm = Math.round(finished * armRatio * 10) / 10;
    const armRows    = EVEN(Math.round(armDepthCm * rowsPerCm));

    const armholeBO    = 3;     // pevná KF logika
    const armholeDrop  = 12;
    const armholeDec   = Math.max(0, Math.floor((armholeDrop - armholeBO * 2) / 2));
    const bodyAfterArm = EVEN(pieceSts - armholeDrop);

    /* === 4) RUKÁV === */

    let sleeveTop;
    if (sleeveOverride && sleeveOverride > 0) {
      sleeveTop = EVEN(sleeveOverride);
    } else {
      sleeveTop = EVEN(armCirc * stsPerCm);
    }

    const sleeveLenCm = Math.round(finished * 0.45);

   /* === 4b) TVAROVÁNÍ RUKÁVOVÉ KOULE === */
// Rukávová koule by měla mít cca stejnou výšku jako průramek, 
// ale končíme dřív, aby nebyla špičatá.
const capRows = Math.round(armRows * 0.9); 
const capBO = armholeBO; // Začínáme stejným uzavřením jako u těla

// Počáteční uzavření na obou stranách
let currentCapSts = sleeveTop - (capBO * 2);

// Výpočet postupného ujímání (každá 2. řada)
// Cílem je nechat nahoře cca 25-30 % ok pro ploché uzavření
const targetTopSts = EVEN(sleeveTop * 0.25);
const stsToDecrease = currentCapSts - targetTopSts;
const capDecSteps = Math.floor(stsToDecrease / 2); // kolikrát ubereme 1 oko na každé straně
    
    /* === 5) VÝSTUP === */

    const out = $('out');

    out.innerHTML = `
      <h3>Návod k pletení – svetr s všitým rukávem</h3>
<div style="text-align: center; margin: 20px 0; background: #fff; padding: 10px; border: 1px solid #eee; border-radius: 10px;">
                    <svg viewBox="0 0 400 220" width="100%" style="max-width: 400px;">
                        <rect x="150" y="100" width="100" height="100" fill="none" stroke="#ee6e62" stroke-width="2" />
                        <path d="M150 100 L100 150 L120 165 L155 125" fill="none" stroke="#ee6e62" stroke-width="2" />
                        <path d="M250 100 L300 150 L280 165 L245 125" fill="none" stroke="#ee6e62" stroke-width="2" />
                        <text x="200" y="215" font-size="14" text-anchor="middle" font-weight="bold">${pieceSts} ok</text>
                        <text x="260" y="150" font-size="12" fill="#666" transform="rotate(-90 260 150)">${bodyLenCm} cm</text>
                        <text x="200" y="90" font-size="12" text-anchor="middle" fill="#ee6e62">${armRows} řad</text>
                        <text x="90" y="175" font-size="12" text-anchor="middle">${sleeveTop} ok</text>
                    </svg>
                </div>
      <h4>Základní přehled</h4>
      <ul>
        <li><strong>Vzorek:</strong> ${sts} ok × ${rows} řad na 10 cm</li>
        <li><strong>Obvod hrudníku (tělo):</strong> ${chest} cm</li>
        <li><strong>Volnost svetru:</strong> ${ease} cm</li>
        <li><strong>Hotový obvod svetru:</strong> ${finished} cm</li>
      </ul>

      <h4>Přední a zadní díl</h4>
<p>
  Na přední i zadní díl nahodíte <strong>${pieceSts} ok</strong>. 
  Upletete spodní lem dle vlastních zvyklostí a pokračujete rovně do požadované
  délky k podpaží (obvykle 40–45 cm).
</p>

<h4>Rukáv a rukávová hlavice</h4>
<p>
  Rukáv pletete od manžety. V nejširším místě (podpaží) budete mít 
  <strong>${sleeveTop} ok</strong>.
</p>

<p><strong>Tvarování rukávová hlavice:</strong></p>
<ul>
  <li>Na začátku následujících 2 řad uzavřete <strong>${capBO} oka</strong> (zbývá ${currentCapSts} ok).</li>
  <li>Poté uplatněte <strong>${capDecSteps}×</strong> toto ujímání: 
      v každé 2. řadě (lícové) ujměte 1 oko na začátku a 1 oko na konci jehlice.</li>
  <li>Nakonec zbývajících <strong>${targetTopSts} ok</strong> uzavřete najednou.</li>
</ul>


      <p>
        Po dokončení tvarování průramku vám na jehlici zůstane
        <strong>${bodyAfterArm} ok</strong>.
      </p>

      <h4>Rukáv</h4>
      <p>
        Rukáv pletete od manžety směrem nahoru.
        Šířka rukávu v nejširším místě vychází z obvodu paže
        <strong>${armCirc} cm</strong> a zvoleného vzorku.
      </p>

      <p>
        V nejširší části rukávu budete mít
        <strong>${sleeveTop} ok</strong>.
        K této šířce přidávejte oka rovnoměrně
        až do délky přibližně <strong>${sleeveLenCm} cm</strong>.
      </p>

      <h4>Dokončení</h4>
      <p>
        Sešijte ramenní švy, všijte rukávy do průramků
        a uzavřete boční švy. Svetr vyperte a vypněte
        do požadovaných rozměrů.
      </p>
    `;
    const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.style.display = 'inline-block';
  }

  }
/* <h4>Tvarování průramku</h4>
<p>
  Ve výšce, kde má začít průramek, uzavřete na začátku následujících dvou řad
  <strong>${armholeBO} oka</strong>.
</p>
<p>
  Poté tvarujte průramek ujímáním ok (celkem ubyde <strong>${armholeDrop} ok</strong>
  na každém dílu). Průramek pleťte do celkové výšky
  <strong>${armDepthCm} cm</strong> (≈ ${armRows} řad).
</p>
*/
  /* =========================
     EVENTY
  ========================== */

  [
  'chest',
  'fit',
  'sts',
  'rows',
  'armCirc',
  'armRatio',
  'sleeveTopOverride'
].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', generate);
});

const calcBtn = document.getElementById('calcBtn');
if (calcBtn) calcBtn.addEventListener('click', generate);

const printBtn = document.getElementById('printBtn');
if (printBtn) {
  printBtn.addEventListener('click', () => window.print());
}

generate();
  });

