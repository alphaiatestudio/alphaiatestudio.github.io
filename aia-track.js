/*! AIA track v02 · Alpha-IAte Studio · Helena (métricas)
 *  Um arquivo só, sem dependências. Serve aos DOIS jogos (Mining the Moon e Snakes Neon 3D), web e APK.
 *
 *  Uso:
 *    AIA.init({ game: 'mining' | 'snake', ver: '0.9', lang: LANG, ga: 'G-XXXXXXXXXX' });  // ga é opcional
 *    AIA.setLang('zh');                      // ao trocar de idioma
 *    AIA.askConsent();                       // 1ª abertura: barra de aviso (aceitar / recusar)
 *    AIA.track('first_sale', { t_s: AIA.activeSeconds() });
 *    AIA.once('first_sale', { t_s: ... });   // só na 1ª vez deste aparelho
 *    AIA.shareLog();                         // botão "Enviar relato" (testadores): baixa/compartilha um JSON
 *
 *  Regras de privacidade (valem para quem editar este arquivo):
 *   - nenhum dado pessoal: sem nome, e-mail, texto digitado, localização, ids do aparelho;
 *   - o identificador é aleatório, nasce no aparelho e some se o jogador limpar os dados;
 *   - nada sai do aparelho para o Google sem o "aceitar"; o log local nunca sai sozinho;
 *   - sem personalização de anúncios nem sinais do Google (jogadores de 13 anos jogam).
 */
