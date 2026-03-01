/* Raglan Studio – shared engine + text generator
   No dependencies, GitHub Pages friendly.
*/
(function(){
  const $ = (id) => document.getElementById(id);

  // --- helpers
  function inchesToCm(inches){ return inches * 2.54; }
  function roundToMultiple(n, m){
    if (!m || m<=1) return Math.round(n);
    return Math.round(n/m)*m;
  }
  function clamp(n, a, b){ return Math.min(b, Math.max(a, n)); }
  function isNum(x){ return typeof x === 'number' && Number.isFinite(x); }
  function toNum(v){ const n = (v==null||v==="") ? NaN : Number(v); return n; }
  function fmt1(n){ return (Math.round(n*10)/10).toString(); }
  function fmt0(n){ return (Math.round(n)).toString(); }

  function distributeModern(CO, raglanLineSts, sleeveRatio){
    const raglanTotal = 4*raglanLineSts;
    const rest = CO - raglanTotal;
    if (rest < 0) return { error: "Málo ok: raglán čáry jsou širší než nahazování." };
    const sleevesTotal = Math.max(0, Math.round(rest * sleeveRatio));
    let sleeveEach = Math.round(sleevesTotal/2);
    // keep sum exact by computing bodyRest after sleeve rounding
    const bodyRest = rest - 2*sleeveEach;
    let front = Math.round(bodyRest/2);
    let back = bodyRest - front;
    return { raglanLineSts, raglanTotal, rest, sleeveEach, front, back };
  }

  // Each increase round adds +2 to front, +2 to back, +2 to each sleeve (assuming standard raglan inc at each corner)
  function computeIncRounds(dist0, bodyAtSplitTarget, sleeveAtSplitTarget){
    const needFront = Math.max(0, bodyAtSplitTarget/2 - dist0.front);
    const needBack  = Math.max(0, bodyAtSplitTarget/2 - dist0.back);
    const needSleeve = Math.max(0, sleeveAtSplitTarget - dist0.sleeveEach);
    const rFront = Math.ceil(needFront / 2);
    const rBack  = Math.ceil(needBack / 2);
    const rSleeve= Math.ceil(needSleeve / 2);
    return Math.max(rFront, rBack, rSleeve);
  }

  function calcRaglan(inputs, preset){
    const warnings = [];
    const notes = [];
    const gSt10 = +inputs.gSt10;
    const gRow10= +inputs.gRow10;
    const chest = +inputs.chestCm;

    if (!(gSt10>0) || !(gRow10>0) || !(chest>0)){
      return { error: "Chybí rozumné hodnoty: gauge a hrudník musí být > 0." };
    }

    const stPerCm = gSt10/10;
    const rowPerCm= gRow10/10;

    const easeIn = inputs.fit === "snug" ? 2 : (inputs.fit === "loose" ? 6 : 4);
    const easeCm = inchesToCm(easeIn);
    const targetChestCm = chest + easeCm;

    const K = Math.round(targetChestCm * stPerCm); // target body circumference in stitches

    const raglanLineSts = Math.max(1, Math.min(4, Math.round(+inputs.raglanLineSts || preset.raglanLineSts || 1)));
    const sleeveRatio = clamp(+inputs.sleeveRatio || preset.sleeveRatio, 0.24, 0.40);

    // Neckline cm: override or ratio, and in kids check head
    let neckCm = (toNum(inputs.neckCm) > 0) ? +inputs.neckCm : (targetChestCm * preset.neckRatio);
    let headAdjusted = false;
    if (preset.mode === "kids" && toNum(inputs.headCm) > 0){
      const headCm = +inputs.headCm;
      const reserve = preset.headReserveCm;
      const minNeck = Math.max(0, headCm - reserve);
      if (neckCm < minNeck){
        neckCm = minNeck;
        headAdjusted = true;
        warnings.push("Výstřih byl menší než obvod hlavy (minus rezerva) → automaticky jsem ho zvětšil(a), aby to prošlo přes hlavu.");
      }
    }

    let CO = roundToMultiple(neckCm * stPerCm, 4);

    // Guard: CO must be larger than raglanTotal + minimal stitches
    const dist0 = distributeModern(CO, raglanLineSts, sleeveRatio);
    if (dist0.error) return { error: dist0.error };

    // Underarm each
    let uaEach;
    if (toNum(inputs.underarmEach) >= 0){
      uaEach = Math.round(+inputs.underarmEach);
    } else {
      const uaPct = clamp(toNum(inputs.underarmPct) || preset.underarmPct, 0, 18);
      uaEach = Math.round(((uaPct/100) * K) / 2);
    }
    if (uaEach < 2) warnings.push("Podpaží vychází malé. Pokud to bude táhnout, přidej 2–4 oka do podpaží.");

    // Upper arm target
    let upperArmCm = (toNum(inputs.upperArmCm) > 0) ? +inputs.upperArmCm : (targetChestCm * preset.upperArmRatio);
    const sleeveTargetSts = Math.round(upperArmCm * stPerCm);

    // Split targets before underarm add-ons
    const bodyAtSplitTarget = K - 2*uaEach;
    const sleeveAtSplitTarget = sleeveTargetSts - uaEach;

    const incRounds = computeIncRounds(dist0, bodyAtSplitTarget, sleeveAtSplitTarget);

    // construction: pullover = increases every 2nd round (incEvery=2), cardigan (flat) = every RS row (incEvery=1)
    const incEvery = (inputs.construction === "cardigan") ? 1 : (toNum(inputs.incEvery) > 0 ? Math.round(+inputs.incEvery) : 2);
    const totalRounds = incRounds * incEvery;
    const yokeDepthCm = totalRounds / rowPerCm;

    const sleeveEachSplit = dist0.sleeveEach + incRounds*2;
    const frontSplit = dist0.front + incRounds*2;
    const backSplit  = dist0.back + incRounds*2;
    const bodySplit  = frontSplit + backSplit;

    const bodyAfterUA = bodySplit + 2*uaEach;
    const sleeveAfterUA = sleeveEachSplit + uaEach;

    // Bust/front-volume shaping via German Short Rows (adult only)
    let gsr = null;
    let gsrBack = null;
    if (preset.mode === "adult"){
      const fv = inputs.frontVolume || "standard";
      const extraCm = (fv === "full") ? preset.gsrFullCm : (fv === "mild" ? preset.gsrMildCm : 0);
      if (extraCm > 0){
        const extraRows = Math.max(2, Math.round(extraCm * rowPerCm)); // total additional rows desired
        const pairs = Math.max(1, Math.ceil(extraRows/2)); // each pair ~2 rows
        // We turn into sleeves a bit so the transition isn't harsh.
        const maxIntoSleeve = Math.max(4, Math.floor(sleeveEachSplit * 0.35));
        const startIntoSleeve = Math.min(maxIntoSleeve, Math.max(6, Math.floor(sleeveEachSplit * 0.25)));
        const step = Math.max(4, Math.floor((maxIntoSleeve - startIntoSleeve) / Math.max(1, pairs-1)));
        gsr = {
          extraCm, extraRows, pairs,
          startIntoSleeve,
          step
        };
        notes.push("Krátké řady (GSR) přidají délku jen vpředu – svetr se pak netáhne dozadu a výstřih se nezvedá.");

      // Back-neck-rise via German Short Rows (adult only) – helps the sweater sit properly at the neck/shoulders
      const bnr = inputs.backNeckRise || "off";
      const backPairs = (bnr === "full") ? 4 : (bnr === "mild" ? 2 : 0);
      if (backPairs > 0){
        const maxIntoSleeveB = Math.max(4, Math.floor(sleeveEachSplit * 0.30));
        const startIntoSleeveB = Math.min(maxIntoSleeveB, Math.max(6, Math.floor(sleeveEachSplit * 0.18)));
        const stepB = Math.max(3, Math.floor((maxIntoSleeveB - startIntoSleeveB) / Math.max(1, backPairs-1)));
        gsrBack = { pairs: backPairs, startIntoSleeve: startIntoSleeveB, step: stepB };
        notes.push("GSR pro zvednutí zadního krku zlepší posed: svetr nesjíždí dozadu a výstřih netáhne.");
      }

      }
    }

    // sanity warnings
    if (yokeDepthCm > targetChestCm * 0.40) warnings.push("Sedlo vyšlo dost hluboké. Pokud nechceš 'netopýří rukávy', zvaž vyšší podpaží, menší rukávy nebo jiný výstřih.");
    if (CO < 40) warnings.push("Nahazování je hodně malé – u dospělých to bude spíš rolák. Zkontroluj výstřih.");

    return {
      presetName: preset.name,
      mode: preset.mode,
      stPerCm, rowPerCm,
      chestCm: chest,
      easeCm, targetChestCm,
      K,
      neckCm, CO, headAdjusted,
      raglanLineSts, sleeveRatio,
      dist0,
      incRounds, incEvery, totalRounds, yokeDepthCm,
      uaEach,
      upperArmCm, sleeveTargetSts,
      sleeveEachSplit, frontSplit, backSplit, bodySplit,
      bodyAfterUA, sleeveAfterUA,
      gsr,
      gsrBack,
      warnings,
      notes,
      inputs
    };
  }

  // --- text generators (Czech, "Drops-ish" tone)
  function genText(res){
    const st10 = res.inputs.gSt10, row10 = res.inputs.gRow10;
    const pullover = res.inputs.construction !== "cardigan";
    const incPhrase = pullover ? "v každém 2. kole" : "v každé lícové řadě";
    const joinPhrase = pullover ? "Spojíme do kruhu a označíme začátek kola." : "Pleteme tam a zpět (rozparek na předním díle).";

    const dist = res.dist0;
    const ragTotal = 4*res.raglanLineSts;

    const lines = [];
    lines.push(`TOP‑DOWN RAGLÁN – ${res.mode === "kids" ? "DĚTSKÝ" : "DOSPĚLÝ"} (${pullover ? "pulovr v kruhu" : "cardigan tam a zpět"})`);
    lines.push("");
    lines.push(`Zkušební vzorek: ${st10} ok a ${row10} řad = 10 × 10 cm.`);
    lines.push(`(= ${fmt1(res.stPerCm)} oka/cm, ${fmt1(res.rowPerCm)} řady/cm)`);
    lines.push("");
    lines.push(`Cíl: hrudník ${fmt1(res.chestCm)} cm + volnost ${fmt1(res.easeCm)} cm ⇒ cílový obvod cca ${fmt1(res.targetChestCm)} cm (≈ ${res.K} ok).`);
    lines.push("");

    lines.push(`1) NAHOZENÍ A ZNAČKY`);
    lines.push(`Nahodíme ${res.CO} ok pro výstřih (≈ ${fmt1(res.neckCm)} cm). ${joinPhrase}`);
    if (res.mode==="kids" && res.headAdjusted){
      lines.push(`Pozn.: Výstřih byl automaticky zvětšen kvůli obvodu hlavy, aby to prošlo přes hlavu.`);
    }
    lines.push(`Raglánové čáry: ${res.raglanLineSts} oko/oka na čáru (celkem ${ragTotal} ok).`);
    lines.push(`Rozmístíme značky takto (mezi díly vždy raglánová čára):`);
    lines.push(`• Záda: ${dist.back} ok`);
    lines.push(`• Rukáv 1: ${dist.sleeveEach} ok`);
    lines.push(`• Předek: ${dist.front} ok`);
    lines.push(`• Rukáv 2: ${dist.sleeveEach} ok`);
    lines.push("");

    lines.push(`2) SEDLO – PŘIDÁVÁNÍ`);
    lines.push(`Přidáváme kolem každé raglánové čáry (na obou stranách): ${incPhrase}.`);
    lines.push(`Opakujeme celkem ${res.incRounds}× přidávací “kolo/řadu”.`);
    lines.push(`Celkem upleteme přibližně ${res.totalRounds} kol/řad sedla ⇒ sedlo měří cca ${fmt1(res.yokeDepthCm)} cm.`);
    lines.push("");
    if (res.gsrBack){
      lines.push(`3) KRÁTKÉ ŘADY (GSR) – ZVEDNUTÍ ZADNÍHO KRKU`);
      lines.push(`Proč: zadní část u krku bude o trochu vyšší, svetr pak lépe sedí na ramenou a nesjíždí dozadu.`);
      lines.push(`Uděláme ${res.gsrBack.pairs}× krátké řady (GSR) na každé straně (kolem zadního dílu).`);
      lines.push(`Postup (zjednodušeně):`);
      lines.push(`• Pleť k raglánové značce mezi ZÁDY a RUKÁVEM.`);
      lines.push(`• Pokračuj ještě ${res.gsrBack.startIntoSleeve} ok do rukávu, otoč práci, udělej “dvojité oko” (GSR) a pleť zpět přes zadní díl.`);
      if (res.gsrBack.pairs > 1){
        lines.push(`• Každou další otočku posuň cca o ${res.gsrBack.step} ok dál do rukávu.`);
      }
      lines.push(`• Pak pokračuj zase běžně; “dvojité oko” upleť jako jedno oko.`);
      lines.push("");
    }
    if (res.gsr){
      const frontStep = 3 + (res.gsrBack ? 1 : 0);
      lines.push(`${frontStep}) KRÁTKÉ ŘADY (GSR) – TVAROVÁNÍ PŘEDKU`);
      lines.push(`Proč: přidáme délku jen vpředu, aby se svetr netáhl dozadu a výstřih se nezvedal.`);
      lines.push(`Uděláme ${res.gsr.pairs}× krátké řady (GSR) na každé straně.`);

      lines.push(`Postup (zjednodušeně):`);
      lines.push(`• Pleť v kruhu k raglánové značce mezi PŘEDKEM a RUKÁVEM.`);
      lines.push(`• Pokračuj ještě ${res.gsr.startIntoSleeve} ok do rukávu, otoč práci, udělej “dvojité oko” (GSR) a pleť zpět.`);
      lines.push(`• Na druhé straně udělej totéž: za raglánovou značku pokračuj ${res.gsr.startIntoSleeve} ok do rukávu, otoč, GSR, zpět.`);
      if (res.gsr.pairs > 1){
        lines.push(`• Každou další otočku posuň cca o ${res.gsr.step} ok dál do rukávu (až do ~35 % rukávu).`);
      }
      lines.push(`• Pak pokračuj zase běžně v kruhu; “dvojité oko” upleť jako jedno oko.`);
      lines.push("");
      lines.push(`Pozn.: Pokud GSR nechceš, vypni “Přední objem” nebo nastav na “standard”.`);
      lines.push("");
    }

    const splitStep = 3 + (res.gsrBack ? 1 : 0) + (res.gsr ? 1 : 0);
    lines.push(`${splitStep}) ROZDĚLENÍ NA TRUP A RUKÁVY`);
    lines.push(`Když máš přibližně: rukáv ${res.sleeveEachSplit} ok, předek ${res.frontSplit} ok, záda ${res.backSplit} ok:`);
    lines.push(`• Odložíme ok rukávu 1 (${res.sleeveEachSplit} ok) na pomocnou přízi.`);
    lines.push(`• Nahodíme podpaží ${res.uaEach} ok.`);
    lines.push(`• Upleteme přední díl + zadní díl (celkem ${res.bodySplit} ok v těle bez podpaží).`);
    lines.push(`• Odložíme ok rukávu 2 (${res.sleeveEachSplit} ok).`);
    lines.push(`• Nahodíme druhé podpaží ${res.uaEach} ok.`);
    lines.push(`Trup má teď ${res.bodyAfterUA} ok.`);
    lines.push("");
    lines.push(`5) TRUP`);
    lines.push(`Pleteme rovně do požadované délky. (Zúžení/pasování je volitelně – to už je “styling”.)`);
    lines.push("");
    lines.push(`6) RUKÁVY`);
    lines.push(`Naberi odložená oka rukávu a podpaží: každý rukáv má ${res.sleeveAfterUA} ok.`);
    lines.push(`Pleť do délky, případně zužuj (např. 2 oka ubrat každých 6–10 cm podle požadované štíhlosti).`);
    lines.push("");
    lines.push(`KONTROLA FITU (rychlá realita)`);
    lines.push(`• Táhne to v podpaží? → přidej 2–6 ok do podpaží.`);
    lines.push(`• Výstřih těsný? → zvětši výstřih (nebo u cardigan udělej rozparek / knoflíky).`);
    lines.push(`• Rukávy moc volné? → sniž “podíl rukávu” nebo začni zužovat dřív.`);
    if (res.warnings && res.warnings.length){
      lines.push("");
      lines.push(`VAROVÁNÍ / POZNÁMKY:`);
      for (const w of res.warnings) lines.push(`• ${w}`);
    }
    return lines.join("\n");
  }

  // --- UI glue
  function readInputs(prefix){
    // prefix allows page-specific IDs, but we keep shared names
    return {
      gSt10: toNum($(prefix+"gSt10")?.value),
      gRow10: toNum($(prefix+"gRow10")?.value),
      chestCm: toNum($(prefix+"chest")?.value),
      fit: $(prefix+"fit")?.value || "comfortable",
      construction: $(prefix+"construction")?.value || "pullover",
      neckCm: toNum($(prefix+"neck")?.value),
      headCm: toNum($(prefix+"head")?.value),
      raglanLineSts: toNum($(prefix+"raglanLine")?.value),
      sleeveRatio: toNum($(prefix+"sleeveRatio")?.value),
      underarmPct: toNum($(prefix+"underarmPct")?.value),
      underarmEach: toNum($(prefix+"underarmEach")?.value),
      upperArmCm: toNum($(prefix+"upperArm")?.value),
      incEvery: toNum($(prefix+"incEvery")?.value),
      frontVolume: $(prefix+"frontVolume")?.value || "standard",
      backNeckRise: $(prefix+"backNeckRise")?.value || "off"
    };
  }

  function saveState(key, inputs){
    try{ localStorage.setItem(key, JSON.stringify(inputs)); }catch(e){}
  }
  function loadState(key){
    try{
      const s = localStorage.getItem(key);
      if (!s) return null;
      return JSON.parse(s);
    }catch(e){ return null; }
  }
  function applyState(prefix, st){
    if (!st) return;
    const set = (id, val) => { const el = $(prefix+id); if (!el) return; el.value = val; };
    set("gSt10", st.gSt10 ?? "");
    set("gRow10", st.gRow10 ?? "");
    set("chest", st.chestCm ?? "");
    set("fit", st.fit ?? "comfortable");
    set("construction", st.construction ?? "pullover");
    set("neck", st.neckCm ?? "");
    set("head", st.headCm ?? "");
    set("raglanLine", st.raglanLineSts ?? 1);
    set("sleeveRatio", st.sleeveRatio ?? "");
    set("underarmPct", st.underarmPct ?? "");
    set("underarmEach", st.underarmEach ?? "");
    set("upperArm", st.upperArmCm ?? "");
    set("incEvery", st.incEvery ?? "");
    set("frontVolume", st.frontVolume ?? "standard");
  }

  // public init
  window.RaglanStudio = {
    presets: {
      adult: { name:"Adult", mode:"adult", neckRatio:0.40, sleeveRatio:0.30, underarmPct:8, upperArmRatio:0.36, raglanLineSts:1, gsrMildCm:1.0, gsrFullCm:2.0, headReserveCm:2 },
      kids:  { name:"Kids",  mode:"kids",  neckRatio:0.48, sleeveRatio:0.30, underarmPct:6, upperArmRatio:0.34, raglanLineSts:1, gsrMildCm:0, gsrFullCm:0, headReserveCm:2 }
    },
    calcRaglan,
    genText,
    readInputs,
    saveState,
    loadState,
    applyState
  };
})();
