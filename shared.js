/**
 * shared.js — Kezang Tshering Portfolio
 * One place for: Three.js bg, cursor, nav, scroll, GSAP reveals, forms.
 * All pages load this. Page-specific code stays in each HTML file.
 */

/* ── Three.js background ────────────────────────────────────── */
function initThree({ shapes = [] } = {}) {
  const canvas   = document.getElementById("three-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
  camera.position.z = 5;

  /* Particle field */
  const count = innerWidth < 768 ? 600 : 1800;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(count * 3);
  const col   = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 18;
    pos[i*3+1] = (Math.random() - 0.5) * 18;
    pos[i*3+2] = (Math.random() - 0.5) * 10;
    const b    = 0.1 + Math.random() * 0.45;
    col[i*3]   = 0.07 * b;
    col[i*3+1] = b;
    col[i*3+2] = 0.12 * b;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.052, vertexColors: true, transparent: true,
    opacity: 0.72, sizeAttenuation: true
  }));
  scene.add(pts);

  /* Wire decorations — caller can pass custom shapes array */
  const wireMat = (opacity = 0.06) => new THREE.MeshBasicMaterial({
    color: 0x4ade80, wireframe: true, transparent: true, opacity
  });
  const meshes = shapes.map(({ geo: g, x = 0, y = 0, z = 0, opacity }) => {
    const m = new THREE.Mesh(g, wireMat(opacity));
    m.position.set(x, y, z);
    scene.add(m);
    return m;
  });

  /* Mouse parallax */
  let mx = 0, my = 0;
  addEventListener("mousemove", e => {
    mx = (e.clientX / innerWidth  - 0.5) * 2;
    my = -(e.clientY / innerHeight - 0.5) * 2;
  });

  /* Animate */
  (function tick() {
    requestAnimationFrame(tick);
    const t = performance.now() * 0.001;
    pts.rotation.y = t * 0.024 + mx * 0.08;
    pts.rotation.x = my * 0.04;
    meshes.forEach((m, i) => {
      m.rotation.x = t * (0.2 + i * 0.08);
      m.rotation.y = t * (0.15 + i * 0.05);
    });
    renderer.render(scene, camera);
  })();

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  return { scene, renderer, camera, pts };
}

/* ── Custom cursor ──────────────────────────────────────────── */
function initCursor(hoverSelectors = "a, button, .card, .skill-card, .svc-card, .work-card, .exp-card, .stat-card, .points-list li, .info-card, input, select, textarea") {
  const dot  = document.getElementById("cursor");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;

  let rx = 0, ry = 0, cx = 0, cy = 0;
  const lerp = (a, b, t) => a + (b - a) * t;

  addEventListener("mousemove", e => { cx = e.clientX; cy = e.clientY; });

  (function loop() {
    rx = lerp(rx, cx, 0.14);
    ry = lerp(ry, cy, 0.14);
    dot.style.cssText  += `left:${cx}px;top:${cy}px;`;
    ring.style.cssText += `left:${rx}px;top:${ry}px;`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll(hoverSelectors).forEach(el => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });
}

/* ── Navigation ─────────────────────────────────────────────── */
function initNav() {
  const hdr = document.getElementById("header");
  const ham  = document.getElementById("ham");
  const nav  = document.getElementById("nav");
  if (!hdr) return;

  const onScroll = () => hdr.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // initial

  if (ham && nav) {
    ham.addEventListener("click", () => {
      ham.classList.toggle("open");
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      ham.classList.remove("open");
      nav.classList.remove("open");
    }));
  }
}

/* ── GSAP scroll reveals ─────────────────────────────────────── */
function initReveals({ heroSelector = ".hero .reveal", sectionSelector = "section:not(.hero) .reveal" } = {}) {
  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.fromTo(heroSelector,
    { y: 55, opacity: 0 },
    { y: 0, opacity: 1, duration: 1.1, stagger: 0.13, ease: "power3.out", delay: 0.1 }
  );

  gsap.utils.toArray(sectionSelector).forEach(el => {
    gsap.fromTo(el,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" }
      }
    );
  });
}

function initBandReveals(bandSelector = ".hero-band .reveal, .page-header .reveal") {
  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.fromTo(bandSelector,
    { y: 48, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.08 }
  );
}

function initContentReveals(selector = ".content .reveal, .contact-wrap .reveal, .sidebar .reveal, .main-col .reveal") {
  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray(selector).forEach(el => {
    gsap.fromTo(el,
      { y: 42, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" }
      }
    );
  });
}

/* ── Skill bars ─────────────────────────────────────────────── */
function initSkillBars() {
  document.querySelectorAll(".sk-fill").forEach(bar => {
    if (typeof ScrollTrigger === "undefined") {
      bar.style.width = bar.dataset.w + "%"; return;
    }
    ScrollTrigger.create({
      trigger: bar, start: "top 86%",
      onEnter: () => gsap.to(bar, { width: bar.dataset.w + "%", duration: 1.4, ease: "power3.out" })
    });
  });
}

/* ── Tilt card ──────────────────────────────────────────────── */
function initTiltCard(cardId = "tilt-card", glareId = "glare") {
  const tc    = document.getElementById(cardId);
  const glare = document.getElementById(glareId);
  if (!tc || !gsap) return;

  tc.addEventListener("mousemove", e => {
    const r  = tc.getBoundingClientRect();
    const xp = (e.clientX - r.left) / r.width  - 0.5;
    const yp = (e.clientY - r.top)  / r.height - 0.5;
    gsap.to(tc, { rotateY: xp * 22, rotateX: -yp * 22, duration: 0.25, ease: "power2.out", transformPerspective: 900 });
    if (glare) glare.style.background =
      `radial-gradient(circle at ${(xp+0.5)*100}% ${(yp+0.5)*100}%, rgba(255,255,255,.13), transparent 60%)`;
  });
  tc.addEventListener("mouseleave", () => {
    gsap.to(tc, { rotateY: 0, rotateX: 0, duration: 0.7, ease: "elastic.out(1,.7)" });
    if (glare) glare.style.background =
      "radial-gradient(circle at 50% 0%, rgba(255,255,255,.06), transparent 60%)";
  });

  gsap.to(tc, { y: -14, duration: 2.8, yoyo: true, repeat: -1, ease: "sine.inOut" });
}

/* ── Skill card spotlight ────────────────────────────────────── */
function initCardSpotlight(selector = ".skill-card") {
  document.querySelectorAll(selector).forEach(c => {
    c.addEventListener("mousemove", e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", ((e.clientX - r.left) / r.width  * 100) + "%");
      c.style.setProperty("--my", ((e.clientY - r.top)  / r.height * 100) + "%");
    });
  });
}

/* ── Generic form with fake submit ──────────────────────────── */
function initForm(formId, successId, delay = 1500) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const btn = form.querySelector(".submit-btn");
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending…';
    btn.disabled  = true;
    setTimeout(() => {
      form.style.display = "none";
      const suc = document.getElementById(successId);
      if (suc) suc.style.display = "block";
    }, delay);
  });
}

/* ── Year stamp ─────────────────────────────────────────────── */
function stampYear(id = "year") {
  const el = document.getElementById(id);
  if (el) el.textContent = new Date().getFullYear();
}