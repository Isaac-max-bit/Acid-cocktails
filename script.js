// Base de Datos de Productos
const GRANIZADOS = [
  ["Smirnotff Lulo", ""],
  ["Jagger", ""],
  ["Star Blue", "Tequila"],
  ["Margarita", "Hipnotiq"],
  ["Ponche", "Four Loko"],
  ["Fresa Bom", "Whisky"],
  ["Miami", "Champagne"],
  ["Beso Negro", "Vodka Redbull"],
  ["Tamarindo", "Smirnotff Hipnotiq"],
  ["Tussi", "Vodka Champagne"],
  ["Baileys", "Whisky"],
  ["Alpinito Fresa", "Tequila"],
  ["Sin alcohol", "Varía"],
  ["Nuvo", "Vodka Champagne"]
];

const ELIXIR = [
  ["Tamarindo", "Tequila"],
  ["Mojito", "Tequila"],
  ["Ruby Fresh", "Vodka"],
  ["Sex on the Beach", "Whisky"],
  ["Piña", "Baileys"],
  ["Moscow Mule", "Tequila"],
  ["Margarita", "Whisky"],
  ["Cremosos", "Varía"]
];

// Estructura: [Nombre, Onzas, Precio L-J, Precio V-S-D-Festivo]
const SIZES = [
  ["Mediano", 12, 8, 9],
  ["Grande", 16, 10, 12],
  ["Extra grande", 20, 12, 14],
  ["Balde", 24, 14, 17],
  ["Litrón", 32, 18, 20]
];

// Variables del estado
let currentDayType = 0; // 0: L-J, 1: Fin de semana

// Funciones Helper
const formatPrice = (val) => `$${val}.000`;
const padNumber = (n) => String(n + 1).padStart(2, "0");

// Renderizar Granizados
function renderGranizados() {
  const container = document.getElementById("grid-granizados");
  container.innerHTML = GRANIZADOS.map((item, index) => `
    <div class="card-item">
      <i>Nº ${padNumber(index)}</i>
      <h3>${item[0]}</h3>
      ${item[1] ? `<span class="tag">\${item[1]}</span>` : ""}
    </div>
  `).join("");
}

// Renderizar Elixires
function renderElixir() {
  const container = document.getElementById("grid-elixir");
  container.innerHTML = ELIXIR.map((item, index) => `
    <div class="card-item">
      <i>ELIXIR ${padNumber(index)}</i>
      <h3>${item[0]}</h3>
      <span class="tag">${item[1]}</span>
    </div>
  `).join("");
}

// Renderizar Precios
function renderSizes() {
  const container = document.getElementById("grid-sizes");
  container.innerHTML = SIZES.map(item => `
    <div class="size-card">
      <em>${item[1]} ONZ</em>
      <h3>${item[0]}</h3>
      <strong>${formatPrice(item[2 + currentDayType])}</strong>
    </div>
  `).join("");
}

// Inicializar Selects de la Calculadora
function initCalculatorSelects() {
  const sizeSelect = document.getElementById("sel-size");
  const flavorSelect = document.getElementById("sel-flavor");
  const elixirSelect = document.getElementById("sel-elixir");

  sizeSelect.innerHTML = SIZES.map((item, idx) => `
    <option value="${idx}">${item[0]} (${item[1]} oz)</option>
  `).join("");

  flavorSelect.innerHTML = GRANIZADOS.map(item => `
    <option value="${item[0]}">${item[0]}</option>
  `).join("");

  elixirSelect.innerHTML += ELIXIR.map(item => `
    <option value="${item[0]}">${item[0]}</option>
  `).join("");
}

// Calcular Total de Pedido
function updateCalculatedPrice() {
  const sizeIdx = parseInt(document.getElementById("sel-size").value) || 0;
  const dayType = parseInt(document.getElementById("sel-day").value) || 0;
  const elixirVal = document.getElementById("sel-elixir").value;
  const hasJeringa = document.getElementById("chk-jeringa").checked;

  const basePrice = SIZES[sizeIdx][2 + dayType];
  let total = basePrice;

  if (elixirVal !== "Ninguno") total += 15;
  if (hasJeringa) total += 1.5;

  document.getElementById("calc-price").textContent = `$${total.toFixed(1).replace('.0', '')}.000`;
}

// Enviar a WhatsApp
function sendWhatsAppOrder() {
  const sizeObj = SIZES[document.getElementById("sel-size").value];
  const dayTxt = document.getElementById("sel-day").options[document.getElementById("sel-day").selectedIndex].text;
  const flavor = document.getElementById("sel-flavor").value;
  const elixir = document.getElementById("sel-elixir").value;
  const jeringa = document.getElementById("chk-jeringa").checked ? "Sí (+Jeringa michelada)" : "No";
  const price = document.getElementById("calc-price").textContent;

  const message = `hola acid cocktails, quiero hacer un pedido:\n\n` +
    `🍹 *Granizado:* ${flavor}\n` +
    `📏 *Tamaño:* ${sizeObj[0]} (${sizeObj[1]} oz)\n` +
    `📅 *Día:* ${dayTxt}\n` +
    `✨ *Elixir:* ${elixir}\n` +
    `💉 *Jeringa:* ${jeringa}\n\n` +
    `💰 *Total:* ${price}\n\n` +
    `¡quedo atento para confirmar!`;

  const phone = "573000000000"; // Reemplazar por el número de WhatsApp oficial
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  renderGranizados();
  renderElixir();
  renderSizes();
  initCalculatorSelects();
  updateCalculatedPrice();

  // Alternar días de precios
  document.getElementById("btn-semana").onclick = (e) => {
    currentDayType = 0;
    document.getElementById("btn-semana").classList.add("active");
    document.getElementById("btn-finde").classList.remove("active");
    renderSizes();
  };

  document.getElementById("btn-finde").onclick = (e) => {
    currentDayType = 1;
    document.getElementById("btn-finde").classList.add("active");
    document.getElementById("btn-semana").classList.remove("active");
    renderSizes();
  };

  // Escuchar cambios en la calculadora
  ["sel-size", "sel-day", "sel-flavor", "sel-elixir", "chk-jeringa"].forEach(id => {
    document.getElementById(id).addEventListener("change", updateCalculatedPrice);
  });

  document.getElementById("btn-whatsapp").onclick = sendWhatsAppOrder;

  // Cambiar Tema (Oscuro / Claro)
  document.getElementById("btn-theme").onclick = () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    document.body.setAttribute("data-theme", isDark ? "light" : "dark");
  };

  // Luces de fondo reactivas al mouse
  window.addEventListener("pointermove", (e) => {
    document.body.style.setProperty("--mx", `${e.clientX}px`);
    document.body.style.setProperty("--my", `${e.clientY}px`);
  });
});