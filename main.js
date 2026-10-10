/* Osukā — main.js (IIFE, sin módulos). Cada init va aislado con safe(). */
(function () {
  "use strict";
  var B = window.__BRAND__ || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var isTouch = window.matchMedia("(hover: none)").matches;
  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn("[init] " + name, e); } }

  /* ---- Splash ---- */
  function initSplash() {
    var s = $("#splash"); if (!s) return;
    var hide = function () { s.classList.add("hide"); setTimeout(function () { s.style.display = "none"; }, 1000); };
    if (document.readyState === "complete") setTimeout(hide, 1900);
    else window.addEventListener("load", function () { setTimeout(hide, 1900); });
    setTimeout(hide, 4200);
  }

  /* ---- Nav + progreso ---- */
  function initScroll() {
    var nav = $("#nav"), bar = $("#progress");
    function on() {
      var y = window.scrollY || 0, h = document.documentElement.scrollHeight - innerHeight;
      if (nav) nav.classList.toggle("scrolled", y > 40);
      if (bar) bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
    }
    on(); window.addEventListener("scroll", on, { passive: true });
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href"); if (id.length < 2) return;
        var t = $(id); if (!t) return;
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 60, behavior: "smooth" });
      });
    });
  }

  /* ---- Reveal con IntersectionObserver + red de seguridad ---- */
  function initReveal() {
    document.documentElement.classList.add("js");
    var els = $$("[data-reveal]");
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: 0.03, rootMargin: "0px 0px -4% 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { els.forEach(function (el) { el.classList.add("in"); }); }, 6000);
  }

  /* ---- Hero: parallax con el ratón + scroll ---- */
  function initHero() {
    var hero = $("#hero"); if (!hero) return;
    var layers = $$("[data-depth]", hero);
    var tx = 0, ty = 0, cx = 0, cy = 0;
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5;
    });
    hero.addEventListener("mouseleave", function () { tx = 0; ty = 0; });
    (function loop() {
      cx += (tx - cx) * .06; cy += (ty - cy) * .06;
      var sy = Math.min(window.scrollY, innerHeight) / innerHeight;
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute("data-depth")) || 0;
        var isBust = l.classList.contains("hero-bust");
        l.style.transform = "translate(-50%,-50%) translate3d(" + (cx * -40 * d) + "px," + (cy * -24 * d + sy * (isBust ? 60 : 120) * d) + "px,0)";
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ---- Manifiesto: palabras que se encienden al hacer scroll ---- */
  function initManifest() {
    var p = $("#manifestText"); if (!p) return;
    var words = p.textContent.trim().split(/\s+/);
    p.innerHTML = words.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    var spans = $$(".w", p);
    document.documentElement.classList.add("js-split");
    function upd() {
      var r = p.getBoundingClientRect(), vh = innerHeight;
      var prog = (vh * .85 - r.top) / (r.height + vh * .35);
      prog = Math.max(0, Math.min(1, prog));
      var n = Math.round(prog * spans.length);
      spans.forEach(function (s, i) { s.classList.toggle("lit", i < n); });
    }
    upd(); window.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd);
  }

  /* ---- Tilt 3D + foco de luz en piezas ---- */
  function initTilt() {
    if (isTouch) return;
    $$(".tilt").forEach(function (el) {
      var img = $(".piece-img", el);
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = "perspective(900px) rotateY(" + ((x - .5) * 7) + "deg) rotateX(" + ((.5 - y) * 7) + "deg)";
        if (img) { img.style.setProperty("--mx", x * 100 + "%"); img.style.setProperty("--my", y * 100 + "%"); }
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---- Resplandor que sigue al cursor ---- */
  function initGlow() {
    var g = $("#glow"); if (!g || isTouch) return;
    var x = 0, y = 0, tx = 0, ty = 0;
    window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; g.classList.add("on"); });
    (function loop() { x += (tx - x) * .12; y += (ty - y) * .12; g.style.transform = "translate3d(" + x + "px," + y + "px,0)"; requestAnimationFrame(loop); })();
  }

  /* ---- Slider recién hecho / curado ---- */
  function initCompare() {
    var box = $("#compare"), r = $("#cmpRange"), st = box && $(".compare-stage", box); if (!box || !r) return;
    function set(v) { box.style.setProperty("--pos", v + "%"); r.value = v; }
    r.addEventListener("input", function () { set(r.value); });
    var drag = false;
    function move(e) {
      var rect = st.getBoundingClientRect(), cx = e.touches ? e.touches[0].clientX : e.clientX;
      set(Math.max(0, Math.min(100, (cx - rect.left) / rect.width * 100)));
    }
    st.addEventListener("mousedown", function (e) { drag = true; move(e); });
    window.addEventListener("mouseup", function () { drag = false; });
    window.addEventListener("mousemove", function (e) { if (drag) move(e); });
    st.addEventListener("touchmove", move, { passive: true });
    var done = false;
    new IntersectionObserver(function (en, o) {
      if (done || !en[0].isIntersecting) return; done = true; o.disconnect();
      var t0 = null;
      (function step(t) { if (!t0) t0 = t; var k = (t - t0) / 1600; if (k >= 1) { set(50); return; } set(50 + Math.sin(k * Math.PI * 2) * 28); requestAnimationFrame(step); })(performance.now());
    }, { threshold: .4 }).observe(box);
  }

  /* ---- Método: paso activo + barra ---- */
  function initMethod() {
    var steps = $$(".step"), bar = $("#methodBar"); if (!steps.length) return;
    function upd() {
      var mid = innerHeight * .5, active = -1;
      steps.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        if (r.top < mid + 80) active = i;
        s.classList.toggle("active", r.top < mid + 80 && r.bottom > mid - 80);
      });
      if (bar) bar.style.transform = "scaleX(" + (active + 1) / steps.length + ")";
    }
    upd(); window.addEventListener("scroll", upd, { passive: true });
  }

  /* ---- Fechas desde manifest (idempotente) ---- */
  function initDates() {
    var d = B.dates || {};
    $$(".city-dates").forEach(function (ul) {
      if (ul.children.length > 0) return;
      (d[ul.getAttribute("data-city")] || []).forEach(function (it) {
        var li = document.createElement("li");
        li.innerHTML = "<span><b>" + it.when + "</b> · " + it.note + '</span><span class="tagline ' + it.status + '">' + it.label + "</span>";
        ul.appendChild(li);
      });
    });
  }

  /* ---- Formulario (abre el correo con el mensaje preparado) ---- */
  function initForm() {
    var f = $("#bookForm"); if (!f) return;
    var out = $("#sizeOut"), size = $("#f-size");
    if (size) size.addEventListener("input", function () { out.textContent = size.value + " cm"; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      ["name", "contact", "idea"].forEach(function (n) {
        var el = f.elements[n], fld = el.closest(".field");
        var bad = !el.value.trim(); fld.classList.toggle("err", bad); if (bad) ok = false;
      });
      var msg = $("#formMsg");
      if (!ok) { msg.textContent = "Faltan datos por completar."; return; }
      msg.textContent = "";
      var v = function (n) { return f.elements[n].value; };
      var body = "Hola Osukā,\n\nMe llamo " + v("name") + ".\nContacto: " + v("contact") +
        "\nCiudad: " + v("city") + "\nZona: " + v("zone") + "\nTamaño aproximado: " + v("size") + " cm" +
        "\nCover/retoque: " + (f.elements.cover.checked ? "Sí" : "No") + "\n\nMi idea:\n" + v("idea");
      var mail = "mailto:" + (B.email || "") + "?subject=" + encodeURIComponent("Solicitud de cita · " + v("name")) + "&body=" + encodeURIComponent(body);
      $("#success").hidden = false;
      window.location.href = mail;
    });
  }

  /* ---- Marquee acelera un poco con el scroll ---- */
  function initMarquee() {
    var t = $(".marquee-track"); if (!t) return;
    var last = window.scrollY;
    window.addEventListener("scroll", function () {
      var d = Math.abs(window.scrollY - last); last = window.scrollY;
      t.style.animationDuration = Math.max(14, 40 - d * .6) + "s";
    }, { passive: true });
  }

  [["splash", initSplash], ["scroll", initScroll], ["reveal", initReveal], ["hero", initHero], ["manifest", initManifest],
   ["tilt", initTilt], ["glow", initGlow], ["compare", initCompare], ["method", initMethod], ["dates", initDates],
   ["form", initForm], ["marquee", initMarquee]].forEach(function (p) { safe(p[1], p[0]); });
})();
