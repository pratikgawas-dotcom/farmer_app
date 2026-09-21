// Middleman Elimination Calculator Logic

const CalculatorModule = (() => {
  const CROPS_PRESETS = [
    { name: "Tomatoes (Heirloom)", farmerMandiRate: 14, directPrice: 28, middlemanPrice: 45, defaultQty: 50, unit: "kg" },
    { name: "Potatoes & Onions", farmerMandiRate: 12, directPrice: 24, middlemanPrice: 38, defaultQty: 100, unit: "kg" },
    { name: "Crisp Apples", farmerMandiRate: 55, directPrice: 110, middlemanPrice: 190, defaultQty: 40, unit: "kg" },
    { name: "Basmati Rice", farmerMandiRate: 46, directPrice: 84, middlemanPrice: 130, defaultQty: 100, unit: "kg" },
    { name: "Raw Honey", farmerMandiRate: 280, directPrice: 580, middlemanPrice: 960, defaultQty: 15, unit: "kg" }
  ];

  let selectedPreset = CROPS_PRESETS[0];
  let currentQuantity = selectedPreset.defaultQty;

  function init() {
    renderCalculatorPresets();
    updateCalculations();
    setupEventListeners();
  }

  function renderCalculatorPresets() {
    const container = document.getElementById("calc-preset-buttons");
    if (!container) return;

    container.innerHTML = CROPS_PRESETS.map((crop, idx) => `
      <button 
        onclick="CalculatorModule.selectPreset(${idx})"
        class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          crop.name === selectedPreset.name 
            ? 'bg-emerald-600 text-white shadow-sm' 
            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
        }"
      >
        ${crop.name}
      </button>
    `).join('');
  }

  function selectPreset(index) {
    selectedPreset = CROPS_PRESETS[index];
    currentQuantity = selectedPreset.defaultQty;
    
    const slider = document.getElementById("calc-quantity-slider");
    if (slider) {
      slider.value = currentQuantity;
      slider.max = selectedPreset.defaultQty * 5;
    }
    
    renderCalculatorPresets();
    updateCalculations();
  }

  function onQuantityChange(val) {
    currentQuantity = parseInt(val, 10);
    updateCalculations();
  }

  function updateCalculations() {
    const qty = currentQuantity;
    const unit = selectedPreset.unit;

    // Traditional supply chain math
    const traditionalFarmerGets = selectedPreset.farmerMandiRate * qty;
    const traditionalRetailTotal = selectedPreset.middlemanPrice * qty;
    const middlemanCutTaken = traditionalRetailTotal - traditionalFarmerGets;

    // Direct Farmer App math
    const directFarmerEarns = selectedPreset.directPrice * qty;
    const consumerPaysDirect = directFarmerEarns; // 0% cut taken, 100% to farmer
    const consumerSaved = traditionalRetailTotal - consumerPaysDirect;
    const farmerExtraEarned = directFarmerEarns - traditionalFarmerGets;
    const farmerIncomeIncreasePct = Math.round((farmerExtraEarned / traditionalFarmerGets) * 100);

    // Update UI elements
    const qtyDisplay = document.getElementById("calc-quantity-val");
    if (qtyDisplay) qtyDisplay.innerText = `${qty} ${unit}`;

    const farmerTraditional = document.getElementById("calc-farmer-traditional");
    if (farmerTraditional) farmerTraditional.innerText = `₹${traditionalFarmerGets.toLocaleString()}`;

    const middlemanCut = document.getElementById("calc-middleman-cut");
    if (middlemanCut) middlemanCut.innerText = `₹${middlemanCutTaken.toLocaleString()}`;

    const retailTotal = document.getElementById("calc-retail-total");
    if (retailTotal) retailTotal.innerText = `₹${traditionalRetailTotal.toLocaleString()}`;

    const farmerDirect = document.getElementById("calc-farmer-direct");
    if (farmerDirect) farmerDirect.innerText = `₹${directFarmerEarns.toLocaleString()}`;

    const farmerGain = document.getElementById("calc-farmer-gain");
    if (farmerGain) farmerGain.innerText = `+₹${farmerExtraEarned.toLocaleString()} (+${farmerIncomeIncreasePct}%)`;

    const consumerSavings = document.getElementById("calc-consumer-savings");
    if (consumerSavings) consumerSavings.innerText = `₹${consumerSaved.toLocaleString()}`;
  }

  function setupEventListeners() {
    const slider = document.getElementById("calc-quantity-slider");
    if (slider) {
      slider.addEventListener("input", (e) => onQuantityChange(e.target.value));
    }
  }

  return {
    init,
    selectPreset,
    onQuantityChange
  };
})();
