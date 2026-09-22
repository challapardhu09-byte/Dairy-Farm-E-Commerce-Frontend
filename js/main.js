


/* =====================================================
   HEADER PROFILE STATE (Customer Storefront Only)
   ===================================================== */
function syncHeaderAuthState() {
  const userStr = localStorage.getItem("dairyFarmUser");
  const authButtons = document.querySelectorAll('#nav-auth-btn, .nav-auth-btn');

  if (userStr) {
    try {
      const user = JSON.parse(userStr);

      // Only show profile if logged in as a customer
      if (user && user.role === "customer") {
        const displayName = user.name && !user.name.startsWith("Customer ") 
          ? user.name.split(" ")[0] 
          : (user.mobile ? `+91 ${user.mobile.slice(-4)}` : "My Account");

        authButtons.forEach(btn => {
        btn.href = "/pages/account.html";
          btn.className = "header-profile-btn nav-auth-btn logged-in";
          btn.innerHTML = `<span>👤 ${displayName}</span>`;
          btn.title = `Signed in as ${user.name || user.mobile} - View Account`;
          btn.innerHTML = `<span class="profile-avatar" aria-hidden="true">${displayName.slice(0, 1).toUpperCase()}</span><span class="profile-label">${displayName}</span>`;
        });
        return;
      }
    } catch (e) {
      console.warn("Auth sync parse error:", e);
    }
  }

  // Default clean state for all visitors / public site
  authButtons.forEach(btn => {
    btn.href = "/pages/login.html";
    btn.className = "header-profile-btn nav-auth-btn";
    btn.innerHTML = "<span>👤 Sign in</span>";
    btn.title = "Customer sign in";
  });
}



/* =====================================================
   TRACK YOUR ORDER MODAL
   ===================================================== */
