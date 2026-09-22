/* =====================================================
   MILKYWAY FARMS - INSTANT RENDER PRODUCTS JAVASCRIPT
   ===================================================== */

const DEFAULT_PRODUCTS = [
  {
    id: "milk",
    name: "Farm Fresh Milk",
    price: 50,
    unit: "1 Litre Glass Bottle",
    category: "milk",
    image_url: "/images/milk/milk.jpg",
    badge: "100% Pure & Raw",
    rating: 4.9,
    reviewsCount: 184,
    description: "Unprocessed, farm-chilled pure cow milk straight from pasture-fed cows. Rich in natural nutrients and delivered within hours of morning milking.",
    stock: 150
  },
  {
    id: "curd",
    name: "Natural Farm Curd",
    price: 40,
    unit: "500g Clay Matka",
    category: "curd",
    image_url: "/images/curd/curd.jpg",
    badge: "Probiotic Rich",
    rating: 4.9,
    reviewsCount: 112,
    description: "Thick, creamy, and traditional setting in breathable earthen pots. Loaded with active gut-friendly cultures and mild natural sweetness.",
    stock: 90
  },
  {
    id: "ghee",
    name: "Pure Desi Cow Ghee",
    price: 200,
    unit: "500ml Glass Jar",
    category: "ghee",
    image_url: "/images/ghee/ghee.jpg",
    badge: "Bilona Method",
    rating: 5.0,
    reviewsCount: 240,
    description: "Traditional Vedic bilona churned ghee from whole curd. Golden granular texture with an irresistible earthy aroma for authentic cooking.",
    stock: 60
  },
  {
    id: "paneer",
    name: "Fresh Malai Paneer",
    price: 120,
    unit: "250g Vacuum Pack",
    category: "paneer",
    image_url: "/images/paneer/paneer.jpg",
    badge: "Melt In Mouth",
    rating: 4.8,
    reviewsCount: 96,
    description: "Super soft, moist cottage cheese made from fresh whole milk. Free from starch or preservatives, perfect for curries, tikka, and salads.",
    stock: 75
  },
  {
    id: "butter",
    name: "Golden Farm Butter",
    price: 90,
    unit: "250g Block",
    category: "ghee",
    image_url: "/images/butter/butter.jpg",
    badge: "Freshly Churned",
    rating: 4.9,
    reviewsCount: 78,
    description: "Creamy, naturally sweet white-golden farm butter churned fresh every morning. Delicious on warm rotis, parathas, and toast.",
    stock: 65
  },
  {
    id: "cheese",
    name: "Artisanal Farm Cheese",
    price: 150,
    unit: "200g Wheel",
    category: "paneer",
    image_url: "/images/cheese/cheese.jpg",
    badge: "Handcrafted",
    rating: 4.7,
    reviewsCount: 65,
    description: "Hand-molded farm cheese aged to a smooth, velvety consistency. Subtle nutty notes, perfect for gourmet platters and family snacks.",
    stock: 45
  },
  {
    id: "lassi",
    name: "Traditional Sweet Lassi",
    price: 35,
    unit: "300ml Chilled Bottle",
    category: "sweets",
    image_url: "/images/lassi/lassi.jpg",
    badge: "Chilled & Creamy",
    rating: 4.9,
    reviewsCount: 142,
    description: "Authentic Punjabi style whipped sweetened yogurt drink topped with a hint of cardamom, saffron, and thick malai. Instant refreshment.",
    stock: 100
  },
  {
    id: "khoya",
    name: "Pure Mawa / Khoya",
    price: 180,
    unit: "250g Fresh Pack",
    category: "sweets",
    image_url: "/images/khoya/khoya.jpg",
    badge: "100% Milk Solids",
    rating: 4.8,
    reviewsCount: 54,
    description: "Slowly reduced whole milk solids with zero added sugar or flour. Essential for rich homemade gulab jamun, barfi, and royal festive delicacies.",
    stock: 40
  }
];

window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;

let allProducts = [...DEFAULT_PRODUCTS];
let currentCategory = "all";
let searchQuery = "";

