document.addEventListener('DOMContentLoaded', () => {

  const $ = (id) => document.getElementById(id);
  const EVEN = (n) => Math.round(n / 2) * 2;

  function generate() {
    // --- VSTUPY (JEN CELÁ ČÍSLA) ---
    const mode = $('mode').value;

    const finished = Math.round(Number($('finished').value));
    const stsVal   = Math.round(Number($('sts').value));
    const rowsVal  = Math.round(Number($('rows').value));
    const sleeveTop = EVEN(Math.round(Number($('sleeveTop').value)));

    if (
      !finished || !stsVal || !rowsVal || !sleeveTop
    ) {
      $('out').innerHTML = '<p class="mk-muted">Vyplň všechna pole.</p>';
      return;
    }

    // --- PŘEPOČTY ---
    const stsPerCm  = stsVal / 10;
    const rowsPerCm = rowsVal / 10;

    // --- ORIENTAČNÍ DÉLKY ---
    const bodyLenCm   = Math.round(finished * 0.38);
    const sleeveLenCm = Math.round(finished * 0.45);

    // --- TĚLO ---
    const totalSts = EVEN(finished * stsPerCm);
    const pieceSts = totalSts / 2;

    // --- PRŮRAMEK ---
    const armDepthPct = mode === 'KF' ? 0.245 : 0.22;
    const armRows = EVEN(
      Math.round(finished * armDepthPct * rowsPerCm)
    );

    const armDrop = mode === 'KF'
      ? 12
      : EVEN(pieceSts * 0.08);

    const armBO = mode === 'KF'
      ? 3
      : Math.max(2, Math.floor(armDrop * 0.3));

    const armDec = Math.floor((armDrop - armBO * 2) / 2);
    const armRemain = pieceSts - armDrop;

    // --- HLAVICE RUKÁVU ---
    const sleeveCapBO = mode === 'KF'
      ? 3
      : Math.max(2, Math.round(sleeveTop * 0.05));

    const capRemain = Math.min(
      26,
      Math.max(14, EVEN(sleeveTop * 0.18))
    );

    const capDec = Math.floor(
      (sleeveTop - sleeveCapBO * 2 - capRemain) / 2
    );

    // --- VÝSTUP ---
    $('out').innerHTML = `
      <h3>🧶 Návod na pletení</h3>

      <p><strong>Vzorek:</strong><br>
      ${stsVal} ok a ${rowsVal} řad na 10 cm</p>

      <h4>Přední a zadní díl</h4>
      <p>
        Nahodit <strong>${pieceSts} ok</strong>.  
        Plést rovně do výšky cca <strong>${bodyLenCm} cm</strong>.
      </p>

      <h4>Průramek</h4>
      <p>
        BO <strong>${armBO} ok</strong> na začátku 2 řad.  
        Dále <strong>${armDec}×</strong> ujmout 1 oko na každém konci
        v každé druhé řadě.
      </p>
      <p>
        Zůstane <strong>${armRemain} ok</strong>.  
        Výška průramku: <strong>${armRows} řad</strong>.
      </p>

      <h4>Rukáv</h4>
      <p>
        Rozšiřovat do délky cca <strong>${sleeveLenCm} cm</strong>,  
        celkem <strong>${sleeveTop} ok</strong>.
      </p>

      <h4>Hlavice rukávu</h4>
      <p>
        BO <strong>${sleeveCapBO} ok</strong> na začátku 2 řad.  
        Dále <strong>${capDec}×</strong> ujmout v každém lícovém řádku.  
        Nakonec BO <strong>${capRemain} ok</strong>.
      </p>
    `;

    // zobrazit tisk
    const printBtn = $('printBtn');
    if (printBtn) printBtn.style.display = 'inline-block';
  }

  // --- EVENTY ---
  const calcBtn = $('calc');
  if (calcBtn) {
    calcBtn.addEventListener('click', generate);
  }

});