function openTrackOrderModal() {
  let modal = document.getElementById("track-order-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "track-order-modal";
    modal.className = "track-order-modal";
    modal.innerHTML = `
      <div class="track-order-card">
        <button type="button" class="product-modal-close" onclick="closeTrackOrderModal()">✕</button>
        <div style="text-align:center;margin-bottom:1.25rem;">
          <div style="font-size:2.5rem;margin-bottom:0.3rem;">🚚</div>
          <h3 style="margin:0;font-size:1.35rem;color:var(--forest);">Track Your Dairy Order</h3>
          <p style="color:var(--muted);font-size:0.88rem;margin:0.25rem 0 0;">Enter your 10-digit Tracking ID or Mobile number</p>
        </div>

        <form id="track-order-form" onsubmit="submitTrackOrder(event)">
          <label for="track-id-input" style="font-size:0.85rem;font-weight:700;">Tracking ID / Order Number</label>
          <input id="track-id-input" placeholder="e.g. DF43940552" required style="margin-bottom:1rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">
          <button type="submit" class="button" style="width:100%;">Check Order Status</button>
        </form>

        <div id="track-order-result" style="margin-top:1.25rem;"></div>

        <div style="border-top:1px solid var(--line);margin-top:1.25rem;padding-top:1rem;text-align:center;">
          <a href="https://wa.me/919603030888?text=Hello%20MilkyWay%20Farms,%20I%20need%20help%20tracking%20my%20delivery" target="_blank" rel="noopener noreferrer" class="button button-sm button-secondary" style="width:100%;text-align:center;">
            💬 Track via Farm WhatsApp (+91 96030 30888)
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", e => { if (e.target === modal) closeTrackOrderModal(); });
  }

  modal.classList.add("open");
  const input = document.getElementById("track-id-input");
  if (input) input.focus();
}

function closeTrackOrderModal() {
  const modal = document.getElementById("track-order-modal");
  if (modal) modal.classList.remove("open");
}

function submitTrackOrder(event) {
  event.preventDefault();
  const input = document.getElementById("track-id-input");
  const resultDiv = document.getElementById("track-order-result");
  const tid = input.value.trim().toUpperCase();

  if (!tid) return;

  resultDiv.innerHTML = `<div style="background:var(--mint);padding:1rem;border-radius:var(--radius-md);text-align:center;">Order tracking is not available on this static website. Please contact the farm and quote <strong>${tid}</strong>.</div>`;
}



/* =====================================================
   HEADER AUTH STATE SYNC (Dedicated Profile Button)
   ===================================================== */



function reorderItems(items) {
  if (!items || !items.length) return;
  items.forEach(item => {
    addToCart(item.name, item.price, item.quantity || 1, item.id || item.product_id, item.image_url, item.unit);
  });
  showToast("Past order items added to cart!", "🛒");
  openCartDrawer();
}

/* =====================================================
   MILKYWAY FARMS - 10/10 COMPLETE JAVASCRIPT
   ===================================================== */

const CART_KEY = "dairyFarmCart";
const PROMO_KEY = "dairyFarmPromo";

const formatCurrency = amount =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

/* =====================================================
   CART MANAGEMENT & PERSISTENCE
   ===================================================== */
const getCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
};

const saveCart = cart => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  syncHeaderAuthState();
  updateCartDisplay();
  updateCartDrawer();
};

const getAppliedPromo = () => {
  try { return JSON.parse(localStorage.getItem(PROMO_KEY)); } catch { return null; }
};

const saveAppliedPromo = promo => {
  if (promo) localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
  else localStorage.removeItem(PROMO_KEY);
};

/* =====================================================
   TOAST NOTIFICATION SYSTEM
   ===================================================== */
function showToast(message, icon = "✓") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span style="color:var(--gold);font-weight:800;font-size:1.1rem;">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 350);
  }, 2500);
}

/* =====================================================
   CART BADGE
   ===================================================== */
function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  document.querySelectorAll(".cart-count-badge, [data-cart-count]").forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? "inline-flex" : "none";
  });
}

/* =====================================================
   CART ITEM CONTROLS
   ===================================================== */
function updateCartItemQuantity(index, delta) {
  const cart = getCart();
  if (index < 0 || index >= cart.length) return;
  const newQty = cart[index].quantity + delta;
  if (newQty <= 0) {
    const item = cart[index];
    cart.splice(index, 1);
    showToast(`Removed ${item.name}`, "🗑️");
  } else {
    cart[index].quantity = newQty;
  }
  saveCart(cart);
}

function removeCartItem(index) {
  const cart = getCart();
  if (index < 0 || index >= cart.length) return;
  const item = cart[index];
  cart.splice(index, 1);
  saveCart(cart);
  showToast(`Removed ${item.name}`, "🗑️");
}

function clearCart() {
  if (!getCart().length) return;
  if (confirm("Remove all items from your cart?")) {
    saveCart([]);
    saveAppliedPromo(null);
    showToast("Cart cleared", "🗑️");
  }
}

/* =====================================================
   ADD TO CART
   ===================================================== */
function addToCart(productName, price, quantity = 1, productId = null, imageUrl = null, unit = null) {
  const selectedQuantity = Math.max(1, Number(quantity) || 1);
  const cart = getCart();
  const existing = cart.find(item => item.name === productName || (productId && item.product_id === productId));
  
  if (existing) {
    existing.quantity += selectedQuantity;
  } else {
    const defaultImg = productId ? `/images/${productId}/${productId}.jpg` : "/images/milk/milk.jpg";
    cart.push({
      product_id: productId,
      name: productName,
      price: Number(price),
      quantity: selectedQuantity,
      image_url: imageUrl || defaultImg,
      unit: unit || "1 Unit"
    });
  }
  
  saveCart(cart);
  showToast(`Added ${selectedQuantity}× ${productName} to cart`, "🛒");
  openCartDrawer();
}

function addSelectedProduct(button, productName, price, productId = null, imageUrl = null, unit = null) {
  const card = button.closest(".product-card") || button.closest("article");
  let quantity = 1;
  if (card) {
    const input = card.querySelector(".product-quantity, .qty-input-box");
    if (input) quantity = Number(input.value) || 1;
  }
  addToCart(productName, price, quantity, productId, imageUrl, unit);
  
  const originalText = button.textContent;
  button.textContent = "✓ Added";
  button.disabled = true;
  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
  }, 1200);
}

/* =====================================================
   SLIDE-OUT CART DRAWER
   ===================================================== */
function openCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-drawer-overlay");
  if (drawer && overlay) {
    drawer.classList.add("open");
    overlay.classList.add("open");
    updateCartDrawer();
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-drawer-overlay");
  if (drawer && overlay) {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
  }
}

function updateCartDrawer() {
  const itemsContainer = document.getElementById("drawer-cart-items");
  const subtotalEl = document.getElementById("drawer-cart-subtotal");
  const discountRow = document.getElementById("drawer-discount-row");
  const discountEl = document.getElementById("drawer-cart-discount");
  const totalEl = document.getElementById("drawer-cart-total");
  if (!itemsContainer) return;

  const cart = getCart();
  const rawSubtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const promo = getAppliedPromo();

  let discount = 0;
  if (promo && rawSubtotal >= (promo.minOrder || 0)) {
    discount = promo.discount || (promo.type === "percent" ? Math.round((rawSubtotal * promo.value) / 100) : promo.value);
  } else if (promo) {
    saveAppliedPromo(null);
  }

  const finalTotal = Math.max(0, rawSubtotal - discount);

  itemsContainer.replaceChildren();

  if (!cart.length) {
    itemsContainer.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem;">
        <div style="font-size:3rem;margin-bottom:0.5rem;">🥛</div>
        <p style="color:var(--muted);font-weight:600;">Your cart is currently empty.</p>
        <a href="/pages/products.html" class="button button-sm" onclick="closeCartDrawer()">Shop Fresh Dairy</a>
      </div>
    `;
  } else {
    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      const imgSrc = item.image_url || `/images/${item.product_id || "milk"}.jpg`;

      row.innerHTML = `
        <img src="${imgSrc}" alt="${item.name}" class="cart-item-img" onerror="this.src='/images/milk.jpg'">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">${formatCurrency(Number(item.price) * Number(item.quantity))}</span>
        </div>
        <div class="cart-item-controls">
          <button type="button" class="qty-btn" onclick="updateCartItemQuantity(${index}, -1)">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button type="button" class="qty-btn" onclick="updateCartItemQuantity(${index}, 1)">+</button>
          <button type="button" class="remove-btn" onclick="removeCartItem(${index})">✕</button>
        </div>
      `;
      itemsContainer.appendChild(row);
    });
  }

  if (subtotalEl) subtotalEl.textContent = formatCurrency(rawSubtotal);
  if (discountRow) discountRow.style.display = discount > 0 ? "flex" : "none";
  if (discountEl) discountEl.textContent = `-${formatCurrency(discount)}`;
  if (totalEl) totalEl.textContent = formatCurrency(finalTotal);
}

