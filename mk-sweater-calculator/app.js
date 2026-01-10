document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const EVEN = n => Math.round(n / 2) * 2;

  // Oprava EU režimu: Okamžitá změna poměru v políčku
  $('mode').onchange = (e) => {
    $('armPct').value = e.target.value === 'KF' ? 0.245 : 0.22;
  };

  function generate() {
    const mode = $('mode').value;
    
    // Načtení vstupů (tady pletařka může psát desetiny pro přesnost)
    const finished = parseFloat($('finished').value);
    const stsValue = parseFloat($('sts').value);
    const rowsValue = parseFloat($('rows').value);
    const sleeveTopInput = parseFloat($('sleeveTop').value);
    const armPctInput = parseFloat($('armPct').value);

    if (isNaN(finished) || isNaN(stsValue) || isNaN(rowsValue)) {
      alert('Prosím, vyplňte všechna pole.');
      return;
    }

    const stsPerCm = stsValue / 10;
    const rowsPerCm = rowsValue / 10;

    /* ============================================================
       VÝPOČTY - VŠE NATVRDO ZAOKROUHLENO NA CELÁ ČÍSLA (ŽÁDNÉ DESETINY!)
    ============================================================ */
    const bodyLenCm   = Math.round(finished * 0.38);
    const sleeveLenCm = Math.round(finished * 0.45);
    const pieceSts    = EVEN(finished * stsPerCm / 2);
    const sleeveTop   = EVEN(sleeveTopInput);

    // Průramek
    const armDepthPct = armPctInput || (mode === 'KF' ? 0.245 : 0.22);
    const armRows     = EVEN(Math.round(finished * armDepthPct * rowsPerCm));
    
    let armDrop, armBO;
    if (mode === 'KF') {
      armDrop = 12; 
      armBO   = 3;
    } else {
      armDrop = EVEN(pieceSts * 0.08);
      armBO   = Math.max(2, Math.round(armDrop * 0.3));
    }
    
    const armDec    = Math.round((armDrop - armBO * 2) / 2);
    const armRemain = Math.round(pieceSts - armDrop);

    // Hlavice rukávu
    const sleeveCapBO  = mode === 'KF' ? 3 : Math.max(2, Math.round(sleeveTop * 0.05));
    const capTopTarget = Math.min(26, Math.max(14, EVEN(sleeveTop * 0.18)));
    const capDec       = Math.round((sleeveTop - sleeveCapBO * 2 - capTopTarget) / 2);

    /* ============================================================
       TEXTY PŘESNĚ PODLE TVÉHO PŮVODNÍHO SOUBORU
    ============================================================ */
    $('out').innerHTML = `
      <div class="mk-toggle">
        <label style="cursor:pointer">
          <input type="checkbox" id="compactToggle">
          Zobrazit stručný přehled (tahák)
        </label>
      </div>

      <div id="fullText">
        <h3>🧶 Návod na pletení – svetr s všitým rukávem</h3>
        <p>
          <strong>Vzorek:</strong><br>
          ${stsValue} ok a ${rowsValue} řad na 10 cm v hladkém žerzeji.
        </p>

        <h4>Zadní a přední díl</h4>
        <p>
          Nahodíte <strong>${pieceSts} ok</strong> a upletete spodní lem dle vlastního výběru. 
          Poté pokračujte v hladkém žerzeji rovně až do výšky cca <strong>${bodyLenCm} cm</strong>, 
          tedy do začátku průramku.
        </p>

        <h4>Tvarování průramku</h4>
        <p>
          Na začátku následujících dvou řad uzavřete vždy <strong>${armBO} oka</strong>.
        </p>
        <p>
          Dále <strong>${armDec}×</strong> opakujte:
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
          Rukáv pleťte od manžety a postupně přidávejte oka, dokud po délce cca <strong>${sleeveLenCm} cm</strong> 
          nedosáhnete nejširší části rukávu o <strong>${sleeveTop} okách</strong>.
        </p>

        <h4>Hlavice rukávu</h4>
        <p>
          Na začátku následujících dvou řad uzavřete vždy <strong>${sleeveCapBO} oka</strong>.
        </p>
        <p>
          Poté <strong>${capDec}×</strong> ujměte 1 oko na každém konci v každém lícovém řádku.
        </p>
        <p>
          Nakonec uzavřete zbývajících <strong>${capTopTarget} ok</strong> najednou.
        </p>
      </div>

      <div id="compactText" style="display:none">
        <h3>Stručný přehled (tahák)</h3>
        <p>
          <strong>Tělo:</strong> ${pieceSts} ok<br>
          <strong>Průramek:</strong> BO ${armBO}, ${armDec}× ujmout ob řadu (${armRows} řad)<br>
          <strong>Rukáv:</strong> ${sleeveTop} ok<br>
          <strong>Hlavice:</strong> BO ${sleeveCapBO}, ${capDec}× ujmout na každém líci, BO ${capTopTarget}
        </p>
      </div>
    `;

    // Toggle přepínač
    $('compactToggle').onchange = e => {
      $('fullText').style.display = e.target.checked ? 'none' : 'block';
      $('compactText').style.display = e.target.checked ? 'block' : 'none';
    };

    $('printBtn').style.display = 'inline-block';
  }

  $('calc').onclick = generate;
});
