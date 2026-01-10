document.getElementById("calculate").onclick = function () {
  const gauge = Number(document.getElementById("gauge").value);
  const width = Number(document.getElementById("width").value);
  const length = Number(document.getElementById("length").value);
  const result = document.getElementById("result");

  if (!gauge || !width || !length) {
    result.innerHTML = "Vyplň všechny hodnoty.";
    return;
  }

  // ===== STEJNÉ CHOVÁNÍ JAKO PŘEDTÍM =====
  // jen upravený výpočet

  const stitchesPerCm = gauge / 10;
  const bodyStitches = Math.round(stitchesPerCm * width);

  // tělo: přední + zadní díl
  const bodyArea = width * length * 2;

  // vsazené rukávy ~40 % těla
  const sleeveArea = bodyArea * 0.40;

  let totalArea = bodyArea + sleeveArea;

  // spotřeba + rezerva
  let yarn = totalArea * 0.028;
  yarn = yarn * 1.12;
  yarn = Math.round(yarn);

  result.innerHTML =
    "<strong>Počet ok:</strong> " + bodyStitches + "<br>" +
    "<strong>Odhad spotřeby:</strong> cca " + yarn + " g příze";
};