/* =====================================================
   PROMO CODE APPLICATION
   ===================================================== */
function applyPromoCode() {
  const input = document.getElementById("drawer-promo-input") || document.getElementById("checkout-promo-input");
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (!code) return;

  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  if (subtotal === 0) {
    showToast("Add items to cart before applying coupon", "⚠️");
    return;
  }

  showToast("Promo codes are unavailable on this static website.", "⚠️");
}

/* =====================================================
   DISPLAY CART (CHECKOUT PAGE)
   ===================================================== */
function updateCartDisplay() {
  const items = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");
  const clearBtn = document.getElementById("clear-cart-btn");
  if (!items || !totalElement) return;

  const cart = getCart();
  const rawSubtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const promo = getAppliedPromo();

  let discount = 0;
  if (promo && rawSubtotal >= 100) {
    discount = promo.discount || 0;
  }

  const finalTotal = Math.max(0, rawSubtotal - discount);

  items.replaceChildren();

  if (!cart.length) {
    const empty = document.createElement("li");
    empty.className = "cart-empty";
    empty.style.textAlign = "center";
    empty.style.padding = "2rem 1rem";
    empty.innerHTML = `
      <div style="font-size:2.5rem;margin-bottom:0.5rem;">🥛</div>
      <p style="color:var(--muted);font-weight:600;">Your cart is currently empty.</p>
      <a href="/pages/products.html" class="button button-sm" style="margin-top:0.5rem;">Shop Dairy Products</a>
    `;
    items.appendChild(empty);
  } else {
    cart.forEach((item, index) => {
      const row = document.createElement("li");
      row.className = "cart-item";
      const imgSrc = item.image_url || `/images/${item.product_id || "milk"}.jpg`;

      row.innerHTML = `
        <img src="${imgSrc}" alt="${item.name}" class="cart-item-img" onerror="this.src='/images/milk.jpg'">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">${formatCurrency(Number(item.price) * Number(item.quantity))}</span>
        </div>
        <div class="cart-item-controls">
          <button type="button" class="qty-btn" onclick="updateCartItemQuantity(${index}, -1)">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button type="button" class="qty-btn" onclick="updateCartItemQuantity(${index}, 1)">+</button>
          <button type="button" class="remove-btn" onclick="removeCartItem(${index})">✕</button>
        </div>
      `;
      items.appendChild(row);
    });

    if (discount > 0) {
      const promoRow = document.createElement("li");
      promoRow.className = "cart-item";
      promoRow.style.background = "var(--mint)";
      promoRow.innerHTML = `
        <div style="flex:1;">
          <strong style="color:var(--forest);">Coupon: ${promo.code}</strong>
          <span style="color:var(--leaf);font-weight:700;display:block;">-${formatCurrency(discount)} Discount</span>
        </div>
        <button type="button" class="remove-btn" onclick="saveAppliedPromo(null);updateCartDisplay();updateCartDrawer();">✕</button>
      `;
      items.appendChild(promoRow);
    }
  }

  totalElement.textContent = finalTotal.toLocaleString("en-IN");

  const submit = document.querySelector("#checkout-form button[type='submit']");
  if (submit) submit.disabled = !cart.length;

  if (clearBtn) clearBtn.style.display = cart.length ? "inline-block" : "none";

  // Update QR Code with final amount
  updateCheckoutUpiQr(finalTotal);
}

