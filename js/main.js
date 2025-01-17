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

  function wakeToggle(){
    const toggle = document.querySelector("input[name=wake_toggle]");
    if (!navigator.wakeLock){
      //alert("Your device does not support the Wake Lock API. Try on an Android phone or on a device running iOS 16.4 or higher!");    
      console.debug("Your device does not support the Wake Lock API.");
      document.getElementById("wake").style.display = 'none';
      //return;
    } else if (toggle.checked) {
      //console.debug("Wake toggle is checked");
      wakeOn();
    } else {
      //console.debug("Wake toggle is not checked");
      wakeOff();
    }
  }


  // onload, fire the script with defaults.
  document.addEventListener('DOMContentLoaded', (event) => {    
    v60();
    aero();
    drip();
    iced();
    wakeToggle();

    const toggle = document.querySelector("input[name=wake_toggle]");
    toggle.addEventListener('change', function() {
      wakeToggle();
    });
  });

