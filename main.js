// ============================================================================
// ─── 1. DATA STORE & STATE MANAGEMENT ───────────────────────────────────────
// ============================================================================

const products = [
  {
    id: 1,
    name: "18-Year Traditional Balsamic",
    cat: "vinegar",
    price: 24.0,
    badge: "Best Seller",
    badgeClass: "pb-best",
    desc: "Thick, rich, and naturally sweet. Aged in Italian oak barrels.",
  },
  {
    id: 2,
    name: "Cold-Pressed Tuscan EVOO",
    cat: "oil",
    price: 28.0,
    badge: "New",
    badgeClass: "pb-new",
    desc: "Robust and peppery with a clean, grass-like finish.",
  },
  {
    id: 3,
    name: "Roasted Garlic Infused Oil",
    cat: "oil",
    price: 22.0,
    badge: "",
    badgeClass: "",
    desc: "Perfect for dipping bread or roasting vegetables.",
  },
  {
    id: 4,
    name: "Blood Orange Fusion Oil",
    cat: "oil",
    price: 24.0,
    badge: "Staff Pick",
    badgeClass: "pb-staff",
    desc: "Zesty and bright. Ideal for seafood and summer salads.",
  },
  {
    id: 5,
    name: "Fig Dark Balsamic",
    cat: "vinegar",
    price: 24.0,
    badge: "",
    badgeClass: "",
    desc: "Mediterranean figs give this balsamic a fruity depth.",
  },
  {
    id: 6,
    name: "Smoked Paprika Rub",
    cat: "spice",
    price: 14.0,
    badge: "",
    badgeClass: "",
    desc: "Hand-blended with sea salt and garlic.",
  },
];

let cart = [];

let hoursData = {
  mon: "10:00 AM – 6:00 PM",
  tue: "10:00 AM – 6:00 PM",
  wed: "10:00 AM – 6:00 PM",
  thu: "10:00 AM – 6:00 PM",
  fri: "10:00 AM – 6:00 PM",
  sat: "10:00 AM – 4:00 PM",
  sun: "Closed",
};

// ============================================================================
// ─── 2. LIFECYCLE INITIALIZATION ────────────────────────────────────────────
// ============================================================================

window.addEventListener("DOMContentLoaded", () => {
  renderProducts("all");
  updateRefillDay();
  initScrollAnimations();
});

// ============================================================================
// ─── 3. SHOP RENDER & FILTRATION ENGINE ─────────────────────────────────────
// ============================================================================

function renderProducts(filter) {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const filtered =
    filter === "all" ? products : products.filter((p) => p.cat === filter);

  filtered.forEach((p) => {
    const card = document.createElement("div");
    card.className = "pcard";
    card.innerHTML = `
      ${p.badge ? `<div class="pbadge ${p.badgeClass}">${p.badge}</div>` : ""}
      <div class="pimg">
        <div class="photo-slot">
          <span class="photo-slot-icon">🧴</span>
          <span class="photo-slot-text">Artisan Collection</span>
        </div>
      </div>
      <div class="pinfo">
        <div class="pcat">${p.cat.toUpperCase()}</div>
        <div class="pname">${p.name}</div>
        <div class="pdesc">${p.desc}</div>
        <div class="pfoot">
          <div class="pprice">$${p.price.toFixed(2)} <small>/ 375ml</small></div>
          <button class="addbtn" onclick="addToCart(${p.id}, event)" aria-label="Add ${p.name} to cart">Add to Cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterShop(cat) {
  document.querySelectorAll(".ftab").forEach((t) => {
    const tabText = t.textContent.trim().toLowerCase();
    // Normalizes strings so plural nav tabs matching singular product categories trigger active classes properly
    const isMatch =
      tabText === cat || tabText.startsWith(cat) || cat.startsWith(tabText);
    t.classList.toggle("active", isMatch);
  });

  renderProducts(cat);

  const shopSection = document.getElementById("shop");
  if (shopSection) {
    shopSection.scrollIntoView({ behavior: "smooth" });
  }
}

// ============================================================================
// ─── 4. CART LOGIC ──────────────────────────────────────────────────────────
// ============================================================================

function addToCart(id, e) {
  if (e && typeof e.stopPropagation === "function") {
    e.stopPropagation();
  }

  const prod = products.find((p) => p.id === id);
  if (!prod) return;

  const exists = cart.find((i) => i.id === id);

  if (exists) {
    exists.qty++;
  } else {
    cart.push({ ...prod, qty: 1 });
  }

  updateCartUI();
  showToast(`${prod.name} added!`);

  const counter = document.getElementById("cart-counter");
  if (counter) {
    counter.classList.add("bump");
    setTimeout(() => counter.classList.remove("bump"), 300);
  }
}

function updateCartUI() {
  const container = document.getElementById("cart-items-container");
  const footer = document.getElementById("cart-footer");
  const counter = document.getElementById("cart-counter");

  const totalQty = cart.reduce((acc, i) => acc + i.qty, 0);
  if (counter) {
    counter.textContent = totalQty;
  }

  if (cart.length === 0) {
    if (container) {
      container.innerHTML = `
        <div class="cart-empty">
          <i>🧺</i>
          <p>Your pantry is currently empty.</p>
          <button class="btn-gold" onclick="toggleCart(false)">Start Shopping</button>
        </div>
      `;
    }
    if (footer) {
      footer.style.display = "none";
    }
    return;
  }

  if (footer) {
    footer.style.display = "block";
  }

  if (container) {
    container.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item">
          <div class="ci-img"></div>
          <div class="ci-details">
            <div class="ci-name">${item.name}</div>
            <div class="ci-price">$${item.price.toFixed(2)}</div>
            <div class="ci-qty">
              <button class="qty-btn" onclick="changeQty(${item.id}, -1)" aria-label="Decrease quantity">-</button>
              <span>${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${item.id}, 1)" aria-label="Increase quantity">+</button>
            </div>
          </div>
        </div>
      `,
      )
      .join("");
  }

  const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);

  if (footer) {
    footer.innerHTML = `
      <div class="cart-total-row">
        <span>Subtotal</span>
        <span>$${total.toFixed(2)}</span>
      </div>
      <button class="checkout-btn" aria-label="Proceed to checkout">Checkout</button>
      ${
        total < 75
          ? `<div class="cart-ships-free">Spend $${(75 - total).toFixed(2)} more for Free Shipping</div>`
          : '<div class="cart-ships-free">✓ You qualify for Free Shipping!</div>'
      }
    `;
  }
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  updateCartUI();
}