/* =====================================================
   CHECKOUT DYNAMIC UPI QR CODE
   ===================================================== */
function updateCheckoutUpiQr(amount) {
  const qrImg = document.getElementById("checkout-upi-qr");
  const upiLink = document.getElementById("checkout-upi-link");
  if (!qrImg) return;

  const upiId = "9603030888@upi";
  const payeeName = encodeURIComponent("MilkyWay Farms");
  const upiUri = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=MilkyWay%20Dairy%20Order`;
  qrImg.hidden = true;
  qrImg.alt = "Use the UPI payment link below";
  if (upiLink) upiLink.href = upiUri;
}

/* =====================================================
   PLACE ORDER
   ===================================================== */
async function placeOrder() {
  const cart = getCart();
  if (!cart.length) throw new Error("Your cart is empty.");

  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-mobile").value.trim();
  const email = document.getElementById("customer-email")?.value.trim() || "";
  const address = document.getElementById("customer-address").value.trim();
  const deliveryDate = document.getElementById("delivery-date").value;
  const deliveryTime = document.getElementById("delivery-time").value;
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || "cod";

  if (!name) throw new Error("Please enter your name.");
  if (!phone) throw new Error("Please enter your mobile number.");
  if (!address) throw new Error("Please enter your delivery address.");

  const promo = getAppliedPromo();
  const rawSubtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const discount = promo && rawSubtotal >= 100 ? (promo.discount || 0) : 0;

  const items = cart.map(item => ({
    id: item.product_id || item.id || null,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity)
  }));

  return {
    order: { trackingId: `MW${Date.now()}`, paymentMethod },
    totalAmount: Math.max(0, rawSubtotal - discount),
    deliveryDate,
    deliveryTime
  };
}

/* =====================================================
   PRODUCT QUICK-VIEW MODAL
   ===================================================== */
async function openQuickView(productId) {
  let modal = document.getElementById("quickview-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quickview-modal";
    modal.className = "product-modal-backdrop";
    modal.innerHTML = `
      <div class="product-modal-content">
        <button class="product-modal-close" onclick="closeQuickView()" aria-label="Close">✕</button>
        <div style="border-radius:var(--radius-md);overflow:hidden;background:#f8fafc;display:flex;align-items:center;justify-content:center;">
          <img id="qv-image" src="" alt="" style="width:100%;height:100%;object-fit:cover;min-height:260px;">
        </div>
        <div>
          <span id="qv-badge" class="product-badge" style="position:static;display:inline-block;margin-bottom:0.5rem;">Pure</span>
          <h2 id="qv-name" style="margin:0 0 0.25rem;font-size:1.4rem;color:var(--forest);">Product Name</h2>
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem;">
            <span id="qv-unit" style="color:var(--muted);font-weight:600;font-size:0.88rem;">1 Unit</span>
            <span id="qv-rating" style="color:var(--gold);font-weight:700;font-size:0.88rem;">★ 4.9</span>
          </div>
          <p id="qv-desc" style="color:var(--muted);font-size:0.88rem;line-height:1.6;margin-bottom:0.75rem;">Description</p>
          
          <div class="nutrition-grid" id="qv-nutrition"></div>

          <div style="font-size:0.8rem;color:var(--ink);background:var(--cream);padding:0.6rem;border-radius:var(--radius-sm);margin-bottom:1rem;">
            <strong style="color:var(--forest);">Storage:</strong> <span id="qv-storage">—</span><br>
            <strong style="color:var(--forest);">Shelf Life:</strong> <span id="qv-shelflife">—</span>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
            <strong id="qv-price" style="font-size:1.5rem;color:var(--forest);font-family:var(--font-heading);">₹0</strong>
            <button id="qv-add-btn" class="button" type="button">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", e => { if (e.target === modal) closeQuickView(); });
  }

  const prod = window.DEFAULT_PRODUCTS?.find(product => product.id === productId);
  if (!prod) return;

    document.getElementById("qv-image").src = prod.image_url || `/images/${prod.id}/${prod.id}.jpg`;
    document.getElementById("qv-badge").textContent = prod.badge || "Farm Fresh";
    document.getElementById("qv-name").textContent = prod.name;
    document.getElementById("qv-unit").textContent = prod.unit;
    document.getElementById("qv-rating").textContent = `★ ${prod.rating || 4.9} (${prod.reviewsCount || 100})`;
    document.getElementById("qv-desc").textContent = prod.description;
    document.getElementById("qv-price").textContent = formatCurrency(prod.price);
    document.getElementById("qv-storage").textContent = prod.storage || "Keep refrigerated at 4°C.";
    document.getElementById("qv-shelflife").textContent = prod.shelfLife || "Fresh Daily";

    const nutr = prod.nutrition || { energy: "65 kcal", protein: "3.4g", fat: "4.1g", calcium: "125mg" };
    document.getElementById("qv-nutrition").innerHTML = `
      <div class="nutrition-item"><strong>⚡ Energy</strong><span>${nutr.energy}</span></div>
      <div class="nutrition-item"><strong>💪 Protein</strong><span>${nutr.protein}</span></div>
      <div class="nutrition-item"><strong>🥑 Natural Fat</strong><span>${nutr.fat}</span></div>
      <div class="nutrition-item"><strong>🦴 Calcium</strong><span>${nutr.calcium}</span></div>
    `;

    const addBtn = document.getElementById("qv-add-btn");
    addBtn.onclick = () => {
      addToCart(prod.name, prod.price, 1, prod.id, prod.image_url, prod.unit);
      closeQuickView();
    };

    modal.classList.add("open");
}