(function (w) {
  'use strict';
  var K_ID = 'aia_id', K_CONSENT = 'aia_consent', K_LOG = 'aia_log', K_ONCE = 'aia_once';
  var MAX_LOG = 2000, MAX_PER_SESSION = 300;
  var cfg = { game: '?', ver: '?', ga: null, platform: 'web', debug: false, lang: null };
  var now = Date.now;
  var S = { sid: rnd(8), visMs: 0, visSince: null, count: 0, ready: false, gaLoaded: false, id: null, firstOpen: false };

  function rnd(n) {
    try { var a = new Uint8Array(n); w.crypto.getRandomValues(a); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
    catch (e) { var s = ''; for (var i = 0; i < n; i++) s += ('0' + Math.floor(Math.random() * 256).toString(16)).slice(-2); return s; }
  }
  function get(k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { w.localStorage.setItem(k, v); } catch (e) {} }
  function readJSON(k, d) { try { var v = JSON.parse(get(k)); return v == null ? d : v; } catch (e) { return d; } }
  // idioma do jogo: pt, en, es, zh (chinês simplificado) ou zh-Hant (tradicional); usa cfg.lang e cai no idioma do aparelho
  function lk() {
    var l = String(cfg.lang || (w.navigator && w.navigator.language) || 'pt').toLowerCase();
    if (l.indexOf('zh') === 0) return /tw|hk|mo|hant/.test(l) ? 'zh-Hant' : 'zh';
    return l.slice(0, 2);
  }
  function consent() { var c = get(K_CONSENT); return c === '1' ? true : c === '0' ? false : null; }

  // só números, booleanos e textos curtos entram nos eventos
  function clean(p) {
    var o = {}, n = 0;
    if (!p || typeof p !== 'object') return o;
    for (var k in p) {
      if (!Object.prototype.hasOwnProperty.call(p, k) || n >= 20) continue;
      var v = p[k], t = typeof v;
      if (t === 'number') { if (isFinite(v)) { o[String(k).slice(0, 30)] = Math.round(v * 100) / 100; n++; } }
      else if (t === 'boolean') { o[String(k).slice(0, 30)] = v ? 1 : 0; n++; }
      else if (t === 'string') { o[String(k).slice(0, 30)] = v.slice(0, 40); n++; }
    }
    return o;
  }

  function activeSeconds() {
    var ms = S.visMs + (S.visSince ? now() - S.visSince : 0);
    return Math.round(ms / 100) / 10;
  }

  function loadGA() {
    if (S.gaLoaded || !cfg.ga || consent() !== true) return;
    S.gaLoaded = true;
    try {
      w.dataLayer = w.dataLayer || [];
      w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };
      w.gtag('js', new Date());
      w.gtag('config', cfg.ga, {
        client_id: S.id, client_storage: 'none',            // sem cookie; usa o id anônimo nosso (confirmar no GA4)
        send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false
      });
      w.gtag('set', 'user_properties', { game: cfg.game, platform: cfg.platform, lang: lk() });
      var s = w.document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga);
      s.onerror = function () {};
      w.document.head.appendChild(s);
    } catch (e) {}
  }

  function track(name, params) {
    try {
      if (!S.ready || typeof name !== 'string') return false;
      var c = consent();
      if (c === false) return false;                          // recusou: nada é guardado
      if (++S.count > MAX_PER_SESSION) return false;          // trava contra laço descontrolado
      var p = clean(params);
      var ev = { n: name.slice(0, 40), t: now(), s: S.sid, p: p };
      var log = readJSON(K_LOG, []);
      log.push(ev);
      if (log.length > MAX_LOG) log = log.slice(log.length - MAX_LOG);
      set(K_LOG, JSON.stringify(log));
      if (cfg.debug && w.console) w.console.log('[AIA]', ev.n, p);
      if (c === true && cfg.ga) {
        loadGA();
        var gp = { game: cfg.game, ver: cfg.ver, platform: cfg.platform, lang: lk(), sid: S.sid };
        for (var k in p) gp[k] = p[k];
        if (w.gtag) w.gtag('event', ev.n, gp);
      }
      return true;
    } catch (e) { return false; }
  }

  function once(name, params) {
    var m = readJSON(K_ONCE, {});
    if (m[name]) return false;
    m[name] = 1; set(K_ONCE, JSON.stringify(m));
    return track(name, params);
  }

  function exportLog() {
    return { aia: 1, id: S.id, game: cfg.game, ver: cfg.ver, platform: cfg.platform, exported: now(), events: readJSON(K_LOG, []) };
  }

  function shareLog() {
    try {
      var data = JSON.stringify(exportLog());
      var name = 'aia-relato-' + cfg.game + '-' + new Date().toISOString().slice(0, 10) + '.json';
      var file = null;
      try { file = new w.File([data], name, { type: 'application/json' }); } catch (e) {}
      if (file && w.navigator.canShare && w.navigator.canShare({ files: [file] })) return w.navigator.share({ files: [file], title: 'Relato de teste' }).catch(function () {});
      var a = w.document.createElement('a');
      a.href = w.URL.createObjectURL(new w.Blob([data], { type: 'application/json' }));
      a.download = name; w.document.body.appendChild(a); a.click();
      setTimeout(function () { try { w.document.body.removeChild(a); w.URL.revokeObjectURL(a.href); } catch (e) {} }, 500);
    } catch (e) {}
  }

  function setConsent(v) {
    set(K_CONSENT, v ? '1' : '0');
    if (v) { loadGA(); track('consent_given'); }
    else { try { w.localStorage.removeItem(K_LOG); } catch (e) {} }
  }

  var TXT = {
    pt: ['Podemos medir, de forma anônima, como você joga para melhorar o jogo? Sem nome, e-mail ou anúncios personalizados.', 'Pode', 'Agora não'],
    en: ['May we anonymously measure how you play to improve the game? No name, email or personalized ads.', 'Yes', 'Not now'],
    es: ['¿Podemos medir de forma anónima cómo juegas para mejorar el juego? Sin nombre, correo ni anuncios personalizados.', 'Sí', 'Ahora no'],
    zh: ['我们可以匿名统计你的游戏方式，以改进游戏吗？不收集姓名和邮箱，也没有个性化广告。', '可以', '暂不'],
    'zh-Hant': ['我們可以匿名統計你的遊戲方式，以改進遊戲嗎？不收集姓名和電子郵件，也沒有個人化廣告。', '可以', '暫不']
  };
  function askConsent(force) {
    try {
      if (!force && consent() !== null) return;
      var t = TXT[lk()] || TXT.pt;
      var d = w.document, bar = d.createElement('div');
      bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-live', 'polite');
      bar.style.cssText = 'position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:2147483000;background:#10151f;color:#e8edf5;border:1px solid #3a4560;border-radius:12px;padding:12px;font:15px/1.35 system-ui,sans-serif;display:flex;gap:10px;align-items:center;flex-wrap:wrap;box-shadow:0 6px 24px #0008';
      var m = d.createElement('div'); m.style.cssText = 'flex:1 1 220px'; m.textContent = t[0];
      function btn(label, yes) {
        var b = d.createElement('button'); b.textContent = label; b.type = 'button';
        b.style.cssText = 'min-height:44px;min-width:88px;padding:0 14px;border-radius:10px;border:1px solid #5b6a8c;background:' + (yes ? '#2d6cdf' : 'transparent') + ';color:#fff;font:inherit;cursor:pointer';
        b.onclick = function () { setConsent(yes); if (bar.parentNode) bar.parentNode.removeChild(bar); };
        return b;
      }
      bar.appendChild(m); bar.appendChild(btn(t[1], true)); bar.appendChild(btn(t[2], false));
      d.body.appendChild(bar);
    } catch (e) {}
  }

  function init(o) {
    try {
      if (S.ready) return;
      for (var k in o) cfg[k] = o[k];
      cfg.platform = (w.Capacitor && w.Capacitor.isNativePlatform && w.Capacitor.isNativePlatform()) ? 'apk' : 'web';
      var id = get(K_ID);
      if (!id) { id = rnd(12); set(K_ID, id); S.firstOpen = true; }
      S.id = id; S.ready = true;
      if (!w.document.hidden) S.visSince = now();
      w.document.addEventListener('visibilitychange', function () {
        if (w.document.hidden) {
          if (S.visSince) { S.visMs += now() - S.visSince; S.visSince = null; }
          track('session_end', { dur_s: activeSeconds() });   // dur_s é acumulado; no painel vale o maior por sessão
        } else if (!S.visSince) S.visSince = now();
      });
      loadGA();
      track('game_open', { first: S.firstOpen, lang: lk() });
    } catch (e) {}
  }

  // chamar quando o jogador trocar o idioma: AIA.setLang('zh')
  function setLang(l) {
    var from = lk(); cfg.lang = l;
    track('lang_changed', { from: from, to: lk() });
    if (w.gtag) w.gtag('set', 'user_properties', { lang: lk() });
  }

  w.AIA = { init: init, setLang: setLang, track: track, once: once, askConsent: askConsent, setConsent: setConsent, consent: consent, exportLog: exportLog, shareLog: shareLog, activeSeconds: activeSeconds };
})(window);
