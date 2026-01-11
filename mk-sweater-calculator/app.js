document.addEventListener('DOMContentLoaded', () => {

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

  function generate() {
    const chest = readInt('chest', 96);
    const ease  = readInt('fit', 10);
    const finished = chest + ease;

    const sts  = readInt('sts', 22);
    const rows = readInt('rows', 30);

    const armCirc = readInt('armCirc', 36);
    const sleeveTopOverride = readInt('sleeveTopOverride', 0);
    const armRatio = clamp(readFloat('armRatio', 0.245), 0.18, 0.30);

    const stsPerCm  = sts / 10;
    const rowsPerCm = rows / 10;

    const pieceSts = EVEN(finished * stsPerCm / 2);
    const bodyLenCm = Math.round(finished * 0.38);

    const armDepthCm = Math.round(finished * armRatio * 10) / 10;
    const armRows    = EVEN(Math.round(armDepthCm * rowsPerCm));

    const armholeBO    = 3;
    const armholeDrop  = 12;
    const armholeDec   = Math.max(0, Math.floor((armholeDrop - armholeBO * 2) / 2));
    const bodyAfterArm = EVEN(pieceSts - armholeDrop);

    let sleeveTop = (sleeveTopOverride && sleeveTopOverride > 0) ? EVEN(sleeveTopOverride) : EVEN(armCirc * stsPerCm);
    const sleeveLenCm = Math.round(finished * 0.45);

    const out = $('out');
    if (!out) return;

    out.innerHTML = `
      <h3>Návod k pletení – svetr s všitým rukávem</h3>

     <div style="text-align: center; margin: 20px 0; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <svg viewBox="0 0 400 240" width="100%" style="max-width: 450px;">
              <path d="M140,210 L260,210 L260,110 Q260,90 240,85 L240,65 Q240,60 235,60 L165,60 Q160,60 160,65 L160,85 Q140,90 140,110 Z" 
                    fill="#fefefe" stroke="#ee6e62" stroke-width="2.5" />
              
              <path d="M140,110 Q140,90 155,95 L85,145 L100,165 L160,125" 
                    fill="#fefefe" stroke="#ee6e62" stroke-width="2.5" stroke-linejoin="round" />
              
              <path d="M260,110 Q260,90 245,95 L315,145 L300,165 L240,125" 
                    fill="#fefefe" stroke="#ee6e62" stroke-width="2.5" stroke-linejoin="round" />

              <text x="200" y="230" font-size="14" text-anchor="middle" font-weight="bold" fill="#333">${pieceSts} ok</text>
              <text x="280" y="160" font-size="12" fill="#888" transform="rotate(-90 280 160)">${bodyLenCm} cm</text>
              <text x="200" y="110" font-size="13" fill="#ee6e62" font-weight="bold" text-anchor="middle">${armRows} řad</text>
              <text x="80" y="180" font-size="12" text-anchor="middle" fill="#333">${sleeveTop} ok</text>
          </svg>
      </div>

      <p>
        Tento návod je vypočten pro hotový obvod svetru 
        <strong>${finished} cm</strong> (včetně volnosti ${ease} cm) 
        při zkušebním vzorku ${sts} ok a ${rows} řad na 10 cm.
      </p>

      <h4>Přední a zadní díl</h4>
      <p>
        Na přední i zadní díl nahodíte <strong>${pieceSts} ok</strong>. 
        Upletete spodní lem dle vlastních zvyklostí a pokračujete rovně do požadované 
        délky k podpaží (obvykle 40–45 cm).
      </p>

      <h4>Tvarování průramku</h4>
      <p>
        Ve výšce, kde má začít průramek, uzavřete na začátku následujících dvou řad 
        <strong>${armholeBO} oka</strong>.
      </p>
      <p>
        Poté tvarujte průramek ujímáním ok (celkem ubyde <strong>${armholeDrop} ok</strong> 
        na každém dílu). Průramek pleťte do celkové výšky 
        <strong>${armDepthCm} cm</strong> (cca ${armRows} řad). 
        Po dokončení tvarování vám zůstane <strong>${bodyAfterArm} ok</strong>.
      </p>

      <h4>Rukáv</h4>
      <p>
        Rukávy pletete od manžety směrem nahoru podle naměřeného obvodu paže 
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

    const printBtn = $('printBtn');
    if (printBtn) printBtn.style.display = 'inline-block';
  }

  ['chest', 'fit', 'sts', 'rows', 'armCirc', 'armRatio', 'sleeveTopOverride'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('input', generate);
  });

  const calcBtn = $('calcBtn');
  if (calcBtn) calcBtn.addEventListener('click', generate);

  const printBtn = $('printBtn');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  generate();
});
