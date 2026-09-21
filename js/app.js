// Master Application Controller & State Management

const AppState = (() => {
  const STORAGE_KEYS = {
    PRODUCTS: "farmer_app_products_v1",
    FARMERS: "farmer_app_farmers_v1",
    ORDERS: "farmer_app_orders_v1",
    CART: "farmer_app_cart_v1",
    ACTIVE_ROLE: "farmer_app_active_role_v1"
  };

  let products = [];
  let farmers = [];
  let orders = [];
  let cart = [];
  let currentRole = "consumer"; // 'consumer' | 'farmer'

  function init() {
    loadData();
    setupCartListeners();
    setupRoleSwitcher();
    renderCart();

    // Initialize sub-modules
    MarketplaceModule.init();
    FarmerModule.init();
    CalculatorModule.init();

    // Restore previously saved role
    const savedRole = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) || "consumer";
    setRole(savedRole);
  }

  function loadData() {
    // Load or initialize Products
    const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    products = storedProducts ? JSON.parse(storedProducts) : [...INITIAL_PRODUCTS];

    // Load or initialize Farmers
    const storedFarmers = localStorage.getItem(STORAGE_KEYS.FARMERS);
    farmers = storedFarmers ? JSON.parse(storedFarmers) : [...INITIAL_FARMERS];

    // Load or initialize Orders
    const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    orders = storedOrders ? JSON.parse(storedOrders) : [...INITIAL_ORDERS];

    // Load Cart
    const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
    cart = storedCart ? JSON.parse(storedCart) : [];
  }

  // Getters & Setters
  function getProducts() { return products; }
  function saveProducts(newProds) {
    products = newProds;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  function getFarmers() { return farmers; }
  function saveFarmers(newFarmers) {
    farmers = newFarmers;
    localStorage.setItem(STORAGE_KEYS.FARMERS, JSON.stringify(farmers));
  }

  function getOrders() { return orders; }
  function saveOrders(newOrders) {
    orders = newOrders;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  function getCart() { return cart; }
  function saveCart(newCart) {
    cart = newCart;
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    renderCart();
  }

  // Role switching
  function setupRoleSwitcher() {
    const btnConsumer = document.getElementById("btn-role-consumer");
    const btnFarmer = document.getElementById("btn-role-farmer");

    if (btnConsumer) btnConsumer.addEventListener("click", () => setRole("consumer"));
    if (btnFarmer) btnFarmer.addEventListener("click", () => setRole("farmer"));
  }

  function setRole(role) {
    currentRole = role;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);

    const btnConsumer = document.getElementById("btn-role-consumer");
    const btnFarmer = document.getElementById("btn-role-farmer");
    const viewConsumer = document.getElementById("consumer-view");
    const viewFarmer = document.getElementById("farmer-view");
    const cartBtn = document.getElementById("nav-cart-btn");

    if (role === "farmer") {
      btnFarmer.classList.add("role-pill-active");
      btnConsumer.classList.remove("role-pill-active");
      btnConsumer.classList.add("text-gray-600", "hover:text-emerald-700");

      viewConsumer.classList.add("hidden");
      viewFarmer.classList.remove("hidden");
      if (cartBtn) cartBtn.classList.add("hidden");

      FarmerModule.renderFarmerDashboard();
    } else {
      btnConsumer.classList.add("role-pill-active");
      btnFarmer.classList.remove("role-pill-active");
      btnFarmer.classList.add("text-gray-600", "hover:text-emerald-700");

      viewConsumer.classList.remove("hidden");
      viewFarmer.classList.add("hidden");
      if (cartBtn) cartBtn.classList.remove("hidden");

      MarketplaceModule.renderProducts();
    }
  }

  // Cart Management
  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.productId === productId);
    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.directPrice,
        middlemanPrice: product.middlemanPrice,
        unit: product.unit,
        image: product.image,
        farmerId: product.farmerId,
        qty: 1
      });
    }

    saveCart(cart);
    showToast(`Added "${product.name}" to direct farm cart!`, "success");
  }

  function updateCartQty(productId, delta) {
    const index = cart.findIndex(item => item.productId === productId);
    if (index === -1) return;

    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCart(cart);
    showToast("Item removed from cart", "info");
  }

  function renderCart() {
    const badge = document.getElementById("nav-cart-badge");
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    if (badge) {
      badge.innerText = count;
      badge.classList.toggle("hidden", count === 0);
    }

    const drawer = document.getElementById("cart-items-container");
    if (!drawer) return;

    if (cart.length === 0) {
      drawer.innerHTML = `
        <div class="py-12 text-center text-gray-500">
          <svg class="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
          <p class="font-medium text-gray-700">Your basket is empty</p>
          <p class="text-xs text-gray-400 mt-1">Directly support local growers by picking fresh harvest.</p>
        </div>
      `;
      updateCartTotals(0, 0, 0);
      return;
    }

    let subtotalDirect = 0;
    let subtotalMiddleman = 0;

    drawer.innerHTML = cart.map(item => {
      const lineDirect = item.price * item.qty;
      const lineMiddleman = item.middlemanPrice * item.qty;
      subtotalDirect += lineDirect;
      subtotalMiddleman += lineMiddleman;

      return `
        <div class="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-2xs">
          <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-lg object-cover border border-gray-100">
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-gray-900 truncate">${item.name}</h4>
            <div class="text-[11px] text-emerald-700 font-semibold">
              ₹${item.price} <span class="text-gray-400 font-normal">/${item.unit}</span>
            </div>
            <div class="text-[10px] text-gray-400 line-through">Retail: ₹${item.middlemanPrice}</div>
          </div>

          <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button 
              onclick="AppState.updateCartQty('${item.productId}', -1)" 
              class="w-6 h-6 flex items-center justify-center text-gray-700 font-bold hover:bg-white rounded"
            >-</button>
            <span class="w-6 text-center text-xs font-bold text-gray-900">${item.qty}</span>
            <button 
              onclick="AppState.updateCartQty('${item.productId}', 1)" 
              class="w-6 h-6 flex items-center justify-center text-gray-700 font-bold hover:bg-white rounded"
            >+</button>
          </div>

          <div class="text-right">
            <div class="text-xs font-extrabold text-gray-900">₹${lineDirect}</div>
            <button 
              onclick="AppState.removeFromCart('${item.productId}')"
              class="text-[11px] text-red-500 hover:text-red-700"
            >×</button>
          </div>
        </div>
      `;
    }).join('');

    const savings = subtotalMiddleman - subtotalDirect;
    updateCartTotals(subtotalDirect, subtotalMiddleman, savings);
  }

  function updateCartTotals(directTotal, middlemanTotal, savings) {
    const elSubtotal = document.getElementById("cart-subtotal");
    const elRetail = document.getElementById("cart-retail-comparison");
    const elSavings = document.getElementById("cart-savings-amount");
    const checkoutBtn = document.getElementById("cart-checkout-btn");

    if (elSubtotal) elSubtotal.innerText = `₹${directTotal.toLocaleString()}`;
    if (elRetail) elRetail.innerText = `₹${middlemanTotal.toLocaleString()}`;
    if (elSavings) elSavings.innerText = `₹${savings.toLocaleString()}`;

    if (checkoutBtn) {
      checkoutBtn.disabled = directTotal === 0;
      if (directTotal === 0) {
        checkoutBtn.classList.add("opacity-50", "cursor-not-allowed");
      } else {
        checkoutBtn.classList.remove("opacity-50", "cursor-not-allowed");
      }
    }
  }

  function setupCartListeners() {
    const cartBtn = document.getElementById("nav-cart-btn");
    const cartDrawer = document.getElementById("cart-drawer");
    const closeCartBtn = document.getElementById("close-cart-btn");
    const checkoutBtn = document.getElementById("cart-checkout-btn");

    if (cartBtn && cartDrawer) {
      cartBtn.addEventListener("click", () => {
        cartDrawer.classList.remove("hidden");
      });
    }

    if (closeCartBtn && cartDrawer) {
      closeCartBtn.addEventListener("click", () => {
        cartDrawer.classList.add("hidden");
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        cartDrawer.classList.add("hidden");
        openCheckoutModal();
      });
    }

    // Checkout form submit
    const checkoutForm = document.getElementById("direct-checkout-form");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        processDirectPayment();
      });
    }
  }

  function openCheckoutModal() {
    const modal = document.getElementById("checkout-modal");
    if (!modal || cart.length === 0) return;

    // Pick first item's farmer as primary recipient for direct settlement
    const firstItem = cart[0];
    const farmer = farmers.find(f => f.id === firstItem.farmerId) || farmers[0];

    const directTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const middlemanTotal = cart.reduce((sum, item) => sum + (item.middlemanPrice * item.qty), 0);
    const saved = middlemanTotal - directTotal;

    // Populate checkout fields
    document.getElementById("checkout-farmer-name").innerText = `${farmer.name} (${farmer.farmName})`;
    document.getElementById("checkout-farmer-upi").innerText = farmer.upiId;
    document.getElementById("checkout-farmer-bank").innerText = farmer.bankAccount;
    document.getElementById("checkout-direct-amount").innerText = `₹${directTotal.toLocaleString()}`;
    document.getElementById("checkout-retail-compare").innerText = `₹${middlemanTotal.toLocaleString()}`;
    document.getElementById("checkout-consumer-saved").innerText = `₹${saved.toLocaleString()}`;

    // Generate dynamic QR code image for direct UPI payment
    const qrContainer = document.getElementById("checkout-upi-qr");
    if (qrContainer) {
      const upiUrl = `upi://pay?pa=${farmer.upiId}&pn=${encodeURIComponent(farmer.name)}&am=${directTotal}&cu=INR&tn=DirectFarmHarvest`;
      qrContainer.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;
    }

    modal.classList.remove("hidden");
  }

  function processDirectPayment() {
    const name = document.getElementById("cust-name").value.trim();
    const phone = document.getElementById("cust-phone").value.trim();
    const address = document.getElementById("cust-address").value.trim();
    const paymentMode = document.querySelector('input[name="pay-method"]:checked')?.value || "Direct UPI";

    if (!name || !phone || !address) {
      showToast("Please fill in your delivery details.", "error");
      return;
    }

    const firstItem = cart[0];
    const farmer = farmers.find(f => f.id === firstItem.farmerId) || farmers[0];
    const directTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const middlemanTotal = cart.reduce((sum, item) => sum + (item.middlemanPrice * item.qty), 0);
    const saved = middlemanTotal - directTotal;

    const newOrder = {
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      consumerName: name,
      consumerPhone: phone,
      consumerAddress: address,
      farmerId: farmer.id,
      items: [...cart],
      totalAmount: directTotal,
      middlemanComparisonRetail: middlemanTotal,
      farmerDirectPayout: directTotal, // 100% direct!
      middlemanSaved: saved,
      paymentMethod: paymentMode,
      paymentStatus: `Settled directly to ${farmer.name} (${paymentMode})`,
      orderStatus: "Confirmed",
      date: "Just Now"
    };

    // Save order
    orders.unshift(newOrder);
    saveOrders(orders);

    // Update farmer statistics
    farmer.directEarnings += directTotal;
    farmer.middlemanSaved += saved;
    saveFarmers(farmers);

    // Clear cart & close checkout modal
    cart = [];
    saveCart(cart);
    document.getElementById("checkout-modal").classList.add("hidden");

    // Open Success confirmation receipt modal
    openSuccessReceipt(newOrder, farmer);
  }

  function openSuccessReceipt(order, farmer) {
    const modal = document.getElementById("success-receipt-modal");
    if (!modal) return;

    document.getElementById("rec-order-id").innerText = order.id;
    document.getElementById("rec-farmer-name").innerText = `${farmer.name} (${farmer.farmName})`;
    document.getElementById("rec-amount-paid").innerText = `₹${order.totalAmount.toLocaleString()}`;
    document.getElementById("rec-middleman-cut").innerText = "₹0.00 (100% directly paid to farmer)";
    document.getElementById("rec-savings").innerText = `₹${order.middlemanSaved.toLocaleString()}`;
    document.getElementById("rec-settlement").innerText = `Transferred directly to ${farmer.upiId}`;

    modal.classList.remove("hidden");
  }

  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const bgColor = type === "success" ? "bg-emerald-800 text-white" : type === "info" ? "bg-gray-800 text-white" : "bg-red-700 text-white";
    
    toast.className = `${bgColor} px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-xs font-semibold transform transition-all duration-300 opacity-0 translate-y-2 pointer-events-auto`;
    toast.innerHTML = `
      <span>${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove("opacity-0", "translate-y-2");
    });

    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  return {
    init,
    getProducts,
    saveProducts,
    getFarmers,
    saveFarmers,
    getOrders,
    saveOrders,
    getCart,
    addToCart,
    updateCartQty,
    removeFromCart,
    setRole,
    showToast
  };
})();

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  AppState.init();
});
