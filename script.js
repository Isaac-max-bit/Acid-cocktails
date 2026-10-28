// ===== Datos =====
const GRANIZADOS = [
  ["Smirnotff Lulo", ""], ["Jagger", ""], ["Star Blue", "Tequila"], ["Margarita", "Hipnotiq"],
  ["Ponche", "Four Loko"], ["Fresa Bom", "Whisky"], ["Miami", "Champagne"], ["Beso Negro", "Vodka Redbull"],
  ["Tamarindo", "Smirnotff Hipnotiq"], ["Tussi", "Vodka Champagne"], ["Baileys", "Whisky"],
  ["Alpinito Fresa", "Tequila"], ["Sin alcohol", "Varía"], ["Nuvo", "Vodka Champagne"]
];
const ELIXIR = [
  ["Tamarindo", "Tequila"], ["Mojito", "Tequila"], ["Ruby Fresh", "Vodka"], ["Sex on the Beach", "Whisky"],
  ["Piña", "Baileys"], ["Moscow Mule", "Tequila"], ["Margarita", "Whisky"], ["Cremosos", "Varía"]
];
// [Nombre, Onzas, Precio L-J (miles), Precio V-S-D-Festivo (miles)]
const SIZES = [
  ["Mediano", 12, 8, 9], ["Grande", 16, 10, 12], ["Extra grande", 20, 12, 14], ["Balde", 24, 14, 17], ["Litrón", 32, 18, 20]
];
const ELIXIR_PRICE = 15;      // miles
const JERINGA_PRICE = 1.5;    // miles
const JERINGA_MIN_OZ = 20;
const PHONE = "573000000000";  // Reemplazar por el número oficial de WhatsApp (con 57)
 
// ===== Helpers =====
const $ = (id) => document.getElementById(id);
const money = (thousands) => "$" + Math.round(thousands * 1000).toLocaleString("es-CO");
const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Viernes, sábado y domingo = 1. Los festivos los elige el cliente en el selector.
const todayType = () => ([0, 5, 6].includes(new Date().getDay()) ? 1 : 0);
 
// ===== Render =====
function renderMenu(id, items) {
  $(id).innerHTML = items.map(([name, note]) => `
    <li><span class="name">${escapeHTML(name)}</span>${note ? `<span class="note chip">${escapeHTML(note)}</span>` : ""}</li>
  `).join("");
}
 
function renderSizes() {
  const t = todayType();
  $("grid-sizes").innerHTML = SIZES.map(([name, oz, wk, we]) => `
    <tr>
      <td>${name}</td>
      <td>${oz} oz</td>
      <td class="price${t === 0 ? " today" : ""}">${money(wk)}</td>
      <td class="price${t === 1 ? " today" : ""}">${money(we)}</td>
    </tr>
  `).join("");
  document.querySelectorAll("th[data-col]").forEach((th) => {
    if (Number(th.dataset.col) === t) { th.classList.add("today"); th.textContent += " (hoy)"; }
  });
}
 
function initOrderForm() {
  $("sel-size").innerHTML = SIZES.map(([n, oz], i) => `<option value="${i}">${n} (${oz} oz)</option>`).join("");
  $("sel-flavor").innerHTML = GRANIZADOS.map(([n]) => `<option value="${escapeHTML(n)}">${escapeHTML(n)}</option>`).join("");
  $("sel-elixir").innerHTML += ELIXIR.map(([n]) => `<option value="${escapeHTML(n)}">${escapeHTML(n)}</option>`).join("");
  $("sel-day").value = String(todayType());
  $("sel-size").value = "1";
}
 
// ===== Pedido =====
function getOrder() {
  const size = SIZES[Number($("sel-size").value)];
  const dayType = Number($("sel-day").value);
  const elixir = $("sel-elixir").value;
  const jeringaAllowed = size[1] >= JERINGA_MIN_OZ;
  const jeringa = jeringaAllowed && $("chk-jeringa").checked;
  let total = size[2 + dayType];
  if (elixir !== "Ninguno") total += ELIXIR_PRICE;
  if (jeringa) total += JERINGA_PRICE;
  return {
    size, dayType, elixir, jeringa, total,
    flavor: $("sel-flavor").value,
    dayText: $("sel-day").options[$("sel-day").selectedIndex].text
  };
}
 
function updateOrder() {
  const size = SIZES[Number($("sel-size").value)];
  const allowed = size[1] >= JERINGA_MIN_OZ;
  const chk = $("chk-jeringa");
  chk.disabled = !allowed;
  if (!allowed) chk.checked = false;
  chk.closest(".calc-check").classList.toggle("disabled", !allowed);
  $("jeringa-note").textContent = allowed ? "Opción michelada" : `Disponible desde ${JERINGA_MIN_OZ} oz`;
 
  const o = getOrder();
  $("summary-list").innerHTML = `
    <dt>Granizado</dt><dd>${escapeHTML(o.flavor)}</dd>
    <dt>Tamaño</dt><dd>${o.size[0]} · ${o.size[1]} oz</dd>
    <dt>Elixir</dt><dd>${o.elixir === "Ninguno" ? "No" : escapeHTML(o.elixir)}</dd>
    <dt>Jeringa</dt><dd>${o.jeringa ? "Sí" : "No"}</dd>
  `;
  $("calc-price").textContent = money(o.total);
}
 
