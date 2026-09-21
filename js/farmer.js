// Farmer Portal & Dashboard Module

const FarmerModule = (() => {
  // Current active logged-in farmer demo profile (Ramesh Patel)
  const ACTIVE_FARMER_ID = "f1";

  function init() {
    renderFarmerDashboard();
    setupHarvestForm();
  }

  function getActiveFarmer() {
    return AppState.getFarmers().find(f => f.id === ACTIVE_FARMER_ID) || AppState.getFarmers()[0];
  }

  function renderFarmerDashboard() {
    const farmer = getActiveFarmer();
    const products = AppState.getProducts().filter(p => p.farmerId === farmer.id);
    const orders = AppState.getOrders().filter(o => o.farmerId === farmer.id);

    // Update Header stats
    const totalEarnings = orders.reduce((sum, o) => sum + (o.farmerDirectPayout || 0), farmer.directEarnings);
    const middlemanSaved = orders.reduce((sum, o) => sum + (o.middlemanSaved || 0), farmer.middlemanSaved);

    const elEarnings = document.getElementById("farmer-total-earnings");
    if (elEarnings) elEarnings.innerText = `₹${totalEarnings.toLocaleString()}`;

    const elSaved = document.getElementById("farmer-commission-saved");
    if (elSaved) elSaved.innerText = `₹${middlemanSaved.toLocaleString()}`;

    const elActiveCrops = document.getElementById("farmer-active-crops-count");
    if (elActiveCrops) elActiveCrops.innerText = products.length;

    const elOrdersCount = document.getElementById("farmer-orders-count");
    if (elOrdersCount) elOrdersCount.innerText = orders.length;

    // Direct Payout Credentials Box
    const elUpi = document.getElementById("farmer-payout-upi");
    if (elUpi) elUpi.value = farmer.upiId;

    const elBank = document.getElementById("farmer-payout-bank");
    if (elBank) elBank.value = farmer.bankAccount;

    // Render Farmer Crops Table
    renderCropsTable(products);

    // Render Farmer Incoming Direct Orders
    renderOrdersList(orders);
  }

  function renderCropsTable(products) {
    const container = document.getElementById("farmer-crops-tbody");
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500">
            You haven't listed any harvest yet. Click "Add New Harvest" to post crops directly to consumers!
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = products.map(product => {
      const extraProfit = product.directPrice - product.farmerMandiRate;

      return `
        <tr class="hover:bg-gray-50/80 border-b border-gray-100 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center gap-3">
              <img src="${product.image}" alt="${product.name}" class="w-10 h-10 rounded-lg object-cover border border-gray-200" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'">
              <div>
                <div class="text-sm font-semibold text-gray-900">${product.name}</div>
                <div class="text-xs text-gray-500">${product.category} · ${product.harvestDate}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="text-sm font-bold text-emerald-700">₹${product.directPrice}</span>
            <span class="text-xs text-gray-500">/${product.unit}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-xs text-gray-500 line-through">₹${product.farmerMandiRate}/${product.unit}</div>
            <div class="text-xs font-semibold text-emerald-600">+₹${extraProfit} direct extra</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2.5 py-1 text-xs font-medium rounded-full ${product.stock > 20 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">
              ${product.stock} ${product.unit}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-xs">
            ${product.organic ? `
              <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">Organic</span>
            ` : `<span class="text-gray-400">Standard</span>`}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-xs">
            <button 
              onclick="FarmerModule.deleteProduct('${product.id}')"
              class="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderOrdersList(orders) {
    const container = document.getElementById("farmer-orders-list");
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-sm text-gray-500 bg-white rounded-xl border border-gray-200">
          No consumer orders received yet. Once customers purchase your harvest, orders and direct payment settlement details will appear here.
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => {
      const itemsList = (order.items || []).map(i => `${i.qty} ${i.unit || 'unit'} of ${i.name}`).join(', ');

      return `
        <div class="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1.5 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-gray-900 text-sm">${order.id}</span>
              <span class="text-xs text-gray-400">·</span>
              <span class="text-xs text-gray-500">${order.date}</span>
              <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                order.orderStatus === 'Dispatched' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }">
                ${order.orderStatus}
              </span>
            </div>

            <div class="text-sm font-medium text-gray-800">
              Customer: <span class="font-bold text-gray-900">${order.consumerName}</span> 
              <span class="text-xs text-gray-500">(${order.consumerPhone})</span>
            </div>
            
            <div class="text-xs text-gray-600">
              <span class="font-medium text-gray-700">Delivery Address:</span> ${order.consumerAddress}
            </div>

            <div class="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
              <span class="font-semibold text-gray-700">Items:</span> ${itemsList}
            </div>
          </div>

          <!-- Direct Payment Settlement Tag -->
          <div class="flex flex-col items-start md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 min-w-[220px]">
            <div class="text-left md:text-right">
              <span class="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">Direct Payout Received</span>
              <div class="text-xl font-extrabold text-emerald-700">₹${order.farmerDirectPayout}</div>
              <div class="text-[11px] text-emerald-600 font-medium flex items-center gap-1 md:justify-end">
                <svg class="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                100% directly settled (₹0 commission)
              </div>
            </div>

            <!-- Change Order Status Dropdown -->
            <div class="flex items-center gap-2">
              <label class="text-xs text-gray-500 font-medium">Status:</label>
              <select 
                onchange="FarmerModule.updateOrderStatus('${order.id}', this.value)"
                class="text-xs font-semibold bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1 text-gray-700 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Confirmed" ${order.orderStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="Dispatched" ${order.orderStatus === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
                <option value="Delivered" ${order.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function updateOrderStatus(orderId, newStatus) {
    const orders = AppState.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.orderStatus = newStatus;
      AppState.saveOrders(orders);
      renderFarmerDashboard();
      AppState.showToast(`Order ${orderId} updated to ${newStatus}!`, "success");
    }
  }

  function deleteProduct(productId) {
    if (!confirm("Are you sure you want to remove this harvest listing?")) return;
    
    let products = AppState.getProducts().filter(p => p.id !== productId);
    AppState.saveProducts(products);
    renderFarmerDashboard();
    MarketplaceModule.renderProducts();
    AppState.showToast("Harvest listing removed successfully", "info");
  }

  function setupHarvestForm() {
    const form = document.getElementById("add-harvest-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const farmer = getActiveFarmer();
      const name = document.getElementById("harvest-name").value.trim();
      const category = document.getElementById("harvest-category").value;
      const unit = document.getElementById("harvest-unit").value.trim();
      const directPrice = parseFloat(document.getElementById("harvest-price").value);
      const mandiRate = parseFloat(document.getElementById("harvest-mandi-rate").value) || Math.round(directPrice * 0.5);
      const retailPrice = parseFloat(document.getElementById("harvest-retail-price").value) || Math.round(directPrice * 1.5);
      const stock = parseInt(document.getElementById("harvest-stock").value, 10);
      const harvestDate = document.getElementById("harvest-date").value.trim() || "Fresh Today";
      const image = document.getElementById("harvest-image").value.trim() || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600";
      const description = document.getElementById("harvest-desc").value.trim() || "Fresh harvest straight from our farm.";
      const organic = document.getElementById("harvest-organic").checked;

      const newProduct = {
        id: "p_" + Date.now(),
        farmerId: farmer.id,
        name,
        category,
        unit,
        directPrice,
        middlemanPrice: retailPrice,
        farmerMandiRate: mandiRate,
        stock,
        image,
        harvestDate,
        organic,
        description,
        shelfLife: "5-7 days",
        badge: "New Direct Listing"
      };

      const products = AppState.getProducts();
      products.unshift(newProduct);
      AppState.saveProducts(products);

      // Reset & close modal
      form.reset();
      document.getElementById("add-harvest-modal").classList.add("hidden");

      renderFarmerDashboard();
      MarketplaceModule.renderProducts();
      AppState.showToast(`🎉 "${name}" published directly to consumers!`, "success");
    });
  }

  function savePayoutSettings() {
    const upi = document.getElementById("farmer-payout-upi").value.trim();
    const bank = document.getElementById("farmer-payout-bank").value.trim();

    const farmers = AppState.getFarmers();
    const farmer = farmers.find(f => f.id === ACTIVE_FARMER_ID);
    if (farmer) {
      farmer.upiId = upi;
      farmer.bankAccount = bank;
      AppState.saveFarmers(farmers);
      AppState.showToast("Direct payment receiving credentials updated!", "success");
    }
  }

  return {
    init,
    getActiveFarmer,
    renderFarmerDashboard,
    updateOrderStatus,
    deleteProduct,
    savePayoutSettings
  };
})();