function closeQuickView() {
  const modal = document.getElementById("quickview-modal");
  if (modal) modal.classList.remove("open");
}

/* =====================================================
   CUSTOMER REVIEWS LOADER & SUBMISSION
   ===================================================== */
function loadReviews() {
  const container = document.getElementById("reviews-container");
  if (!container) return;

  const reviews = [
    { name: "Lakshmi R.", location: "Guntur", product: "Farm Fresh Milk", rating: 5, comment: "Fresh milk delivered early every morning." },
    { name: "Suresh K.", location: "Vijayawada", product: "Pure Desi Cow Ghee", rating: 5, comment: "Wonderful aroma and quality." },
    { name: "Anitha P.", location: "Tenali", product: "Natural Farm Curd", rating: 5, comment: "Thick, creamy, and delicious." }
  ];
  container.innerHTML = reviews.map(r => `
        <div class="review-card">
          <div class="review-stars">${"★".repeat(r.rating || 5)}</div>
          <p>“${r.comment}”</p>
          <div class="reviewer">
            <div class="reviewer-avatar">${(r.name || "C").slice(0, 2).toUpperCase()}</div>
            <div class="reviewer-info">
              <strong>${r.name}</strong>
              <small>${r.product || "Daily Subscriber"} · ${r.location || "Verified"}</small>
            </div>
          </div>
        </div>
      `).join("");
}

