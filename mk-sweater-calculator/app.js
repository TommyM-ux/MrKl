(() => {
  const byId = (id) => document.getElementById(id);

  const gaugeEl = byId("gauge");
  const widthEl = byId("width");
  const lengthEl = byId("length");
  const btnEl = byId("calculate");
  const resultEl = byId("result");

  // Když něco nesedí, řekneme to přímo do stránky
  const missing = [];
  if (!gaugeEl) missing.push("#gauge");
  if (!widthEl) missing.push("#width");
  if (!lengthEl) missing.push("#length");
  if (!btnEl) missing.push("#calculate");
  if (!resultEl) missing.push("#result");

  if (missing.length) {
    // fallback: když není resultEl, aspoň log
    console.error("Chybí prvky v HTML:", missing.join(", "));
    if (resultEl) {
      resultEl.innerHTML = `Chybí prvky v HTML: <strong>${missing.join(", ")}</strong>`;
    }
    return;
  }

  btnEl.addEventListener("click", () => {
    const gauge = parseFloat(gaugeEl.value);   // oka / 10 cm
    const width = parseFloat(widthEl.value);   // cm
    const length = parseFloat(lengthEl.value); // cm

    if (!gauge || !width || !length) {
      resultEl.innerText = "Vyplň všechny hodnoty.";
      return;
    }

    // =========================
    // VSAZENÉ RUKÁVY (set-in)
    // =========================

    // hustota na 1 cm
    const stitchesPerCm = gauge / 10;

    // oka na šířku těla (orientačně pro jeden díl / obvod podle toho, co zadáváš)
    const bodyStitches = Math.round(stitchesPerCm * width);

    // plocha těla: přední + zadní díl
    const bodyArea = width * length * 2;

    // rukávy u vsazené konstrukce: typicky ~40 % plochy těla (orientační)
    const sleeveArea = bodyArea * 0.40;

    // celkem
    const totalArea = bodyArea + sleeveArea;

    // koeficient spotřeby pro hladký základ (orientační)
    let yarnEstimate = totalArea * 0.028;

    // rezerva (uzly, vzorek, délky, chyba v měření)
    yarnEstimate *= 1.12;

    yarnEstimate = Math.round(yarnEstimate);

    resultEl.innerHTML = `
      <h2>Výsledek</h2>
      <p><strong>Konstrukce:</strong> svetr s vsazeným rukávem</p>
      <p><strong>Počet ok (na šířku):</strong> ${bodyStitches}</p>
      <p><strong>Odhad spotřeby:</strong> cca ${yarnEstimate} g příze</p>
    `;
  });
})();
