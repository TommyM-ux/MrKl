document.getElementById("calculate").addEventListener("click", () => {
  const gauge = parseFloat(document.getElementById("gauge").value);
  const width = parseFloat(document.getElementById("width").value);
  const length = parseFloat(document.getElementById("length").value);

  if (!gauge || !width || !length) {
    document.getElementById("result").innerText = "Vyplň všechny hodnoty.";
    return;
  }

  const stitches = Math.round((gauge / 10) * width);
  const area = width * length;
  const yarnEstimate = Math.round(area * 0.03);

  document.getElementById("result").innerHTML = `
    <strong>Počet ok:</strong> ${stitches}<br>
    <strong>Odhad spotřeby:</strong> cca ${yarnEstimate} g příze
  `;
});
