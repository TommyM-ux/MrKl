document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const EVEN = n => Math.round(n / 2) * 2;

  // Oprava: Při změně režimu se okamžitě aktualizuje políčko poměru
  $('mode').onchange = (e) => {
    $('armPct').value = e.target.value === 'KF' ? 0.245 : 0.22;
  };

  function generate() {
    const mode = $('mode').value;
    
    // Vstupy (zde pletařka může zadat desetiny pro přesnost výpočtu)
    const finished = parseFloat($('finished').value);
    const stsValue = parseFloat($('sts').value);
    const rowsValue = parseFloat($('rows').value);
    const sleeveTopInput = parseFloat($('sleeveTop').value);
    const armPctInput = parseFloat($('armPct').value);

    // Kontrola platnosti čísel
    if (isNaN(finished) || isNaN(stsValue) || isNaN(rowsValue)) {
      alert('Prosím, vyplňte všechna pole číly.');
      return;
    }

    const stsPerCm = stsValue / 10;
    const rowsPerCm = rowsValue / 10;

    /* ============================================================
       VÝSLEDKY PRO NÁVOD - ZDE VŽDY POUŽÍVÁME ZAOKROUHLENÍ
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
      armDrop = 12; // Fixní hodnota pro KF
      armBO = 3;
    } else {
      armDrop = EVEN(pieceSts * 0.08);
      armBO   = Math.max(2, Math.round(armDrop * 0.3));
    }
    
    const armDec    = Math.round((armDrop - armBO * 2) / 2);
    const armRemain = pieceSts - armDrop;

    // Hlavice rukávu
    const sleeveCapBO  = mode === 'KF' ? 3 : Math.max(2, Math.round(sleeveTop * 0.05));
    const capTopTarget = Math.min(26, Math.max(14, EVEN(sleeveTop * 0.18)));
    const capDec       = Math.round((sleeveTop - sleeveCapBO * 2 - capTopTarget) / 2);

    /* ============================================================
       VÝSTUP - POUŽITY POUZE CELOČÍSELNÉ PROMĚNNÉ
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
        <p><strong>Vzorek:</strong> ${stsValue} ok a ${rowsValue} řad na 10 cm.</p>

        <h4>Zadní a přední díl</h4>
        <p>Nahodíte <strong>${pieceSts} ok</strong>. Pletete rovně do výšky cca <strong>${bodyLenCm} cm</strong>.</p>

        <h4>Tvarování průramku</h4>
        <p>Uzavřete <strong>${armBO} oka</strong> na začátku příštích 2 řad.</p>
        <p>Dále <strong>${armDec}×</strong> ujměte 1 oko na každém konci ob řadu.</p>
        <p>Zůstane <strong>${armRemain} ok</strong>. Výška průramku: <strong>${armRows} řad</strong>.</p>

        <h4>Rukáv a hlavice</h4>
        <p>Rukáv pleťte k bicepsu do délky <strong>${sleeveLenCm} cm</strong> (<strong>${sleeveTop} ok</strong>). 
        Poté uzavřete <strong>${sleeveCapBO} oka</strong> na začátku příštích 2 řad. 
        Následně <strong>${capDec}×</strong> ujměte 1 oko na každém konci v každém lícovém řádku. 
        Uzavřete zbývajících <strong>${capTopTarget} ok</strong> najednou.</p>
      </div>

      <div id="compactText" style="display:none">
        <h3>Stručný přehled (tahák)</h3>
        <p>
          <strong>Tělo:</strong> ${pieceSts} ok (${bodyLenCm} cm)<br>
          <strong>Průramek:</strong> BO ${armBO}, ${armDec}× ujmout ob řadu (${armRows} řad)<br>
          <strong>Rukáv:</strong> ${sleeveTop} ok (${sleeveLenCm} cm)<br>
          <strong>Hlavice:</strong> BO ${sleeveCapBO}, ${capDec}× ujmout každý líc, uzavřít ${capTopTarget} ok.
        </p>
      </div>
    `;

    // Přepínač funguje i při opakovaném generování
    $('compactToggle').onchange = e => {
      $('fullText').style.display = e.target.checked ? 'none' : 'block';
      $('compactText').style.display = e.target.checked ? 'block' : 'none';
    };

    $('printBtn').style.display = 'inline-block';
  }

  $('calc').onclick = generate;
});
