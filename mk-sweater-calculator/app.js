document.getElementById("calculate").addEventListener("click", () => {
  const gauge = parseFloat(document.getElementById("gauge").value); // oka / 10 cm
  const width = parseFloat(document.getElementById("width").value); // cm
  const length = parseFloat(document.getElementById("length").value); // cm

  const resultEl = document.getElementById("result");

  if (!gauge || !width || !length) {
    resultEl.innerText = "Vyplň všechny hodnoty.";
    return;
  }

  // =========================
  // ZÁKLADNÍ PŘEPOČTY
  // =========================
  const stitchesPerCm = gauge / 10;
  const bodyStitches = Math.round(stitchesPerCm * width);

  // =========================
  // TĚLO (přední + zadní díl)
  // =========================
  const bodyArea = width * length * 2;

  // =========================
  // RUKÁVY – VSAZENÉ
  // osvědčený odhad: 40 % plochy těla
  // =========================
  const sleeveArea = bodyArea * 0.40;

  // =========================
  // CELKOVÁ SPOTŘEBA
  // =========================
  let totalArea = bodyArea + sleeveArea;

  // koeficient spotřeby (klasický svetr, hladký vzor)
  let yarnEstimate = totalArea * 0.028;

  // rezerva 12 %
  yarnEstimate *= 1.12;

  yarnEstimate = Math.round(yarnEstimate);

  // =========================
  // VÝSTUP
  // =========================
  resultEl.innerHTML = `
    <strong>Konstrukce:</strong> svetr s vsazeným rukávem<br>
    <strong>Počet ok (šířka těla):</strong> ${bodyStitches}<br>
    <strong>Odhad spotřeby:</strong> cca ${yarnEstimate} g příze
  `;
});
