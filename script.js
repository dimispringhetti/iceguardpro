// Costanti Crioscopiche (MM/i*Kf) in (g * kg_acqua) / (mol * mol * °C)
const CRIOSCOPIA_NACL = 0.0157; 
const CRIOSCOPIA_CACL2 = 0.0199; 
// Proporzionalità, in g di acqua/ghiaccio per metro quadrato.
// 40 g/m² è un valore tipico di riferimento per strato di ghiaccio.
const C_ACQUA = 40; 

const calculateBtn = document.getElementById('calculateBtn');
const resultArea = document.getElementById('resultArea');
const roadLength = document.getElementById('roadLength');
const minTemp = document.getElementById('minTemp');
const humidity = document.getElementById('humidity');

const prezzoCaCl2 = 2; // Prezzo per kg
const prezzoNaCl = 0.30; // Prezzo per kg
const larghezzaMedia = 3; // Larghezza della strada in metri (m)

/**
 * Calcola la massa di Cloruro di Sodio (NaCl) necessaria basata sulla crioscopia.
 * @param {number} L - Lunghezza del percorso (in KM).
 * @param {number} T - Temperatura ambiente (in °C).
 * @param {number} U - Umidità (0-100).
 * @returns {number} Massa di NaCl in chilogrammi (kg).
 */
function calcNaCl(L, T, U) {
    // waterFactor: Aumenta la quantità di sale se l'umidità è alta (maggiore copertura di ghiaccio/acqua)
    const waterFactor = 1 + 2 * (U / 100); 

    // qNaCl_g_per_m2: Massa teorica di sale necessaria in g/m²
    // Formula: Fattore_Crioscopico * |T| * C_ACQUA * waterFactor
    const qNaCl_g_per_m2 = CRIOSCOPIA_NACL * Math.abs(T) * C_ACQUA * waterFactor; 

    // Massa Totale in kg: Area (m²) * Dosaggio (g/m²) / 1000
    // L è in KM, quindi (L * 1000) è l'area in m²
    const area_m2 = L * 1000 * larghezzaMedia;
    
    return (area_m2 * qNaCl_g_per_m2) / 1000; // in kg
}

/**
 * Calcola la massa di Cloruro di Calcio (CaCl2) necessaria basata sulla crioscopia.
 * @param {number} L - Lunghezza del percorso (in KM).
 * @param {number} T - Temperatura ambiente (in °C).
 * @param {number} U - Umidità (0-100).
 * @returns {number} Massa di CaCl2 in chilogrammi (kg).
 */
function calcCaCl2(L, T, U) {
    const waterFactor = 1 + 2 * (U / 100); 

    // qCaCl2_g_per_m2: Massa teorica di sale necessaria in g/m²
    // Formula: Fattore_Crioscopico * |T| * C_ACQUA * waterFactor
    const qCaCl2_g_per_m2 = CRIOSCOPIA_CACL2 * Math.abs(T) * C_ACQUA * waterFactor;

    // Massa Totale in kg: Area (m²) * Dosaggio (g/m²) / 1000
    // L è in KM, quindi (L * 1000) è l'area in m²
    const area_m2 = L * 1000 * larghezzaMedia;
    
    return (area_m2 * qCaCl2_g_per_m2) / 1000; // in kg
}


if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateResult);
}

function calculateResult() {

    let L_val = roadLength.value; // Lunghezza in KM
    let T_val = minTemp.value;
    let humidity_val = humidity.value;

    if (L_val.trim() === "" || T_val.trim() === "" || humidity_val.trim() === "") {
        resultArea.innerHTML = `
            <div class="alert alert-danger mb-0">⚠️ Inserisci tutti i valori.</div>`;
        return;
    }

    let L = parseFloat(L_val);
    let T = parseFloat(T_val);
    let U = parseFloat(humidity_val);

    if (isNaN(L) || isNaN(T) || isNaN(U)) {
        resultArea.innerHTML = `
            <div class="alert alert-danger mb-0">❌ Inserisci solo numeri validi.</div>`;
        return;
    }

    if (L < 0) {
        resultArea.innerHTML = `<div class="alert alert-danger mb-0">🛣️ Lunghezza non valida.</div>`;
        return;
    }

    if (U < 0 || U > 100) {
        resultArea.innerHTML = `<div class="alert alert-danger mb-0">💧 Umidità 0–100%.</div>`;
        return;
    }

    let output = "";

    if (T >= 0) {
        output = `
        <div class="alert alert-success mb-0">
            ✅ A ${T}°C non serve il sale.
        </div>`;
    }

    // Il Cloruro di Calcio (CaCl2) è efficace fino a -20°C / -25°C
    else if (T < -25) { 
        output = `
        <div class="alert alert-warning mb-0">
            🥶 A ${T}°C i sali non sono efficaci. Il punto di congelamento minimo del CaCl2 è circa -25°C.
        </div>`;
    }

    // Tra -7°C (limite inferiore di efficacia del NaCl) e -25°C
    else if (T < -7) { 
        const QCaCl2 = calcCaCl2(L, T, U);
        const costCaCl2 = QCaCl2 * prezzoCaCl2;

        output = `
        <div class="text-start w-100">
            <h5 class="mb-3 text-center">Opzione Consigliata per ${L} km a ${T}°C</h5>
            <ul class="list-group">
                <li class="list-group-item d-flex justify-content-between">
                    <div><strong>Cloruro di Calcio (CaCl2)</strong><br>
                    <small>${QCaCl2.toFixed(2)} kg</small></div>
                    <span class="badge bg-info fs-6">€${costCaCl2.toFixed(2)}</span>
                </li>
            </ul>
        </div>`;
    }

    // Tra 0°C e -7°C (dove entrambi i sali sono efficaci)
    else {
        const QNaCl = calcNaCl(L, T, U);
        const QCaCl2 = calcCaCl2(L, T, U);

        const costNaCl = QNaCl * prezzoNaCl;
        const costCaCl2 = QCaCl2 * prezzoCaCl2;

        output = `
        <div class="text-start w-100">
            <h5 class="mb-3 text-center">Opzioni per ${L} km a ${T}°C</h5>
            <ul class="list-group">

                <li class="list-group-item d-flex justify-content-between">
                    <div><strong>Cloruro di Sodio (NaCl)</strong><br>
                    <small>Quantità: ${QNaCl.toFixed(2)} kg</small></div>
                    <span class="badge bg-primary fs-6">€${costNaCl.toFixed(2)}</span>
                </li>

                <li class="list-group-item d-flex justify-content-between">
                    <div><strong>Cloruro di Calcio (CaCl2)</strong><br>
                    <small>Quantità: ${QCaCl2.toFixed(2)} kg</small></div>
                    <span class="badge bg-info fs-6">€${costCaCl2.toFixed(2)}</span>
                </li>

            </ul>
        </div>`;
    }

    resultArea.innerHTML = output;
}