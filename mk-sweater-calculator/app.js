document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const EVEN = (n) => Math.round(n / 2) * 2;

  // Pokud nemáš v HTML přepínač "Klasik/Úzký", doplníme ho dynamicky
  function ensureFitSelector() {
    const form = document.querySelector('form');
    if (!form) return;

    if ($('fitStyle')) return; // už existuje

    // vložíme hned pod režim / hotový obvod (na konec prvních řádků)
    const firstRow = form.querySelector('.mk-row');
    if (!firstRow) return;

    const wrap = document.createElement('div');
    wrap.className = 'mk-row';
    wrap.innerHTML = `
      <div class="mk-field">
        <label>Střih rukávu</label>
        <select id="fitStyle">
          <option value="classic" selected>Klasik (běžný)</option>
          <option value="narrow">Úzký (štíhlejší)</option>
        </select>
      </div>
      <div class="mk-field">
        <label title="Hloubka průramku = poměr z hotového obvodu. Např. 0,245 × 100 cm = 24,5 cm.">
          Hloubka průramku (poměr)
        </label>
        <input id="armRatio" type="number" step="0.001" value="0.245" inputmode="decimal">
      </div>
    `;

    // vlož hned za první mk-row
    firstRow.insertAdjacentElement('afterend', wrap);
  }

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

  function readFloat(id, fallback) {
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
    // Vstupy (jen celá čísla)
    const mode = $('mode') ? $('mode').value : 'KF';
    const finished = roundIntFromInput('finished', 100);
    const stsVal = roundIntFromInput('sts', 22);
    const rowsVal = roundIntFromInput('rows', 30);
    const sleeveTop = EVEN(roundIntFromInput('sleeveTop', 110));

    // Fit: classic / narrow
    const fitStyle = $('fitStyle') ? $('fitStyle').value : 'classic';

    // Hloubka průramku poměrem – můžeš ručně, ale hlídáme rozumné meze
    const defaultRatio = fitStyle === 'narrow' ? 0.225 : 0.245;
    const armRatio = clamp(readFloat('armRatio', defaultRatio), 0.18, 0.30);

    if (!finished || !stsVal || !rowsVal || !sleeveTop) {
      render(`<p class="mk-muted">Vyplň prosím všechna pole (celá čísla).</p>`);
      return;
    }

    // Přepočty
    const stsPerCm = stsVal / 10;
    const rowsPerCm = rowsVal / 10;

    // Orientační délky (jen nápověda, ne dogma)
    const bodyLenCm = Math.round(finished * (fitStyle === 'narrow' ? 0.36 : 0.38));
    const sleeveLenCm = Math.round(finished * (fitStyle === 'narrow' ? 0.43 : 0.45));

    // Tělo
    const totalSts = EVEN(finished * stsPerCm);
    const pieceSts = totalSts / 2;

    // Průramek
    const armDepthCm = Math.round((finished * armRatio) * 10) / 10; // 1 desetina cm ok
    const armRows = EVEN(Math.round(armDepthCm * rowsPerCm));

    const armDrop = fitStyle === 'narrow'
      ? EVEN(pieceSts * 0.07)
      : 12; // KF-ish fix (tvoje preference z dřívějška)

    const armBO = 3; // držíme konzistentně jako KF
    const armDec = Math.max(0, Math.floor((armDrop - armBO * 2) / 2));
    const armRemain = pieceSts - armDrop;

    // Hlavice rukávu
    const sleeveCapBO = 3;
    const capRemain = fitStyle === 'narrow'
      ? Math.min(22, Math.max(12, EVEN(sleeveTop * 0.16)))
      : Math.min(26, Math.max(14, EVEN(sleeveTop * 0.18)));

    const capDec = Math.max(0, Math.floor((sleeveTop - sleeveCapBO * 2 - capRemain) / 2));

    // Texty (podrobné) – dvě varianty
    const fitLabel = fitStyle === 'narrow' ? 'Úzký' : 'Klasik';
    const armExplain = `
      <div class="mk-note">
        <strong>Co je „hloubka průramku (poměr)“?</strong><br>
        Je to podíl z hotového obvodu. Tj. <code>${armRatio.toFixed(3)}</code> × <strong>${finished} cm</strong> ≈ <strong>${armDepthCm} cm</strong>.
        Díky tomu se průramek škáluje s velikostí a nevychází u malých/velkých velikostí „mimo“.
      </div>
    `;

    const sleeveExplain = `
      <div class="mk-note">
        <strong>Co je „Rukáv nahoře (oka)“?</strong><br>
        Počet ok v nejširší části rukávu (u bicepsu) těsně před hlavicí. To je „šířka rukávu“, ze které se pak tvaruje hlavice.
      </div>
    `;

    const detailed = `
      <div class="mk-toggle">
        <label><input type="checkbox" id="mkCompactToggle"> Zobrazit tahák místo podrobného návodu</label>
      </div>

      <div id="mkDetailed">
        <h3>🧶 Návod na pletení (${mode} · ${fitLabel})</h3>

        <p><strong>Vzorek:</strong> ${stsVal} ok a ${rowsVal} řad na 10 cm (hladký žerzej).</p>

        ${armExplain}
        ${sleeveExplain}

        <h4>Zadní a přední díl</h4>
        <p>
          Nahodíte <strong>${pieceSts} ok</strong> pro jeden díl (přední / zadní). Upletete spodní lem dle vlastního zvyku.
          Poté pokračujte v hladkém žerzeji rovně do výšky cca <strong>${bodyLenCm} cm</strong> (orientačně k průramku).
        </p>

        <h4>Tvarování průramku</h4>
        <p>
          Na začátku následujících dvou řad uzavřete vždy <strong>${armBO} oka</strong>.
        </p>
        <p>
          Dále <strong>${armDec}×</strong> opakujte tento postup:
        </p>
        <ul>
          <li>1 řadu upleťte rovně</li>
          <li>v následující řadě ujměte 1 oko na každém konci jehlice</li>
        </ul>
        <p>
          Po vytvarování průramku vám zůstane <strong>${armRemain} ok</strong>.
          Celková výška průramku je přibližně <strong>${armRows} řad</strong> (končí na lícové řadě).
        </p>

        <h4>Rukáv</h4>
        <p>
          Rukáv pleťte od manžety a postupně přidávejte oka, dokud přibližně po délce <strong>${sleeveLenCm} cm</strong>
          nedosáhnete nejširší části rukávu: <strong>${sleeveTop} ok</strong>.
        </p>
        <p>
          (Jak často přidávat oka záleží na cílové délce a počtu ok – pokud chceš, doplníme i „přidat každých X řad“ jako další volbu.)
        </p>

        <h4>Hlavice rukávu</h4>
        <p>
          Na začátku následujících dvou řad uzavřete vždy <strong>${sleeveCapBO} oka</strong>.
          Poté <strong>${capDec}×</strong> ujměte 1 oko na každém konci v každém lícovém řádku.
          Nakonec uzavřete zbývajících <strong>${capRemain} ok</strong> najednou.
        </p>
      </div>

      <div id="mkCheat" style="display:none">
        <h3>Tahák (${mode} · ${fitLabel})</h3>
        <p><strong>Tělo:</strong> ${pieceSts} ok / díl</p>
        <p><strong>Průramek:</strong> BO ${armBO} na zač. 2 řad, pak ${armDec}× ujmout ob řadu, zůstane ${armRemain} ok, výška ${armRows} řad</p>
        <p><strong>Rukáv:</strong> nejširší ${sleeveTop} ok</p>
        <p><strong>Hlavice:</strong> BO ${sleeveCapBO} na zač. 2 řad, pak ${capDec}× ujmout v každém líci, BO ${capRemain}</p>
      </div>
    `;

    // Vložit a navázat přepínač (delegace = nic se “neztratí”)
    render(detailed);

    // Přepínač Tahák/Detail – pozor na unikátní ID
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

    // Tisk tlačítko až po výpočtu
    const printBtn = $('printBtn');
    if (printBtn) printBtn.style.display = 'inline-block';
  }

  // Stabilní bindy (už se “neztratí”)
  ensureFitSelector();

  const calcBtn = $('calc');
  if (calcBtn) calcBtn.addEventListener('click', generate);

  const modeSel = $('mode');
  if (modeSel) modeSel.addEventListener('change', generate);

  // přepočítávej i při změně vstupů (ať to lidi nemusí klikat furt)
  ['finished','sts','rows','sleeveTop','fitStyle','armRatio'].forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener('input', () => {
      // malé zpoždění = pohodovější psaní
      window.clearTimeout(window.__mkTimer);
      window.__mkTimer = window.setTimeout(generate, 120);
    });
  });

});