function toggleCart(show) {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");

  if (!drawer || !overlay) return;

  if (show) {
    overlay.style.display = "block";
    setTimeout(() => drawer.classList.add("active"), 10);
  } else {
    drawer.classList.remove("active");
    setTimeout(() => {
      overlay.style.display = "none";
    }, 400);
  }
}

// ============================================================================
// ─── 5. DYNAMIC REFILL LOGIC ────────────────────────────────────────────────
// ============================================================================

function updateRefillDay() {
  const refillDayEl = document.getElementById("next-refill-day");
  if (!refillDayEl) return;

  const now = new Date();
  const nextThursday = new Date();

  nextThursday.setDate(now.getDate() + ((4 + 7 - now.getDay()) % 7));

  if (now.getDay() === 4 && now.getHours() >= 18) {
    nextThursday.setDate(nextThursday.getDate() + 7);
  }

  const options = { month: "long", day: "numeric" };
  refillDayEl.textContent = `Next Day: ${nextThursday.toLocaleDateString(undefined, options)}`;
}

// ============================================================================
// ─── 6. ADMIN PANEL CONTROLS ────────────────────────────────────────────────
// ============================================================================

function openAdmin() {
  const modal = document.getElementById("admin-modal");
  if (modal) modal.style.display = "flex";
}

// Note: If you link a button to close by clicking the overlay backdrop,
// you can hook this same function directly to its click handler.
function closeAdmin() {
  const modal = document.getElementById("admin-modal");
  if (modal) modal.style.display = "none";
}

function saveHours() {
  const monInput = document.getElementById("hour-mon-in");
  const satInput = document.getElementById("hour-sat-in");

  if (!monInput || !satInput) return;

  const mon = monInput.value;
  const sat = satInput.value;

  ["mon", "tue", "wed", "thu", "fri"].forEach((d) => {
    const dayEl = document.getElementById(`hour-${d}`);
    if (dayEl) dayEl.textContent = mon;
  });

  const satEl = document.getElementById("hour-sat");
  if (satEl) satEl.textContent = sat;

  showToast("Hours updated!");
}

function saveAnnouncement() {
  const announceInput = document.getElementById("announceText");
  if (!announceInput) return;

  const txt = announceInput.value.trim();
  const banner = document.getElementById("ann-bar-top");

  if (txt && banner) {
    banner.innerHTML = txt;
  }
  showToast("Announcement updated!");
}

function switchAdminTab(name, btn) {
  if (!btn) return;

  document.querySelectorAll(".atab").forEach((t) => {
    t.classList.remove("active");
  });

  document.querySelectorAll(".admin-panel").forEach((p) => {
    p.classList.remove("active");
  });

  btn.classList.add("active");

  const targetPanel = document.getElementById("tab-" + name);
  if (targetPanel) {
    targetPanel.classList.add("active");
  }
}

// ============================================================================
// ─── 7. UTILITIES & SCROLL ANIMATIONS ───────────────────────────────────────
// ============================================================================

let toastTimeout = null;

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;

  t.textContent = msg;
  t.classList.add("active");

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    t.classList.remove("active");
  }, 3000);
}

function initScrollAnimations() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.animation = "fadeUp 0.65s ease both";
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 },
  );

  document
    .querySelectorAll(".pcard, .rcard, .cat-card, .ri")
    .forEach((el) => obs.observe(el));
}
