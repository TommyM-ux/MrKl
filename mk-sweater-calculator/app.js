document.getElementById("calculate").addEventListener("click", () => {
  const gauge = parseFloat(document.getElementById("gauge").value);
  const width = parseFloat(document.getElementById("width").value);
  const length = parseFloat(document.getElementById("length").value);

  if (!gauge || !width || !length) {
    document.getElementById("result").innerHTML = "Vyplň všechny hodnoty.";
    return;
  }

  // počet ok na šířku
  const stitches = Math.round((gauge / 10) * width);

  // velmi hrubý odhad spotřeby (zatím jen demo)
  const area = width * length; // cm²
  const yarnEstimate = Math.round(area * 0.03); // g – placeholder logika

  document.getElementById("result").innerHTML = `
    <h2>Výsledek</h2>
    <p><strong>Počet ok:</strong> ${stitches}</p>
    <p><strong>Odhad spotřeby:</strong> cca ${yarnEstimate} g příze</p>
  `;
});
