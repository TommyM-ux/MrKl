document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const EVEN = n => Math.round(n / 2) * 2;

  // Automatická aktualizace políčka poměru při změně režimu
  $('mode').onchange = (e) => {
    $('armPct').value = e.target.value === 'KF' ? 0.245 : 0.22;
  };

  function generate() {
    const mode = $('mode').value;
    const finished = parseFloat($('finished').value);
    const stsValue = parseFloat($('sts').value);
    const rowsValue = parseFloat($('rows').value);
    const sleeveTopInput = parseFloat($('sleeveTop').value);
    const armPctInput = parseFloat($('armPct').value);

    if (isNaN(finished) || isNaN(stsValue) || isNaN(rowsValue)) {
      alert('Prosím, vyplňte všechna číselná pole.');
      return;
    }

    const stsPerCm = stsValue / 10;
    const rowsPerCm = rowsValue / 10;

    // --- VÝSLEDKY OKA A ŘADY (Vždy celá čísla) ---
    const pieceSts = EVEN(finished * stsPerCm / 2);
    const sleeveTop = EVEN(sleeveTopInput);
    const bodyLenCm = Math.round(finished * 0.38);
    const sleeveLenCm = Math.round(finished * 0.45);

    // Průramek
    const armDepthPct = armPctInput || (mode === 'KF' ? 0.245 : 0.22);
    const armRows = EVEN(Math.round(finished * armDepthPct * rowsPerCm));
    
    let armDrop, armBO;
    if (mode === 'KF') {
      armDrop = 12; 
      armBO = 3;
    } else {
      armDrop = EVEN(pieceSts * 0.08);
      armBO = Math.max(2, Math.round(armDrop * 0.3));
    }
    const armDec = Math.round((armDrop - armBO * 2) / 2);
    const armRemain = pieceSts - armDrop;

    // Hlavice
    const sleeveCapBO = mode === 'KF' ? 3 : Math.max(2, Math.round(sleeveTop * 0.05));
    const capRemain = Math.min(26, Math.max(14, EVEN(sleeveTop * 0.18)));
    const capDec = Math.round((sleeveTop - sleeveCapBO * 2 - capRemain) / 2);

    $('out').innerHTML = `
      <div class="mk-toggle">
        <label style="cursor:pointer"><input type="checkbox" id="compactToggle"> <strong>Stručný tahák</strong></label>
      </div>
      <div id="fullText">
        <h3>🧶 Váš návod</h3>
        <p>Vzorek: ${stsValue} ok / ${rowsValue} řad na 10 cm.</p>
        <h4>Tělo</h4>
        <p>Nahodíte <strong>${pieceSts} ok</strong>. Pletete do výšky <strong>${bodyLenCm} cm</strong>.</p>
        <h4>Průramek</h4>
        <p>BO <strong>${armBO} ok</strong> na začátku 2 řad. Poté <strong>${armDec}×</strong> ujmout 1 oko ob řadu. Zůstane <strong>${armRemain} ok</strong>. Celkem <strong>${armRows} řad</strong>.</p>
        <h4>Rukáv</h4>
        <p>Pletete k bicepsu do <strong>${sleeveLenCm} cm</strong> (<strong>${sleeveTop} ok</strong>). BO <strong>${sleeveCapBO} ok</strong> na začátku 2 řad. Poté <strong>${capDec}×</strong> ujmout každý líc. Uzavřít zbylých <strong>${capRemain} ok</strong>.</p>
      </div>
      <div id="compactText" style="display:none">
        <p><strong>Tělo:</strong> ${pieceSts} ok | <strong>Průramek:</strong> BO ${armBO}, ${armDec}× ujmout (${armRows} řad) | <strong>Rukáv:</strong> ${sleeveTop} ok | <strong>Hlavice:</strong> BO ${sleeveCapBO}, ${capDec}× ujmout, BO ${capRemain}.</p>
      </div>
    `;

    $('compactToggle').onchange = e => {
      $('fullText').style.display = e.target.checked ? 'none' : 'block';
      $('compactText').style.display = e.target.checked ? 'block' : 'none';
    };
    $('printBtn').style.display = 'inline-block';
  }
  $('calc').onclick = generate;
});
