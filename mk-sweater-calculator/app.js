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
    const bodyAfterArm = pieceSts - armholeDrop;

    /* === 4) RUKÁV === */

    let sleeveTop;
    if (sleeveOverride && sleeveOverride > 0) {
      sleeveTop = EVEN(sleeveOverride);
    } else {
      sleeveTop = EVEN(armCirc * stsPerCm);
    }

    const sleeveLenCm = Math.round(finished * 0.45);

    /* === 5) VÝSTUP === */

    const out = $('out');

    out.innerHTML = `
      <h3>Návod k pletení – svetr s všitým rukávem</h3>

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
        Upletete spodní lem podle vlastních zvyklostí
        a pokračujete rovně v hladkém žerzeji.
      </p>

      <p>
        Pleťte rovně do výšky cca <strong>${armDepthCm} cm</strong>,
        což odpovídá přibližně <strong>${armRows} řadám</strong>.
        V této výšce začíná tvarování průramku.
      </p>

      <h4>Tvarování průramku</h4>
      <p>
        Na začátku následujících dvou řad uzavřete vždy
        <strong>${armholeBO} oka</strong>.
      </p>

      <p>
        Poté <strong>${armholeDec}×</strong> opakujte:
      </p>
      <ul>
        <li>1 řadu upletete rovně</li>
        <li>v následující řadě ujmete 1 oko na každém konci jehlice</li>
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
  }

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
