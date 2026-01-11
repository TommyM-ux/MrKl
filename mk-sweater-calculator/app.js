document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const EVEN = (n) => Math.round(n / 2) * 2;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function roundIntFromInput(id, fallback) {
    const el = $(id);
    if (!el) return fallback;
    const v = Number(el.value);
    if (!Number.isFinite(v)) return fallback;
    return Math.round(v);
  }

  function readFloatFromInput(id, fallback) {
    const el = $(id);
    if (!el) return fallback;
    const v = Number(el.value);
    return Number.isFinite(v) ? v : fallback;
  }

  function render(outputHtml) {
    const out = $('out');
    if (!out) return;
    out.innerHTML = outputHtml;
  }

  function generate() {
    const mode = $('mode') ? $('mode').value : 'KF';

    const finished = roundIntFromInput('finished', 102);
    const stsVal = roundIntFromInput('sts', 22);
    const rowsVal = roundIntFromInput('rows', 30);
    const sleeveTop = EVEN(roundIntFromInput('sleeveTop', 110));

    const defaultRatio = mode === 'EU' ? 0.225 : 0.245;
    const armRatio = clamp(readFloatFromInput('armRatio', defaultRatio), 0.18, 0.30);

    if (!finished || !stsVal || !rowsVal || !sleeveTop) {
      render(`<p class="mk-muted">Vyplň prosím všechna pole (celá čísla).</p>`);
      return;
    }

    const stsPerCm = stsVal / 10;
    const rowsPerCm = rowsVal / 10;

    const bodyLenCm = Math.round(finished * (mode === 'EU' ? 0.36 : 0.38));
    const sleeveLenCm = Math.round(finished * (mode === 'EU' ? 0.43 : 0.45));

    const totalSts = EVEN(finished * stsPerCm);
    const pieceSts = totalSts / 2;

    const armDepthCm = Math.round((finished * armRatio) * 10) / 10;
    const armRows = EVEN(Math.round(armDepthCm * rowsPerCm));

    const armDrop = mode === 'EU' ? EVEN(pieceSts * 0.07) : 12;
    const armBO = 3;
    const armDec = Math.max(0, Math.floor((armDrop - armBO * 2) / 2));
    const armRemain = pieceSts - armDrop;

    const sleeveCapBO = 3;
    const capRemain =
      mode === 'EU'
        ? Math.min(22, Math.max(12, EVEN(sleeveTop * 0.16)))
        : Math.min(26, Math.max(14, EVEN(sleeveTop * 0.18)));

    const capDec = Math.max(0, Math.floor((sleeveTop - sleeveCapBO * 2 - capRemain) / 2));

    const modeLabel = mode === 'EU' ? 'EU (užší)' : 'KF (klasik)';

    render(`
      <div class="mk-toggle no-print">
        <label><input type="checkbox" id="mkCompactToggle"> Zobrazit tahák místo podrobného návodu</label>
      </div>

      <div id="mkDetailed">
        <h3>🧶 Návod na pletení (${modeLabel})</h3>
        <p><strong>Vzorek:</strong> ${stsVal} ok a ${rowsVal} řad na 10 cm (hladký žerzej).</p>

        <div class="mk-note">
          <strong>Hloubka průramku (poměr)</strong><br>
          Určuje <strong>výšku průramku</strong> jako podíl z <strong>hotového obvodu svetru</strong>.
          Nemění šířku ani velikost svetru – mění pouze <strong>počet řad průramku</strong> a tím i pohodlí v ramenou.<br>
          <small>
            Příklad: ${armRatio.toFixed(3)} × ${finished} cm ≈ <strong>${armDepthCm} cm</strong> (≈ <strong>${armRows} řad</strong>).<br>
            Doporučené rozmezí: <strong>0,22–0,27</strong> (běžně <strong>0,24–0,255</strong>).
          </small>
        </div>

        <div class="mk-note">
          <strong>Rukáv nahoře (oka)</strong><br>
          Počet ok v nejširší části rukávu (u bicepsu) těsně před hlavicí.
          Spočítáte z obvodu paže: <code>obvod rukávu v cm × (oka / 10 cm) = oka rukávu nahoře</code>.
        </div>

        <h4>Zadní a přední díl</h4>
        <p>
          Nahodíte <strong>${pieceSts} ok</strong> pro jeden díl. Upletete spodní lem dle zvyku.
          Poté pokračujte rovně do výšky cca <strong>${bodyLenCm} cm</strong> (orientačně k průramku).
        </p>

        <h4>Tvarování průramku</h4>
        <p>Na začátku následujících dvou řad uzavřete vždy <strong>${armBO} oka</strong>.</p>
        <p>Dále <strong>${armDec}×</strong> opakujte:</p>
        <ul>
          <li>1 řadu rovně</li>
          <li>v další řadě ujmout 1 oko na každém konci</li>
        </ul>
        <p>
          Po vytvarování průramku zůstane <strong>${armRemain} ok</strong>.
          Celková výška průramku je přibližně <strong>${armRows} řad</strong> (končí na lícové řadě).
        </p>

        <h4>Rukáv</h4>
        <p>
          Přidávejte oka, dokud přibližně po délce <strong>${sleeveLenCm} cm</strong>
          nedosáhnete nejširší části: <strong>${sleeveTop} ok</strong>.
        </p>

        <h4>Hlavice rukávu</h4>
        <p>
          Na začátku 2 řad uzavřete vždy <strong>${sleeveCapBO} oka</strong>.
          Poté <strong>${capDec}×</strong> ujmout 1 oko na každém konci v každém lícovém řádku.
          Nakonec uzavřít <strong>${capRemain} ok</strong>.
        </p>
      </div>

      <div id="mkCheat" style="display:none">
        <h3>Tahák (${modeLabel})</h3>
        <p><strong>Tělo:</strong> ${pieceSts} ok / díl</p>
        <p><strong>Průramek:</strong> BO ${armBO} na zač. 2 řad, pak ${armDec}× ujmout ob řadu, zůstane ${armRemain} ok, výška ${armRows} řad</p>
        <p><strong>Rukáv:</strong> ${sleeveTop} ok</p>
        <p><strong>Hlavice:</strong> BO ${sleeveCapBO} na zač. 2 řad, pak ${capDec}× ujmout v každém líci, BO ${capRemain}</p>
      </div>
    `);

    const toggle = document.getElementById('mkCompactToggle');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        const showCheat = e.target.checked;
        const d = document.getElementById('mkDetailed');
        const c = document.getElementById('mkCheat');
        if (d) d.style.display = showCheat ? 'none' : 'block';
        if (c) c.style.display = showCheat ? 'block' : 'none';
      });
    }

    const printBtn = $('printBtn');
    if (printBtn) printBtn.style.display = 'inline-block';
  }

  const calcBtn = $('calc');
  if (calcBtn) calcBtn.addEventListener('click', generate);

  const printBtn = $('printBtn');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  const modeSel = $('mode');
  if (modeSel) modeSel.addEventListener('change', generate);

  ['finished', 'sts', 'rows', 'sleeveTop', 'armRatio'].forEach((id) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', () => {
      window.clearTimeout(window.__mkTimer);
      window.__mkTimer = window.setTimeout(generate, 120);
    });
  });

  // aby to „nechtělo refresh“
  generate();
});
