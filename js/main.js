/* PWA stuff */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('service-worker.js').then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(error) {
        console.log('ServiceWorker registration failed: ', error);
      });
    });
  } 
 
 function v60(){
    const oz = document.getElementById("v60_oz").value;
    const ml = oz * 29.5735296;
    const ratio = 16;

    // les calculations
    const beans = Math.round((ml/ratio),0);
    const s0 = (Math.round((beans*3) / 10) * 10);
    const diff = ((ml - s0)/5);
    const s1 = Math.round((s0 + diff));
    const s2 = Math.round((s1 + diff));
    const s3 = Math.round((s2 + diff));
    const s4 = Math.round((s3 + diff));
    const s5 = Math.round((s4 + diff));

    // les updates
    document.getElementById("v60_vol").innerText = `${oz} oz`;
    document.getElementById("v60_beans").innerText = beans.toFixed(0);
    document.getElementById("v60_stage_0").innerText = s0.toFixed(0);
    document.getElementById("v60_stage_1").innerText = s1.toFixed(0);
    document.getElementById("v60_stage_2").innerText = s2.toFixed(0);
    document.getElementById("v60_stage_3").innerText = s3.toFixed(0);
    document.getElementById("v60_stage_4").innerText = s4.toFixed(0);
    document.getElementById("v60_stage_5").innerText = s5.toFixed(0);

    console.debug(`v60: ${[oz, ml, beans, s0, diff, s1, s2, s3, s4, s5]}`)
  }

  function aero(){
    const ml = document.querySelector('input[name="aero_ml"]:checked').value;
    const ratio = 14;

    // les calculations
    const beans = Math.round((ml/ratio),0);
    if (ml > 200){
      document.getElementById("aero_warning").style.display = 'block';
    } else{
      document.getElementById("aero_warning").style.display = 'none';
    }
    document.getElementById("aero_warning_text").innerText = ml;

    // les updates
    document.getElementById("aero_beans").innerText = beans.toFixed(0);
    console.debug(`aero: ${[ml, beans]}`)
  }

  function drip(){
    const cups = document.getElementById("v60_cups").value;
    const ratio = 20;

    // les calculations
    const ml = 5 * cups * 29.5735296;
    const beans = Math.round((ml/ratio),0);
    
    // les updates
    document.getElementById("drip_vol").innerText = `${cups} cups`;
    document.getElementById("drip_beans").innerText = beans.toFixed(0);
    if (cups <= 4){
      document.getElementById("drip_instructions").innerHTML = `<p>Use small wavy filter with grey pourover insert and slide basket toggle to the left.`;
    } else {
      document.getElementById("drip_instructions").innerHTML = `<p>Use large wavy filter <em>without</em> grey insert.</p><p>Slide basket toggle to the right for carafe.</p>`;
    }
  }

  function iced(){

  }

  //Everything below this is some (edited) AI shit.
  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom > 0 &&
      rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
      rect.right > 0
    );
  }

  window.addEventListener('scroll', () => {
    const img = document.querySelector('img.head');
    const nav = document.getElementById("nav");
    console.debug('is img visible?', isVisible(img));
    if (isVisible(img)){
      nav.classList.remove("nav_padding");
    } else {
      nav.classList.add("nav_padding");
    }
  });

  /* wakelock stuff will only work from https */
  async function wakeOn(){
    try {
      window.currentWakeLock = await navigator.wakeLock.request();
      console.debug('Wake lock ON');
      console.debug(window.currentWakeLock);
    } catch (err) {
      console.debug(`${err.name}, ${err.message}`);
    }
  }

  function wakeOff(){
    try{
      window.currentWakeLock.release(); 
      console.debug('Wake lock OFF');
      console.debug(window.currentWakeLock);
    } catch (err){
      //console.debug(`${err.name}, ${err.message}`);
      window.currentWakeLock = null;
    }
  }

  // Toggle recipe/wake mode via button
  async function setRecipeMode(enabled){
    const btn = document.getElementById('wake_btn');
    const wakeContainer = document.getElementById('wake');
    if (!btn) return;
    if (!navigator.wakeLock){
      console.debug("Your device does not support the Wake Lock API.");
      if (wakeContainer) wakeContainer.style.display = 'none';
      return;
    }

    if (enabled) {
      await wakeOn();
      btn.classList.add('on');
      btn.textContent = 'Recipe Mode ON';
      btn.setAttribute('aria-pressed','true');
      try{ localStorage.setItem('kopi.recipeMode','true'); } catch(e){/* ignore */}
    } else {
      wakeOff();
      btn.classList.remove('on');
      btn.textContent = 'Recipe Mode OFF';
      btn.setAttribute('aria-pressed','false');
      try{ localStorage.setItem('kopi.recipeMode','false'); } catch(e){/* ignore */}
    }
  }


  // onload, fire the script with defaults.
  document.addEventListener('DOMContentLoaded', (event) => {    
    v60();
    aero();
    drip();
    iced();

    const btn = document.getElementById('wake_btn');
    const wakeContainer = document.getElementById('wake');
    // If button exists, wire it up; otherwise continue (wake lock optional)
    if (btn) {
      // Hide control if Wake Lock API not available
      if (!navigator.wakeLock){ if (wakeContainer) wakeContainer.style.display = 'none'; }

      // initialize button state based on saved preference (default OFF)
      const saved = (function(){ try{ return localStorage.getItem('kopi.recipeMode'); } catch(e){ return null; }})();
      const startOn = saved === 'true';
      if (startOn) {
        // best-effort: try to enable wake lock, but don't block init if it fails
        setRecipeMode(true).catch(()=>{});
      } else {
        btn.classList.remove('on');
        btn.textContent = 'Recipe Mode OFF';
        btn.setAttribute('aria-pressed','false');
      }

      btn.addEventListener('click', async function(){
        const isOn = btn.getAttribute('aria-pressed') === 'true';
        await setRecipeMode(!isOn);
      });
    }

    // Initialize mobile tab UI and iced toggle
    initTabs();
    initIcedToggle();
  });

  // Re-acquire wake lock when returning to the page if recipe mode was enabled
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible'){
      const btn = document.getElementById('wake_btn');
      if (btn && btn.getAttribute('aria-pressed') === 'true'){
        await wakeOn();
      }
    }
  });

  // --- Mobile tab UI functions ---
  function activateTab(name){
    const sections = document.querySelectorAll('.tab-section');
    sections.forEach(s => {
      if (s.dataset.tab === name) s.classList.add('active'); else s.classList.remove('active');
    });
    const buttons = document.querySelectorAll('.tabbar .tabbtn');
    buttons.forEach(b => {
      if (b.dataset.tabTarget === name) b.setAttribute('aria-selected','true'); else b.setAttribute('aria-selected','false');
    });
    // update hash without scrolling
    try{ history.replaceState(null, '', '#'+name); } catch(e){ /* ignore */ }
    try{ localStorage.setItem('kopi.lastTab', name); } catch(e){ /* ignore */ }
    // run any init for the visible section (so ranges update)
    if (name === 'v60') v60();
    if (name === 'aero') aero();
    if (name === 'drip') drip();
    if (name === 'iced') iced();
    // focus a logical control for keyboard users
    const target = document.querySelector(`.tab-section[data-tab="${name}"]`);
    if (target) focusFirstIn(target);
  }

  function runSectionInit(name){
    if (name === 'v60') v60();
    if (name === 'aero') aero();
    if (name === 'drip') drip();
    if (name === 'iced') iced();
  }

  function focusFirstIn(section){
    if (!section) return;
    const focusable = section.querySelector('input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
    if (focusable && typeof focusable.focus === 'function'){
      try{ focusable.focus({preventScroll: true}); } catch(e){ focusable.focus(); }
    }
  }

  // Wire up the iced segmented control (Pourover vs Drip)
  function initIcedToggle(){
    const icedSection = document.querySelector('.tab-section[data-tab="iced"]');
    if (!icedSection) return;
  const seg = icedSection.querySelector('.iced-toggle');
  if (!seg) return;
  const buttons = Array.from(seg.querySelectorAll('.seg-btn'));
    const icedGrindEl = icedSection.querySelector('#iced_grind');
    const icedNoteEl = icedSection.querySelector('#iced_grind_note');
    const showPourover = () => {
      icedSection.classList.add('iced--pourover');
      icedSection.classList.remove('iced--drip');
      if (icedGrindEl) icedGrindEl.textContent = '6';
      if (icedNoteEl) icedNoteEl.textContent = '(pourover)';
      buttons.forEach(b => b.setAttribute('aria-pressed', b.dataset.iced === 'pourover' ? 'true' : 'false'));
      try{ localStorage.setItem('kopi.icedMethod','pourover'); } catch(e){/* ignore */}
    };
    const showDrip = () => {
      icedSection.classList.add('iced--drip');
      icedSection.classList.remove('iced--pourover');
      if (icedGrindEl) icedGrindEl.textContent = '5';
      if (icedNoteEl) icedNoteEl.textContent = '(drip)';
      buttons.forEach(b => b.setAttribute('aria-pressed', b.dataset.iced === 'drip' ? 'true' : 'false'));
      try{ localStorage.setItem('kopi.icedMethod','drip'); } catch(e){/* ignore */}
    };

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const which = btn.dataset.iced;
        if (which === 'pourover') showPourover(); else showDrip();
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          const which = btn.dataset.iced;
          if (which === 'pourover') showPourover(); else showDrip();
        }
      });
    });

    // default state: restore from localStorage or pourover
    const saved = (function(){ try{ return localStorage.getItem('kopi.icedMethod'); } catch(e){ return null; }})();
    if (saved === 'drip') showDrip(); else showPourover();
  }

  function initTabs(){
    const tabbar = document.querySelector('.tabbar');
    if (!tabbar) return;
    const buttons = Array.from(tabbar.querySelectorAll('.tabbtn'));
    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        activateTab(btn.dataset.tabTarget);
        // ensure top of container is visible when switching
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      // keyboard nav: left/right to move between tabs
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
          e.preventDefault();
          const dir = e.key === 'ArrowRight' ? 1 : -1;
          const next = (idx + dir + buttons.length) % buttons.length;
          buttons[next].focus();
          // do not auto-activate on focus move; require Enter/Space or ArrowLeft/Right to activate
        } else if (e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          activateTab(btn.dataset.tabTarget);
        }
      });
    });

    // choose initial tab from hash or default to v60
    const hash = (location.hash || '').replace('#','');
    const saved = (function(){ try{ return localStorage.getItem('kopi.lastTab'); } catch(e){ return null; }})();
    const initial = saved || hash || 'v60';
    // Activate initial without animation
    activateTab(initial);
  }