/* =====================================================
   DOM INITIALIZATION
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  syncHeaderAuthState();
  updateCartBadge();
  updateCartDisplay();
  loadReviews();

  // Create Cart Drawer HTML if not on page
  if (!document.getElementById("cart-drawer")) {
    const drawerHtml = `
      <div id="cart-drawer-overlay" class="cart-drawer-overlay" onclick="closeCartDrawer()"></div>
      <aside id="cart-drawer" class="cart-drawer" aria-label="Shopping Cart">
        <div class="cart-drawer-header">
          <h3><span>🛒</span> Your Shopping Cart</h3>
          <button type="button" class="cart-drawer-close" onclick="closeCartDrawer()">✕</button>
        </div>
        <div class="cart-drawer-body" id="drawer-cart-items"></div>
        <div class="cart-drawer-footer">
          <div class="cart-promo-box">
            <input type="text" id="drawer-promo-input" placeholder="Coupon Code (e.g. FRESH10)">
            <button type="button" class="button button-sm" onclick="applyPromoCode()">Apply</button>
          </div>
          <div class="drawer-subtotal-row">
            <span>Subtotal:</span>
            <strong id="drawer-cart-subtotal">₹0</strong>
          </div>
          <div class="drawer-subtotal-row" id="drawer-discount-row" style="display:none;color:var(--leaf);">
            <span>Discount:</span>
            <strong id="drawer-cart-discount">-₹0</strong>
          </div>
          <div class="drawer-subtotal-row" style="border-top:1px solid var(--line);padding-top:0.5rem;font-size:1.1rem;">
            <span>Estimated Total:</span>
            <strong id="drawer-cart-total" style="font-size:1.35rem;">₹0</strong>
          </div>
          <a href="/pages/checkout.html" class="button" style="width:100%;margin-top:0.8rem;text-align:center;">Proceed to Checkout →</a>
        </div>
      </aside>
    `;
    document.body.insertAdjacentHTML("beforeend", drawerHtml);
  }

  // Intercept header cart clicks to slide open drawer
  document.querySelectorAll('a[href*="checkout.html"].nav-cta').forEach(link => {
    if (!window.location.pathname.includes("checkout.html")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        openCartDrawer();
      });
    }
  });

  // Floating Back to Top Button
  const btt = document.createElement("button");
  btt.className = "back-to-top";
  btt.innerHTML = "↑";
  btt.setAttribute("aria-label", "Back to top");
  btt.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  document.body.appendChild(btt);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) btt.classList.add("show");
    else btt.classList.remove("show");
  });

  // Preloader
  const loader = document.getElementById("page-loader");
  if (loader) loader.addEventListener("click", () => loader.style.display = "none");

  // Mobile menu toggle
  const toggle = document.querySelector(".mobile-nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (toggle && nav) toggle.addEventListener("click", () => nav.classList.toggle("open"));

  // FAQ Accordion
  document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      if (item) {
        const isOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item").forEach(el => el.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      }
    });
  });

  // Payment Tabs Toggle in Checkout
  document.querySelectorAll(".payment-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".payment-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const radio = tab.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      const upiBox = document.getElementById("upi-payment-details");
      if (upiBox) {
        upiBox.style.display = radio?.value === "upi" ? "block" : "none";
      }
    });
  });

  // Checkout Form Submit
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    const deliveryDate = document.getElementById("delivery-date");
    if (deliveryDate) {
      const today = new Date().toISOString().slice(0, 10);
      deliveryDate.min = today;
      if (!deliveryDate.value) deliveryDate.value = today;
    }

    checkoutForm.addEventListener("submit", async event => {
      event.preventDefault();
      const cart = getCart();
      if (!cart.length) {
        showToast("Your cart is empty.", "⚠️");
        return;
      }

      const button = checkoutForm.querySelector("button[type='submit']");
      button.disabled = true;
      button.textContent = "Placing Order...";

      try {
        const result = await placeOrder();
        const savedOrders = JSON.parse(localStorage.getItem("dairyFarmOrders") || "[]");
        savedOrders.unshift({
          id: result.order.trackingId,
          date: `${result.deliveryDate} · ${result.deliveryTime}`,
          total: formatCurrency(result.totalAmount),
          status: "Order request ready"
        });
        localStorage.setItem("dairyFarmOrders", JSON.stringify(savedOrders));
        saveCart([]);
        saveAppliedPromo(null);
        updateCartDisplay();
        checkoutForm.reset();

        const confirmation = document.getElementById("order-confirmation");
        if (confirmation) {
          confirmation.hidden = false;
          const trackingId = result.order.trackingId || result.order.id;
          const waMessage = encodeURIComponent(`Hello MilkyWay Farms! I just placed order #${trackingId} for ${formatCurrency(result.totalAmount)}. Delivery scheduled on ${result.deliveryDate}.`);
          
          confirmation.innerHTML = `
            <div style="text-align:center;padding:1.5rem 1rem;">
              <div style="font-size:3.5rem;margin-bottom:0.5rem;">🎉</div>
              <h3 style="color:var(--forest);font-size:1.5rem;margin-bottom:0.3rem;">Order Placed Successfully!</h3>
              <p style="font-size:1.05rem;color:var(--ink);">Tracking ID: <strong style="color:var(--leaf);font-size:1.25rem;">#${trackingId}</strong></p>
              
              <div style="background:var(--white);padding:1.25rem;border-radius:var(--radius-md);margin:1.25rem auto;text-align:left;max-width:340px;border:1px solid var(--line);">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;"><span>Total Amount:</span> <strong>${formatCurrency(result.totalAmount)}</strong></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;"><span>Payment Mode:</span> <strong style="text-transform:uppercase;">${result.order.paymentMethod || "COD"}</strong></div>
                <div style="display:flex;justify-content:space-between;"><span>Delivery Date:</span> <strong>${result.deliveryDate}</strong></div>
              </div>

              <div style="display:flex;flex-direction:column;gap:0.75rem;max-width:340px;margin:0 auto;">
                <a href="https://wa.me/919603030888?text=${waMessage}" target="_blank" rel="noopener noreferrer" class="button" style="background:#25d366;color:#fff;">
                  💬 Send Order Receipt to WhatsApp
                </a>
                <a href="/pages/products.html" class="button button-secondary">Continue Shopping</a>
              </div>
            </div>
          `;
          confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } catch (error) {
        alert(error.message);
      } finally {
        button.disabled = !getCart().length;
        button.textContent = "Place Order Request";
      }
    });
  }

  // Review Form Submit
  const reviewForm = document.getElementById("customer-review-form");
  if (reviewForm) {
    let currentRating = 5;
    document.querySelectorAll(".rating-star-btn").forEach(star => {
      star.addEventListener("click", () => {
        currentRating = Number(star.dataset.val);
        document.querySelectorAll(".rating-star-btn").forEach(s => {
          s.classList.toggle("active", Number(s.dataset.val) <= currentRating);
        });
      });
    });

    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("review-name").value.trim();
      const product = document.getElementById("review-product").value;
      const location = document.getElementById("review-location").value.trim();
      const comment = document.getElementById("review-comment").value.trim();

      const btn = reviewForm.querySelector("button[type='submit']");
      showToast("Thanks for your feedback! Reviews are not submitted from this static website.", "🎉");
      reviewForm.reset();
    });
  }
});


/* =====================================================
   MILK SUBSCRIPTION FORM & LIVE CALCULATION
   ===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const subForm = document.getElementById("subscription-form");
  if (!subForm) return;

  const freqSelect = document.getElementById("delivery-frequency");
  const qtyInput = document.getElementById("quantity");
  const priceDisplay = document.getElementById("sub-total-price") || document.getElementById("sub-estimate-display");
  const deliveriesDisplay = document.getElementById("sub-deliveries-count");

  function recalculateSubEstimate() {
    const qty = Math.max(0.5, Number(qtyInput?.value) || 1);
    const freq = freqSelect?.value || "daily";
    const counts = { daily: 30, alternate: 15, weekly: 5, monthly: 1 };
    const count = counts[freq] || 30;
    const total = count * qty * 50;

    if (priceDisplay) priceDisplay.textContent = formatCurrency(total);
    if (deliveriesDisplay) deliveriesDisplay.textContent = `${count} deliveries / month`;
  }

  if (freqSelect) freqSelect.addEventListener("change", recalculateSubEstimate);
  if (qtyInput) qtyInput.addEventListener("input", recalculateSubEstimate);
  recalculateSubEstimate();

  // Handle Form Submit
   subForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = subForm.querySelector('button[type="submit"]');
    const originalText = btn ? btn.textContent : "Submit";
    if (btn) { btn.disabled = true; btn.textContent = "Submitting Request..."; }

    const name = document.getElementById("sub-name").value.trim();
    const mobile = document.getElementById("sub-mobile").value.trim();
    const address = document.getElementById("sub-address").value.trim();
    const frequency = document.getElementById("delivery-frequency").value;
    const quantity = Number(document.getElementById("quantity").value) || 1;
    const startDate = document.getElementById("delivery-start").value;
    const time = document.getElementById("delivery-time")?.value || "morning";

      const savedSubscriptions = JSON.parse(localStorage.getItem("dairyFarmSubscriptions") || "[]");
      savedSubscriptions.unshift({ name, mobile, address, frequency, quantity, startDate, time });
      localStorage.setItem("dairyFarmSubscriptions", JSON.stringify(savedSubscriptions));

      const message = encodeURIComponent(`Hello MilkyWay Farms! I would like a ${quantity}L ${frequency} milk subscription starting ${startDate || "soon"}. Name: ${name}; Mobile: ${mobile}; Address: ${address}; Preferred time: ${time}.`);
      subForm.innerHTML = `
        <div style="text-align:center;padding:2rem 1rem;background:var(--mint);border-radius:var(--radius-md);border:1.5px solid #7bc292;animation:fadeIn 0.4s ease-out;">
          <div style="font-size:3rem;margin-bottom:0.5rem;">🥛</div>
          <span class="eyebrow" style="color:var(--leaf);margin:0;">Request Successfully Sent!</span>
          <h3 style="color:var(--forest);font-size:1.4rem;margin:0.3rem 0 0.75rem;">Waiting for Farm Owner Approval</h3>
          <p style="color:var(--ink);font-size:0.92rem;max-width:480px;margin:0 auto 1.25rem;line-height:1.5;">
            Thank you, <strong>${name}</strong>! Send your <strong>${quantity}L ${frequency}</strong> request directly to the farm on WhatsApp to arrange delivery.
          </p>
          <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
            <a href="https://wa.me/919603030888?text=${message}" target="_blank" rel="noopener noreferrer" class="button button-sm button-secondary">💬 Message Farm on WhatsApp</a>
          </div>
        </div>
      `;
      showToast("Your subscription message is ready to send.", "🥛");
  });
});
