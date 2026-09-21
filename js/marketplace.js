// Marketplace Module for Consumer Shopping & Discovery

const MarketplaceModule = (() => {
  let activeCategory = "All";
  let searchQuery = "";
  let currentSort = "popular";

  function init() {
    renderProducts();
    setupFilters();
  }

  function setupFilters() {
    // Search input
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderProducts();
      });
    }

    // Sort select
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        currentSort = e.target.value;
        renderProducts();
      });
    }
  }

  function setCategory(category) {
    activeCategory = category;
    
    // Update active pill button
    const pills = document.querySelectorAll(".category-pill");
    pills.forEach(pill => {
      if (pill.getAttribute("data-category") === category) {
        pill.classList.add("bg-emerald-600", "text-white", "shadow-sm");
        pill.classList.remove("bg-white", "text-gray-700", "hover:bg-gray-50");
      } else {
        pill.classList.remove("bg-emerald-600", "text-white", "shadow-sm");
        pill.classList.add("bg-white", "text-gray-700", "hover:bg-gray-50");
      }
    });

    renderProducts();
  }

  function getFilteredProducts() {
    const products = AppState.getProducts();
    const farmers = AppState.getFarmers();

    return products.filter(product => {
      // Category match
      const matchCategory = (activeCategory === "All") || 
        (activeCategory === "Organic" ? product.organic : product.category === activeCategory);
      
      // Search match (product name, description, category, or farmer name)
      const farmer = farmers.find(f => f.id === product.farmerId);
      const farmerName = farmer ? farmer.name.toLowerCase() : "";
      const farmName = farmer ? farmer.farmName.toLowerCase() : "";
      
      const matchSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery) ||
        farmerName.includes(searchQuery) ||
        farmName.includes(searchQuery);

      return matchCategory && matchSearch;
    }).sort((a, b) => {
      if (currentSort === "price-asc") return a.directPrice - b.directPrice;
      if (currentSort === "price-desc") return b.directPrice - a.directPrice;
      if (currentSort === "savings") {
        const savingsA = a.middlemanPrice - a.directPrice;
        const savingsB = b.middlemanPrice - b.directPrice;
        return savingsB - savingsA;
      }
      return 0; // Default popular
    });
  }

  function renderProducts() {
    const container = document.getElementById("products-grid");
    if (!container) return;

    const filtered = getFilteredProducts();
    const farmers = AppState.getFarmers();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900">No harvest found matching your criteria</h3>
          <p class="text-sm text-gray-500 mt-1">Try tweaking your search term or select another category.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(product => {
      const farmer = farmers.find(f => f.id === product.farmerId) || {
        name: "Local Farmer",
        farmName: "Direct Farm",
        location: "Local",
        rating: 4.9,
        avatar: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200"
      };

      const savings = product.middlemanPrice - product.directPrice;
      const savingsPct = Math.round((savings / product.middlemanPrice) * 100);
      const farmerExtra = product.directPrice - product.farmerMandiRate;

      return `
        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden smooth-hover flex flex-col justify-between group">
          <div>
            <!-- Image & Badges -->
            <div class="relative h-48 w-full overflow-hidden bg-gray-100">
              <img 
                src="${product.image}" 
                alt="${product.name}" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'"
              />
              <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                ${product.badge ? `
                  <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-600 text-white shadow-sm">
                    ${product.badge}
                  </span>
                ` : ''}
                ${product.organic ? `
                  <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <svg class="w-3 h-3 text-emerald-600 fill-current" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/></svg>
                    Organic
                  </span>
                ` : ''}
              </div>
              <div class="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span>${farmer.rating}</span>
              </div>
            </div>

            <!-- Content Area -->
            <div class="p-5">
              <!-- Farmer Info Pill -->
              <div 
                onclick="MarketplaceModule.openFarmerModal('${farmer.id}')"
                class="flex items-center gap-2.5 mb-3 p-1.5 pr-3 rounded-full hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100 cursor-pointer transition-colors w-fit"
                title="Click to view farm profile & certifications"
              >
                <img src="${farmer.avatar}" alt="${farmer.name}" class="w-6 h-6 rounded-full object-cover border border-emerald-300">
                <div class="text-xs">
                  <span class="font-semibold text-gray-800">${farmer.name}</span>
                  <span class="text-gray-400">·</span>
                  <span class="text-emerald-700 font-medium">${farmer.location}</span>
                </div>
              </div>

              <!-- Product Title -->
              <h3 class="font-bold text-gray-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                ${product.name}
              </h3>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2">${product.description}</p>
              
              <!-- Harvest Timestamp Tag -->
              <div class="mt-2.5 flex items-center gap-1.5 text-xs text-gray-500">
                <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Harvested: <strong class="text-gray-700">${product.harvestDate}</strong></span>
              </div>

              <!-- MIDDLEMAN COMPARISON BOX (Core Selling Proposition) -->
              <div class="mt-4 p-3 bg-gradient-to-br from-emerald-50/60 to-white rounded-xl border border-emerald-100">
                <div class="flex items-center justify-between mb-1 text-xs">
                  <span class="text-gray-500">Supermarket / Retail:</span>
                  <span class="middleman-strike font-medium">₹${product.middlemanPrice}/${product.unit}</span>
                </div>
                
                <div class="flex items-baseline justify-between">
                  <div>
                    <span class="text-xs font-semibold text-emerald-900 uppercase tracking-wider block">Farmer Direct:</span>
                    <span class="text-2xl font-extrabold text-emerald-700">₹${product.directPrice}</span>
                    <span class="text-xs text-gray-500 font-medium">/${product.unit}</span>
                  </div>
                  <span class="px-2 py-0.5 text-xs font-bold rounded-md bg-emerald-100 text-emerald-800">
                    Save ${savingsPct}%
                  </span>
                </div>

                <div class="mt-2 pt-2 border-t border-emerald-100/80 flex items-center justify-between text-[11px]">
                  <span class="text-emerald-800 font-medium flex items-center gap-1">
                    <svg class="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                    Farmer gets 100% (₹${product.directPrice})
                  </span>
                  <span class="text-gray-400 font-medium">(Mandi rate: ₹${product.farmerMandiRate})</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Add to Cart -->
          <div class="p-5 pt-0">
            <button 
              onclick="AppState.addToCart('${product.id}')"
              class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-98"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span>Add to Cart (Direct)</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function openFarmerModal(farmerId) {
    const farmer = AppState.getFarmers().find(f => f.id === farmerId);
    if (!farmer) return;

    const modal = document.getElementById("farmer-profile-modal");
    if (!modal) return;

    const farmerProducts = AppState.getProducts().filter(p => p.farmerId === farmerId);

    document.getElementById("fp-cover").src = farmer.coverImage;
    document.getElementById("fp-avatar").src = farmer.avatar;
    document.getElementById("fp-name").innerText = farmer.name;
    document.getElementById("fp-farmname").innerText = farmer.farmName;
    document.getElementById("fp-location").innerText = `${farmer.location} (${farmer.distance})`;
    document.getElementById("fp-farmingtype").innerText = farmer.farmingType;
    document.getElementById("fp-bio").innerText = farmer.bio;
    document.getElementById("fp-phone").innerText = farmer.phone;
    document.getElementById("fp-upi").innerText = farmer.upiId;
    document.getElementById("fp-bank").innerText = farmer.bankAccount;
    document.getElementById("fp-direct-earnings").innerText = `₹${farmer.directEarnings.toLocaleString()}`;
    document.getElementById("fp-middleman-saved").innerText = `₹${farmer.middlemanSaved.toLocaleString()}`;

    // Render this farmer's products inside modal
    const prodsContainer = document.getElementById("fp-products-list");
    if (prodsContainer) {
      prodsContainer.innerHTML = farmerProducts.map(p => `
        <div class="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50">
          <div class="flex items-center gap-3">
            <img src="${p.image}" alt="${p.name}" class="w-10 h-10 rounded-lg object-cover">
            <div>
              <div class="text-xs font-bold text-gray-900">${p.name}</div>
              <div class="text-[11px] text-gray-500">Fresh harvest · ${p.stock} ${p.unit} in stock</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs font-bold text-emerald-700">₹${p.directPrice} <span class="text-gray-400 font-normal">/${p.unit}</span></div>
            <button 
              onclick="AppState.addToCart('${p.id}'); document.getElementById('farmer-profile-modal').classList.add('hidden');"
              class="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 underline mt-0.5"
            >
              + Add
            </button>
          </div>
        </div>
      `).join('');
    }

    modal.classList.remove("hidden");
  }

  return {
    init,
    setCategory,
    renderProducts,
    openFarmerModal
  };
})();
