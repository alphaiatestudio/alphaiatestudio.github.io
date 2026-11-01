/* Alphaiate Studio: temas por horário, 3 idiomas, prévias e senha */
(function () {
  "use strict";

  /* ============ CONFIGURAÇÃO (edite aqui) ============ */
  var CONFIG = {
    games: {
      mining: {
        title: "Mining the Moon: Lunar Corps",
        url: "https://alphaiatestudio.github.io/mining-the-moon/",
        // coloque seus prints reais em img/prints/ (WebP ou PNG) e liste aqui
        shots: ["img/prints/mining-1.webp"]
      },
      // Snakes Neon 3D (v2.7 em teste). Troque o print de img/prints/snakes-neon-3d-1.webp pela arte final.
      snakes3d: {
        title: "SNAKES NEON 3D",
        url: "https://alphaiatestudio.github.io/snakes-neon-3d-v2.7.html",
        shots: ["img/prints/snakes-neon-3d-1.webp"]
      }
    },
    // Imagem do cartão da simulação do estúdio
    studioShot: "img/prints/studio-1.webp",
    // Demo do iate cifrada (AES-GCM, chave derivada da senha por PBKDF2). Gere no repositório alpha-iate:
    //   node tools/gerar-demo.mjs <senha> <este site>/navio.json
    navio: "navio.json"
  };

  /* Horários dos temas (hora local do visitante) */
  var THEMES = {
    noite: { wide: "img/noite-neon-wide.webp", tall: "img/noite-neon-tall.webp" },  // 00:00 - 09:00
    dia:   { wide: "img/dia-ouro-wide.webp",   tall: "img/dia-ouro-tall.webp" },    // 09:01 - 18:00
    ponte: { wide: "img/ponte-noite-wide.webp", tall: "img/ponte-noite-tall.webp" } // 18:01 - 23:59
  };
  function themeByTime(d) {
    var m = d.getHours() * 60 + d.getMinutes();
    if (m <= 540) return "noite";
    if (m <= 1080) return "dia";
    return "ponte";
  }

  /* ============ TEXTOS ============ */
  var I18N = {
    pt: {
      tagline: "Jogos feitos por um comandante e uma tripulação de IA",
      cta_play: "Jogar Mining the Moon", cta_studio: "Conhecer o estúdio",
      games_title: "ESCOLHA SEU DESTINO",
      mining_tag: "Chill · Puzzle",
      mining_desc: "Prospecte hélio lunar, administre o oxigênio e financie a Base Tranquilidade. Feito para jogar no celular, em pé; dá para instalar na tela inicial.",
      snake_tag: "Arcade 3D",
      snake_desc: "A cobrinha anda na superfície de um cubo. Portais, missões, modos de jogo, skins e highscores.",
      snakes3d_tag: "Em teste · Arcade 3D",
      snakes3d_desc: "A nova geração da cobra do cubo: toque nas laterais da tela, skins e, no app, controle por inclinação.",
      studio_tag: "Simulação", studio_title: "O iate do estúdio",
      studio_desc: "Suba a bordo e conheça a tripulação em uma simulação do estúdio.",
      btn_play: "Jogar", btn_preview: "Ver prévia", close: "Fechar",
      real_shot: "Captura real do jogo", soon: "Captura em breve",
      pw_title: "Senha do navio", pw_desc: "Digite a senha para embarcar na demonstração do Alphaiate.",
      pw_ph: "Digite a senha", pw_btn: "Embarcar", pw_wrong: "Senha incorreta.", pw_unset: "Não deu para carregar o navio. Verifique a conexão.", pw_checking: "Conferindo a senha…", pw_boarding: "Embarcando…",
      theme_label: "Fundo", t_auto: "Automático", t_noite: "Noite neon", t_dia: "Dia", t_ponte: "Ponte de comando",
      now_auto: "Automático pela sua hora local: ", now_manual: "Fundo escolhido por você: ",
      foot_made: "Feito a bordo, com HTML puro e Three.js"
    },
    en: {
      tagline: "Games made by a commander and an AI crew",
      cta_play: "Play Mining the Moon", cta_studio: "Meet the studio",
      games_title: "CHOOSE YOUR DESTINATION",
      mining_tag: "Chill · Puzzle",
      mining_desc: "Prospect lunar helium, manage your oxygen and fund Tranquility Base. Built for phones, played upright; installable on your home screen.",
      snake_tag: "3D Arcade",
      snake_desc: "The little snake crawls across the surface of a cube. Portals, missions, game modes, skins and highscores.",
      snakes3d_tag: "In testing · 3D Arcade",
      snakes3d_desc: "The next generation of the cube snake: tap the sides of the screen, skins and, in the app, tilt control.",
      studio_tag: "Simulation", studio_title: "The studio yacht",
      studio_desc: "Come aboard and meet the crew in a simulation of the studio.",
      btn_play: "Play", btn_preview: "Preview", close: "Close",
      real_shot: "Real in-game capture", soon: "Capture coming soon",
      pw_title: "Ship password", pw_desc: "Enter the password to board the Alphaiate demo.",
      pw_ph: "Enter password", pw_btn: "Board", pw_wrong: "Wrong password.", pw_unset: "Could not load the ship. Check your connection.", pw_checking: "Checking the password…", pw_boarding: "Boarding…",
      theme_label: "Background", t_auto: "Automatic", t_noite: "Neon night", t_dia: "Day", t_ponte: "Command bridge",
      now_auto: "Automatic by your local time: ", now_manual: "Background chosen by you: ",
      foot_made: "Made aboard, with plain HTML and Three.js"
    },
    es: {
      tagline: "Juegos hechos por un comandante y una tripulación de IA",
      cta_play: "Jugar Mining the Moon", cta_studio: "Conocer el estudio",
      games_title: "ELIGE TU DESTINO",
      mining_tag: "Chill · Puzzle",
      mining_desc: "Prospecta helio lunar, gestiona el oxígeno y financia la Base Tranquilidad. Hecho para jugar en el móvil, de pie; se instala en la pantalla de inicio.",
      snake_tag: "Arcade 3D",
      snake_desc: "La serpiente avanza por la superficie de un cubo. Portales, misiones, modos de juego, skins y récords.",
      snakes3d_tag: "En pruebas · Arcade 3D",
      snakes3d_desc: "La nueva generación de la serpiente del cubo: toca los lados de la pantalla, skins y, en la app, control por inclinación.",
      studio_tag: "Simulación", studio_title: "El yate del estudio",
      studio_desc: "Sube a bordo y conoce a la tripulación en una simulación del estudio.",
      btn_play: "Jugar", btn_preview: "Ver vista previa", close: "Cerrar",
      real_shot: "Captura real del juego", soon: "Captura próximamente",
      pw_title: "Contraseña del barco", pw_desc: "Escribe la contraseña para subir a la demostración de Alphaiate.",
      pw_ph: "Escribe la contraseña", pw_btn: "Embarcar", pw_wrong: "Contraseña incorrecta.", pw_unset: "No se pudo cargar el barco. Revisa la conexión.", pw_checking: "Comprobando la contraseña…", pw_boarding: "Embarcando…",
      theme_label: "Fondo", t_auto: "Automático", t_noite: "Noche neón", t_dia: "Día", t_ponte: "Puente de mando",
      now_auto: "Automático según tu hora local: ", now_manual: "Fondo elegido por ti: ",
      foot_made: "Hecho a bordo, con HTML puro y Three.js"
    }
  };
  var HTML_LANG = { pt: "pt-BR", en: "en", es: "es" };

  /* ============ UTIL ============ */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }

  /* ============ IDIOMA ============ */
  var lang = "pt";
  function detectLang() {
    var saved = store("aia-lang");
    if (saved && I18N[saved]) return saved;
    var n = (navigator.language || "pt").slice(0, 2).toLowerCase();
    return I18N[n] ? n : "en";
  }
  function t(k) { return (I18N[lang] && I18N[lang][k]) || I18N.pt[k] || k; }
  function applyLang(l) {
    lang = I18N[l] ? l : "pt";
    store("aia-lang", lang);
    document.documentElement.lang = HTML_LANG[lang];
    $$("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $$("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
    $$(".langs button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    $$(".shot[data-soon]").forEach(function (el) { el.setAttribute("data-soon", t("soon")); });
    $("#pvClose").setAttribute("aria-label", t("close"));
    $("#pwClose").setAttribute("aria-label", t("close"));
    updateNow();
  }

  /* ============ TEMAS ============ */
  var mode = "auto", current = null, layer = 0;
  var mq = window.matchMedia("(max-width: 760px)");
  function bgSrc(name) { return THEMES[name][mq.matches ? "tall" : "wide"]; }
  function showBg(name) {
    var img = new Image();
    img.onload = function () {
      var a = $("#bgA"), b = $("#bgB");
      var next = layer ? a : b, prev = layer ? b : a;
      next.style.backgroundImage = "url('" + bgSrc(name) + "')";
      next.classList.add("on"); prev.classList.remove("on");
      layer = layer ? 0 : 1;
    };
    img.src = bgSrc(name);
  }
  function setTheme(name) {
    if (name === current) return;
    current = name;
    document.body.setAttribute("data-theme", name);
    showBg(name);
    updateNow();
  }
  function resolve() { return mode === "auto" ? themeByTime(new Date()) : mode; }
  function updateNow() {
    var el = $("#nowTheme"); if (!el || !current) return;
    el.textContent = (mode === "auto" ? t("now_auto") : t("now_manual")) + t("t_" + current);
  }
  function applyMode(m) {
    mode = m; store("aia-theme", m);
    $$("[data-theme-mode]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.themeMode === m)); });
    setTheme(resolve()); updateNow();
  }
  mq.addEventListener ? mq.addEventListener("change", function () { if (current) { var c = current; current = null; setTheme(c); } })
                      : mq.addListener(function () { if (current) { var c = current; current = null; setTheme(c); } });
  setInterval(function () { if (mode === "auto") setTheme(themeByTime(new Date())); }, 30000);

  /* ============ JOGOS, PRÉVIA ============ */
  function firstShot(key) {
    return new Promise(function (res) {
      var i = new Image();
      i.onload = function () { res(CONFIG.games[key].shots[0]); };
      i.onerror = function () { res(null); };
      i.src = CONFIG.games[key].shots[0];
    });
  }
  function initGames() {
    Object.keys(CONFIG.games).forEach(function (k) {
      $$('[data-play="' + k + '"]').forEach(function (a) { a.href = CONFIG.games[k].url; });
      var box = $('[data-shot="' + k + '"]');
      firstShot(k).then(function (src) {
        if (src) { box.style.backgroundImage = "url('" + src + "')"; }
        else { box.classList.add("empty"); box.setAttribute("data-soon", t("soon")); }
      });
    });
    $("#ctaPlay").href = CONFIG.games.mining.url;
    var sb = $('[data-shot="studio"]'), si = new Image();
    si.onload = function () { sb.style.backgroundImage = "url('" + CONFIG.studioShot + "')"; };
    si.onerror = function () { sb.classList.add("empty"); sb.setAttribute("data-soon", t("soon")); };
    si.src = CONFIG.studioShot;
  }

  var pv = $("#previewDlg");
  function openPreview(key) {
    var g = CONFIG.games[key];
    $("#pvTitle").textContent = g.title;
    $("#pvPlay").href = g.url;
    var stage = $("#pvStage"), thumbs = $("#pvThumbs");
    stage.innerHTML = ""; thumbs.innerHTML = "";
    var ok = [];
    var pending = g.shots.length;
    g.shots.forEach(function (src, idx) {
      var i = new Image();
      i.onload = function () { ok[idx] = src; done(); };
      i.onerror = function () { done(); };
      i.src = src;
    });
    function done() {
      if (--pending) return;
      var list = ok.filter(Boolean);
      if (!list.length) {
        var p = document.createElement("p"); p.className = "miss"; p.textContent = t("soon"); stage.appendChild(p);
        return;
      }
      function show(n) {
        stage.innerHTML = "";
        var im = document.createElement("img"); im.src = list[n]; im.alt = g.title + " (" + (n + 1) + "/" + list.length + ")";
        stage.appendChild(im);
        $$("button", thumbs).forEach(function (b, j) { b.setAttribute("aria-current", String(j === n)); });
      }
      list.forEach(function (src, n) {
        var b = document.createElement("button"); b.type = "button"; b.style.backgroundImage = "url('" + src + "')";
        b.setAttribute("aria-label", (n + 1) + "/" + list.length); b.addEventListener("click", function () { show(n); });
        thumbs.appendChild(b);
      });
      show(0);
    }
    pv.showModal();
  }
  $$("[data-preview]").forEach(function (b) { b.addEventListener("click", function () { openPreview(b.dataset.preview); }); });
  $("#pvClose").addEventListener("click", function () { pv.close(); });
  $("#pvClose2").addEventListener("click", function () { pv.close(); });

  /* ============ SENHA ============ */
  var pw = $("#pwDlg");
  function openPw() { $("#pwErr").textContent = ""; $("#pwInput").value = ""; pw.showModal(); $("#pwInput").focus(); }
  $("#ctaStudio").addEventListener("click", openPw);
  $("#cardStudio").addEventListener("click", openPw);
  $("#pwClose").addEventListener("click", function () { pw.close(); });
  [pv, pw].forEach(function (d) { d.addEventListener("click", function (e) { if (e.target === d) d.close(); }); });

  // O iate fica cifrado em navio.json; sem a senha certa o conteúdo não decifra.
  function b64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  $("#pwForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var err = $("#pwErr"), btn = $('#pwForm [type="submit"]');
    btn.disabled = true; err.textContent = t("pw_checking");
    try {
      var pk = await (await fetch(CONFIG.navio, { cache: "no-store" })).json();
      var base = await crypto.subtle.importKey("raw", new TextEncoder().encode($("#pwInput").value), "PBKDF2", false, ["deriveKey"]);
      var key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(pk.salt), iterations: pk.iter, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      var html;
      try { html = new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(pk.iv) }, key, b64(pk.ct))); }
      catch (x) { err.textContent = t("pw_wrong"); btn.disabled = false; return; }
      err.textContent = t("pw_boarding");
      document.open(); document.write(html); document.close();
    } catch (x) { err.textContent = t("pw_unset"); btn.disabled = false; }
  });

  /* ============ INÍCIO ============ */
  $$(".langs button").forEach(function (b) { b.addEventListener("click", function () { applyLang(b.dataset.lang); }); });
  $$("[data-theme-mode]").forEach(function (b) { b.addEventListener("click", function () { applyMode(b.dataset.themeMode); }); });

  applyLang(detectLang());
  initGames();
  var savedMode = store("aia-theme");
  applyMode(savedMode && (savedMode === "auto" || THEMES[savedMode]) ? savedMode : "auto");
})();
