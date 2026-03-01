(function(){
  const $ = (id) => document.getElementById(id);

  function initPage(opts){
    const prefix = opts.prefix || "";
    const preset = opts.preset;
    const storageKey = opts.storageKey || ("raglan-studio-"+preset.mode);

    // restore
    const st = window.RaglanStudio.loadState(storageKey);
    window.RaglanStudio.applyState(prefix, st);

    function calcAndRender(){
      const inputs = window.RaglanStudio.readInputs(prefix);
      window.RaglanStudio.saveState(storageKey, inputs);

      const res = window.RaglanStudio.calcRaglan(inputs, preset);
      const warnEl = $(prefix+"warn");
      const okEl = $(prefix+"ok");
      const outEl = $(prefix+"out");
      const factsEl = $(prefix+"facts");

      if (res.error){
        warnEl.textContent = res.error;
        okEl.textContent = "";
        outEl.value = "";
        if (factsEl) factsEl.innerHTML = "";
        return;
      }

      warnEl.textContent = (res.warnings && res.warnings.length) ? res.warnings.join(" • ") : "";
      okEl.textContent = (res.notes && res.notes.length) ? res.notes.join(" • ") : "";

      // quick facts (small)
      if (factsEl){
        const f = [];
        f.push(`<span class="badge">CO ${res.CO} ok</span>`);
        f.push(`<span class="badge">Sedlo ~${Math.round(res.totalRounds)} řad/k</span>`);
        f.push(`<span class="badge">Hloubka ~${Math.round(res.yokeDepthCm*10)/10} cm</span>`);
        f.push(`<span class="badge">Podpaží ${res.uaEach}+${res.uaEach} ok</span>`);
        if (res.gsr) f.push(`<span class="badge">GSR ${res.gsr.pairs}×/str</span>`);
        factsEl.innerHTML = f.join(" ");
      }

      const txt = window.RaglanStudio.genText(res);
      outEl.value = txt;
      const outHtml = $(prefix+"outHtml");
      if (outHtml){ outHtml.textContent = txt; }
    }

    // bind
    const ids = ["gSt10","gRow10","chest","fit","construction","neck","head","raglanLine","sleeveRatio","underarmPct","underarmEach","upperArm","incEvery","frontVolume","backNeckRise"];
    for (const id of ids){
      const el = $(prefix+id);
      if (!el) continue;
      el.addEventListener("input", calcAndRender);
      el.addEventListener("change", calcAndRender);
    }

    $(prefix+"printBtn")?.addEventListener("click", () => { window.print(); });
$(prefix+"reset")?.addEventListener("click", () => {
      localStorage.removeItem(storageKey);
      location.reload();
    });

    // initial render
    calcAndRender();
  }

  window.initRaglanStudioPage = initPage;
})();
