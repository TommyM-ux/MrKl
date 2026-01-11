document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const EVEN = (n) => Math.round(n / 2) * 2;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

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

  function generate() {
    const chest = readInt('chest', 96);
    const ease = readInt('fit', 10);
    const finished = chest + ease;

    const sts = readInt('sts', 22);
    const rows = readInt('rows', 30);
    const sleeveTop = EVEN(readInt('sleeveTop', 110));
    const armRatio = clamp(readFloat('armRatio', 0.245), 0.18, 0.30);

    // zobraz hotový obvod
    $('finishedOut').textContent = finished;
    $('finishedExplain').textContent =
      `${chest} cm hrudník + ${ease} cm volnost`;

    const stsPerCm = sts / 10;
    const rowsPerCm = rows / 10;

    const totalSts = EVEN(finished * stsPerCm);
    const pieceSts = totalSts / 2;

    const armDepthCm = Math.round(finished * armRatio * 10) / 10;
    const armRows = EVEN(Math.round(armDepthCm * rowsPerCm));

    const armBO = 3;
    const armDrop = 12;
    const armDec = Math.max(0, Math.floor((armDrop - armBO * 2) / 2));
    const armRemain = pieceSts - armDrop;

    const out = $('out');
    out.innerHTML = `
      <h3>Návod k pletení</h3>

      <p><strong>Hotový obvod svetru:</strong> ${finished} cm</p>
      <p><strong>Vzorek:</strong> ${sts} ok / ${rows} řad na 10 cm</p>

      <h4>Tělo</h4>
      <p>Nahodit <strong>${pieceSts} ok</strong> na přední i zadní díl.</p>

      <h4>Průramek</h4>
      <p>
        Hloubka průramku je cca <strong>${armDepthCm} cm</strong>
        (${armRows} řad).
      </p>
      <p>
        Uzavřít ${armBO} oka na začátku 2 řad,
        poté ${armDec}× ujmout 1 oko na každém konci.
        Zůstane <strong>${armRemain} ok</strong>.
      </p>

      <h4>Rukáv</h4>
      <p>Nejširší část rukávu: <strong>${sleeveTop} ok</strong>.</p>
    `;

    $('printBtn').style.display = 'inline-block';
  }

  $('calcBtn').addEventListener('click', generate);
  $('printBtn').addEventListener('click', () => window.print());

  ['chest', 'fit', 'armRatio', 'sts', 'rows', 'sleeveTop'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('input', generate);
  });

  // první výpočet po načtení
  generate();
});