function renderProducts() {
  const grid = document.getElementById("product-grid") || document.querySelector(".product-grid");
  if (!grid) return;

  const filtered = allProducts.filter(product => {
    const matchesCategory = currentCategory === "all" || product.category === currentCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
        <h3 style="color:var(--forest);">No matching dairy products found</h3>
        <p style="color:var(--muted);">Try changing your search terms or category filters.</p>
        <button class="button button-sm" onclick="resetFilters()">Show All Products</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const imgUrl = product.image_url || `/images/${product.id}.jpg`;
    const inStock = (product.stock === undefined || product.stock > 0);

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-image-wrap" style="position:relative;cursor:pointer;" onclick="if(typeof openQuickView === 'function') openQuickView('${product.id}')">
          <img src="${imgUrl}" alt="${product.name}" loading="lazy" onerror="this.src='/images/${product.id}.jpg'; this.onerror=function(){this.src='/images/milk.jpg';};">
          <span class="product-badge">${product.badge || "Farm Fresh"}</span>
          <button type="button" class="quick-view-btn" style="position:absolute;bottom:8px;right:8px;background:rgba(255,255,255,0.92);border:none;border-radius:20px;font-size:0.75rem;padding:0.25rem 0.6rem;font-weight:700;color:var(--forest);box-shadow:0 2px 6px rgba(0,0,0,0.15);">🔍 Info</button>
        </div>
        <div class="product-card-body">
          <div class="product-meta">
            <span class="product-unit">${product.unit}</span>
            <span class="product-rating">★ ${(product.rating || 4.9).toFixed(1)} <span>(${product.reviewsCount || 80})</span></span>
          </div>
          <h3 onclick="if(typeof openQuickView === 'function') openQuickView('${product.id}')" style="cursor:pointer;">${product.name}</h3>
          <p class="description">${product.description}</p>
          
          <div class="product-card-footer">
            <div class="price-tag">
              <strong>₹${product.price}</strong>
              <small>${inStock ? "In Stock" : "<span style='color:#dc2626;'>Sold Out</span>"}</small>
            </div>
            
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <div class="quantity-controls">
                <button type="button" class="qty-stepper-btn" onclick="stepQuantity(this, -1)" aria-label="Decrease quantity">−</button>
                <input type="number" class="qty-input-box" value="1" min="1" max="50" readonly>
                <button type="button" class="qty-stepper-btn" onclick="stepQuantity(this, 1)" aria-label="Increase quantity">+</button>
              </div>
              <button 
                type="button" 
                class="button add-cart-btn" 
                ${!inStock ? "disabled" : ""}
                onclick="addSelectedProduct(this, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.id}', '${imgUrl}', '${product.unit}')">
                ${inStock ? "Add" : "Out"}
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function stepQuantity(btn, delta) {
  const container = btn.closest(".quantity-controls");
  const input = container.querySelector(".qty-input-box");
  if (!input) return;
  const current = Number(input.value) || 1;
  input.value = Math.max(1, current + delta);
}

function resetFilters() {
  currentCategory = "all";
  searchQuery = "";
  const searchInput = document.getElementById("product-search");
  if (searchInput) searchInput.value = "";
  document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
  document.querySelector('.cat-pill[data-category="all"]')?.classList.add("active");
  renderProducts();
}

function initProducts() {
  // Render immediately from cache
  renderProducts();

  // Attach filter listeners
  document.querySelectorAll(".cat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentCategory = pill.dataset.category || "all";
      renderProducts();
    });
  });

  const searchInput = document.getElementById("product-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      renderProducts();
    });
  }

  const sortSelect = document.getElementById("product-sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "price-asc") allProducts.sort((a, b) => a.price - b.price);
      else if (val === "price-desc") allProducts.sort((a, b) => b.price - a.price);
      else if (val === "rating") allProducts.sort((a, b) => b.rating - a.rating);
      else allProducts.sort((a, b) => a.id.localeCompare(b.id));
      renderProducts();
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProducts);
} else {
  initProducts();
}
