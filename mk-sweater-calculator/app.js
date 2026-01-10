document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    const EVEN = n => Math.round(n / 2) * 2;
  
    function generate() {
        // Kontrola, zda jsou pole vyplněná
        if (!$('sts').value || !$('rows').value || !$('finished').value) {
            alert('Prosím, vyplňte všechna pole pro výpočet.');
            return;
        }

        const mode = $('mode').value;
        const finished = parseFloat($('finished').value);
        const stsValue = parseFloat($('sts').value);
        const rowsValue = parseFloat($('rows').value);
        const stsPerCm = stsValue / 10;
        const rowsPerCm = rowsValue / 10;
        const sleeveTop = EVEN(parseFloat($('sleeveTop').value));
  
        // Orientační délky
        const bodyLenCm = Math.round(finished * 0.38);
        const sleeveLenCm = Math.round(finished * 0.45);
  
        // Tělo
        const totalSts = EVEN(finished * stsPerCm);
        const pieceSts = totalSts / 2;
  
        // Průramek
        const armDepthPct = mode === 'KF' ? 0.245 : 0.22;
        const armRows = EVEN(Math.round(finished * armDepthPct * rowsPerCm));
        const armDrop = mode === 'KF' ? 12 : EVEN(pieceSts * 0.08);
        const armBO = mode === 'KF' ? 3 : Math.max(2, Math.floor(armDrop * 0.3));
        const armDec = Math.floor((armDrop - armBO * 2) / 2);
        const armRemain = pieceSts - armDrop;
  
        // Hlavice rukávu
        const sleeveCapBO = mode === 'KF' ? 3 : Math.max(2, Math.round(sleeveTop * 0.05));
        const capRemain = Math.min(26, Math.max(14, EVEN(sleeveTop * 0.18)));
        const capDec = Math.floor((sleeveTop - sleeveCapBO * 2 - capRemain) / 2);
  
        // Renderování výsledku do divu s id="out"
        $('out').innerHTML = `
            <div class="mk-toggle no-print" style="margin-bottom: 20px; background: #f9f9f9; padding: 10px; border-radius: 8px;">
                <label style="cursor:pointer; font-weight: bold;">
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
                <p>Na začátku následujících 2 řad uzavřete <strong>${armBO} oka</strong>.</p>
                <p>Dále <strong>${armDec}×</strong> opakujte: 1 řada upleťte rovně, v následující řadě ujměte 1 oko na každém konci. Zůstane <strong>${armRemain} ok</strong>. Výška průramku: cca <strong>${armRows} řad</strong>.</p>
    
                <h4>Rukáv a hlavice</h4>
                <p>Pletete do délky <strong>${sleeveLenCm} cm</strong> k bicepsu (<strong>${sleeveTop} ok</strong>). 
                Poté uzavřete <strong>${sleeveCapBO} oka</strong> na začátku příštích 2 řad. 
                Následně <strong>${capDec}×</strong> ujměte 1 oko na každém konci v každém lícovém řádku. 
                Nakonec uzavřete zbývajících <strong>${capRemain} ok</strong> najednou.</p>
            </div>
    
            <div id="compactText" style="display:none">
                <h3>Stručný přehled (tahák)</h3>
                <p>
                    <strong>Tělo:</strong> ${pieceSts} ok<br>
                    <strong>Průramek:</strong> BO ${armBO}, ${armDec}× ujmout ob řadu (${armRows} řad)<br>
                    <strong>Rukáv:</strong> ${sleeveTop} ok<br>
                    <strong>Hlavice:</strong> BO ${sleeveCapBO}, ${capDec}× ujmout na každém líci, BO ${capRemain}
                </p>
            </div>
        `;
  
        // Aktivace přepínače po vygenerování
        const toggle = $('compactToggle');
        if (toggle) {
            toggle.onchange = e => {
                $('fullText').style.display = e.target.checked ? 'none' : 'block';
                $('compactText').style.display = e.target.checked ? 'block' : 'none';
            };
        }
  
        // Zobrazení tlačítka pro tisk
        $('printBtn').style.display = 'inline-block';
    }
  
    // Připojení funkce na tlačítko
    const calcBtn = $('calc');
    if (calcBtn) {
        calcBtn.onclick = generate;
    }
});
