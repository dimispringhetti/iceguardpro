const calculateBtn = document.getElementById('calculateBtn');
const resultArea = document.getElementById('resultArea');
const roadLength = document.getElementById('roadLength');
const minTemp = document.getElementById('minTemp');
const humidity = document.getElementById('humidity');

const prezzoCaCl2 = 2;
const prezzoNaCl = 0.30;
const larghezzaMedia = 3;

function calcNaCl() {
    // area = K * L  (conversione g -> kg incorporata)
    const K = roadLength;
    const L = larghezzaMedia;

    // fattore acqua: (1 + 4 * humidity/100)
    const waterFactor = 1 + 4 * (humidity / 100);

    // qNaCl per m² (in g/m²) = 1.57 * |T| * (1 + 4*U/100)
    const qNaCl = 1.57 * Math.abs(minTemp) * waterFactor;

    // massa totale (kg)
    const totalNaCl = K * L * qNaCl;

    return totalNaCl;
}

function calcCaCl2() {
    const K = roadLength;
    const L = larghezzaMedia;

    const waterFactor = 1 + 4 * (humidity / 100);

    // qCaCl2 per m² (in g/m²) = 1.99 * |T| * (1 + 4*U/100)
    const qCaCl2 = 1.99 * Math.abs(minTemp) * waterFactor;

    // massa totale (kg)
    const totalCaCl2 = K * L * qCaCl2;

    return totalCaCl2;
}


// Aggiungiamo l'evento al bottone
if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateResult);
}

function calculateResult() {
    // Recupera i valori di input (come stringhe)
    let L_val = roadLength.value;
    let T_val = minTemp.value;
    let humidity_val = humidity.value;

    // --- Validazione Input (con alert Bootstrap) ---
    if (L_val.trim() === "" || T_val.trim() === "" || humidity_val.trim() === "") {
        resultArea.innerHTML = `
            <div class="alert alert-danger mb-0" role="alert">
                <strong>Errore:</strong> Inserisci tutti i valori.
            </div>`;
        return;
    }

    let L = parseFloat(L_val);
    let T = parseFloat(T_val);

    if (isNaN(L) || isNaN(T) || isNaN(parseFloat(humidity_val))) {
        resultArea.innerHTML = `
            <div class="alert alert-danger mb-0" role="alert">
                <strong>Errore:</strong> Inserisci solo numeri validi.
            </div>`;
        return;
    }

    if (L < 0) {
        resultArea.innerHTML = `
            <div class="alert alert-danger mb-0" role="alert">
                <strong>Errore:</strong> La lunghezza non può essere un numero negativo.
            </div>`;
        return;
    }
    if (humidity_val < 0 || humidity_val > 100) {
        resultArea.innerHTML = `
            <div class="alert alert-danger mb-0" role="alert">
                <strong>Errore:</strong> L'umidità deve essere compresa tra 0 e 100%.
            </div>`;
        return;
    }

    // Variabile per l'output HTML
    let output = "";

    // Temperatura >= 0
    if (T >= 0) {
        output = `
            <div class="alert alert-success mb-0" role="alert">
                <h5 class="alert-heading">Tutto OK!</h5>
                <p class="mb-0">Con una temperatura di <strong>${T}°C</strong> non è necessaria l'applicazione di sale.</p>
            </div>
        `;

        //  Temperatura < -20 (Sali inefficaci) LIM TEO -51
    } else if (T < -20) {
        output = `
            <div class="alert alert-warning mb-0" role="alert">
                <h5 class="alert-heading">Attenzione!</h5>
                <p class="mb-0">A una temperatura di <strong>${T}°C</strong>, né il Cloruro di Sodio né il Cloruro di Calcio sono efficaci. Considera metodi alternativi per la gestione del ghiaccio.</p>
            </div>
        `;
        // Temperatura < -7 (Solo CaCl2) LIM TEO -21
    } else if (T < -7) {
        const QCaCl2 = calcCaCl2();
        let costCaCl2 = QCaCl2 * prezzoCaCl2;

        // Uso dello stile "list-group" anche per il caso singolo
        output = `
            <div class="text-start w-100">
                <h5 class="mb-3 text-center">Opzione Consigliata per ${L} km a ${T}°C</h5>
                
                <p class="text-center text-body-secondary mb-3" style="font-size: 0.9rem;">
                    A questa temperatura bassa, solo il Cloruro di Calcio è efficace.
                </p>
                
                <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong class="text-info">Cloruro di Calcio (CaCl2)</strong><br>
                            <small>Quantità: ${QCaCl2.toFixed(2)} kg</small>
                        </div>
                        <span class="badge bg-info rounded-pill fs-6">€${costCaCl2.toFixed(2)}</span>
                    </li>
                </ul>
            </div>
        `;

        // CASO 3: Temperatura tra 0 e -5 (Entrambe le opzioni)
    } else {
        let QNaCl = calcNaCl;
        let costNaCl = QNaCl * prezzoNaCl;

        let QCaCl2 = calcCaCl2;
        let costCaCl2 = QCaCl2 * prezzoCaCl2;

        // Stile "list-group" per opzioni multiple
        output = `
            <div class="text-start w-100">
                <h5 class="mb-3 text-center">Opzioni per ${L} km a ${T}°C</h5>
                <ul class="list-group">
                    
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong class="text-primary">Opzione 1: Cloruro di Sodio (NaCl)</strong><br>
                            <small>Quantità: ${QNaCl.toFixed(2)} kg</small>
                        </div>
                        <span class="badge bg-primary rounded-pill fs-6">€${costNaCl.toFixed(2)}</span>
                    </li>
                    
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong class="text-info">Opzione 2: Cloruro di Calcio (CaCl2)</strong><br>
                            <small>Quantità: ${QCaCl2.toFixed(2)} kg</small>
                        </div>
                        <span class="badge bg-info rounded-pill fs-6">€${costCaCl2.toFixed(2)}</span>
                    </li>

                </ul>
            </div>
        `;
    }

    // Aggiorna l'area dei risultati nell'HTML
    resultArea.innerHTML = output;

    // (Opzionale) Stampa in console per debugging
    console.log(`Stima effettuata per T=${T} e L=${L}`);
}


// Funzione di utilità (non modificata)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
console.log("App ID (da script.js):", appId);