function sendWhatsAppOrder() {
  const o = getOrder();
  const message =
    `Hola Acid Cocktails, quiero hacer un pedido:\n\n` +
    `🍹 *Granizado:* ${o.flavor}\n` +
    `📏 *Tamaño:* ${o.size[0]} (${o.size[1]} oz)\n` +
    `📅 *Día:* ${o.dayText}\n` +
    `✨ *Elixir:* ${o.elixir === "Ninguno" ? "No" : o.elixir}\n` +
    `💉 *Jeringa michelada:* ${o.jeringa ? "Sí" : "No"}\n\n` +
    `💰 *Total estimado:* ${money(o.total)}\n\n` +
    `Quedo atento para confirmar.`;
  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}
 
// ===== Inicio =====
document.addEventListener("DOMContentLoaded", () => {
  renderMenu("grid-granizados", GRANIZADOS);
  renderMenu("grid-elixir", ELIXIR);
  renderSizes();
  initOrderForm();
  updateOrder();
 
  ["sel-size", "sel-day", "sel-flavor", "sel-elixir", "chk-jeringa"].forEach((id) =>
    $(id).addEventListener("change", updateOrder));
  $("btn-whatsapp").addEventListener("click", sendWhatsAppOrder);
 
  // Menú móvil
  const menuBtn = $("btn-menu"), nav = $("nav-links");
  const closeMenu = () => { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); };
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
 
  // Tema
  $("btn-theme").addEventListener("click", () => {
    const dark = document.body.dataset.theme === "dark";
    document.body.dataset.theme = dark ? "light" : "dark";
    $("btn-theme").setAttribute("aria-label", dark ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
  });
 
  // El botón flotante desaparece cuando ya estás en el pedido
  const fab = $("wa-float");
  new IntersectionObserver(([e]) => { fab.style.display = e.isIntersecting ? "none" : ""; }, { threshold: 0.2 })
    .observe($("pedido"));
});
 
 
// ===== Escena 3D del inicio (Three.js) =====
function initHero3D() {
  const wrap = $("hero-art"), canvas = $("scene");
  if (!wrap || typeof THREE === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  wrap.classList.add("is-3d");
 
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 7;
 
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const pLight = new THREE.PointLight(0xb44cff, 3, 30); pLight.position.set(-4, 3, 5); scene.add(pLight);
  const lLight = new THREE.PointLight(0xb6ff1a, 2.4, 30); lLight.position.set(4, -3, 4); scene.add(lLight);
 
  const group = new THREE.Group(); scene.add(group);
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.3, 180, 28, 2, 3),
    new THREE.MeshStandardMaterial({ color: 0x8a2be2, metalness: 0.75, roughness: 0.22 })
  );
  group.add(knot);
 
  // Cristales de hielo orbitando
  const crystals = [];
  for (let i = 0; i < 18; i++) {
    const size = 0.1 + Math.random() * 0.22;
    const m = new THREE.Mesh(
      new THREE.IcosahedronGeometry(size, 0),
      new THREE.MeshStandardMaterial({ color: i % 3 ? 0xd9c2ff : 0xb6ff1a, flatShading: true, metalness: 0.3, roughness: 0.25, transparent: true, opacity: 0.92 })
    );
    const a = Math.random() * Math.PI * 2, r = 1.9 + Math.random() * 1.1;
    m.userData = { a, r, y: (Math.random() - 0.5) * 2.6, sp: 0.12 + Math.random() * 0.25, rot: Math.random() * 0.02 };
    crystals.push(m); group.add(m);
  }
 
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas); resize();
 
  const mouse = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / innerHeight - 0.5) * 2;
  });
 
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(wrap);
 
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();
    knot.rotation.x = t * 0.25; knot.rotation.y = t * 0.35;
    crystals.forEach((c) => {
      const d = c.userData, ang = d.a + t * d.sp;
      c.position.set(Math.cos(ang) * d.r, d.y + Math.sin(t * d.sp * 3 + d.a) * 0.25, Math.sin(ang) * d.r);
      c.rotation.x += d.rot; c.rotation.y += d.rot * 1.4;
    });
    // Parallax con el mouse y giro con el scroll
    const ty = mouse.x * 0.6 + scrollY * 0.002, tx = mouse.y * 0.35;
    group.rotation.y += (ty - group.rotation.y) * 0.05;
    group.rotation.x += (tx - group.rotation.x) * 0.05;
    group.position.y = Math.sin(t * 0.8) * 0.12;
    renderer.render(scene, camera);
  })();
}
 
// ===== Inclinación 3D en tarjetas =====
function initTilt() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(pointer: coarse)").matches) return;
  document.querySelectorAll(".add-card, .calc-fields, .calc-summary, .table-wrap").forEach((el) => {
    el.setAttribute("data-tilt", "");
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateZ(6px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
}
 
document.addEventListener("DOMContentLoaded", () => { initHero3D(); initTilt(); });
 