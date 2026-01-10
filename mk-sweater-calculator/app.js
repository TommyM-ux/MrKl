document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const EVEN = n => Math.round(n / 2) * 2;

  function generate() {
    const mode = $('mode').value;
    const finished = parseFloat($('finished').value);
    const stsValue = parseFloat($('sts').value);
    const rowsValue = parseFloat($('rows').value);
    const sleeveTopInput = parseFloat($('sleeveTop').value);
    // Pokud uživatel do poměru nic nenapíše, vezme se default podle režimu
    const armPctInput = parseFloat($('armPct').value);

    if (!finished || !stsValue || !rowsValue) {
      alert('Prosím, vyplňte všechna pole.');
      return;
    }

    const stsPerCm = stsValue / 10;
    const rowsPerCm = rowsValue / 10;

    // VÝPOČTY - Vše zaokrouhleno na celá čísla hned při vzniku
    const bodyLenCm = Math.round(finished * 0.38);
    const sleeveLenCm = Math.round(finished * 0.45);
    const pieceSts = EVEN(finished * stsPerCm / 2);
    const sleeveTop = EVEN(sleeveTopInput);

    // Průramek
    const armDepthPct = armPctInput || (mode === 'KF' ? 0.245 : 0.22);
    const armRows = EVEN(Math.round(finished * armDepthPct * rowsPerCm));
    
    let armDrop, armBO;
    if (mode === 'KF') {
      armDrop = 12; // Fixní KF hodnota
      armBO = 3;
    } else {
      armDrop = EVEN(pieceSts * 0.08);
      armBO = Math.max(2, Math.floor(armDrop * 0.3));
    }
    // armDec musí být taky celé číslo
    const armDec = Math.round((armDrop - armBO * 2) / 2);
    const armRemain = pieceSts - armDrop;

    // Hlavice
    const sleeveCapBO = mode === 'KF' ? 3 : Math.max(2, Math.round(sleeveTop * 0.05));
    const capTopTarget = Math.min(26, Math.max(14, EVEN(sleeveTop * 0.18)));
    const capDec = Math.round((sleeveTop - sleeveCapBO * 2 - capTopTarget) / 2);

    // VÝSTUPNÍ TEXT (Zpět k tvému původnímu stylu)
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
        <p>Nahodíte <strong>${pieceSts} ok</strong>. Pletete do výšky cca <strong>${bodyLenCm} cm</strong>.</p>

        <h4>Tvarování průramku</h4>
        <p>Uzavřete <strong>${armBO} oka</strong> na začátku příštích 2 řad.</p>
        <p>Dále <strong>${armDec}×</strong> ujměte 1 oko na každém konci ob řadu.</p>
        <p>Zůstane <strong>${armRemain} ok</strong>. Výška průramku: <strong>${armRows} řad</strong>.</p>

        <h4>Rukáv a hlavice</h4>
        <p>Pletete k bicepsu do délky <strong>${sleeveLenCm} cm</strong> (<strong>${sleeveTop} ok</strong>). 
        Poté uzavřete <strong>${sleeveCapBO} oka</strong> na začátku příštích 2 řad. 
        Následně <strong>${capDec}×</strong> ujměte 1 oko na každém konci v každém lícovém řádku. 
        Uzavřete zbývajících <strong>${capTopTarget} ok</strong> najednou.</p>
      </div>

      <div id="compactText" style="display:none">
        <h3>Stručný přehled (tahák)</h3>
        <p>
          <strong>Tělo:</strong> ${pieceSts} ok (${bodyLenCm} cm)<br>
          <strong>Průramek:</strong> BO ${armBO}, ${armDec}× ujmout ob řadu (${armRows} řad)<br>
          <strong>Rukáv:</strong> ${sleeveTop} ok (${sleeveLenCm} cm k bicepsu)<br>
          <strong>Hlavice:</strong> BO ${sleeveCapBO}, ${capDec}× ujmout každý líc, uzavřít ${capTopTarget} ok.
        </p>
      </div>
    `;

    // Přepínání
    $('compactToggle').onchange = e => {
      $('fullText').style.display = e.target.checked ? 'none' : 'block';
      $('compactText').style.display = e.target.checked ? 'block' : 'none';
    };

    $('printBtn').style.display = 'inline-block';
  }

  // Automatická změna poměru v políčku při změně režimu
  $('mode').onchange = (e) => {
    $('armPct').value = e.target.value === 'KF' ? 0.245 : 0.22;
  };

  $('calc').onclick = generate;
});
