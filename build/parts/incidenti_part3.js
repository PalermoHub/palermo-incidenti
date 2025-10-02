// ==========================================
// PARTE 3: PANNELLO DETTAGLI E POPUP
// ==========================================

// Open Detail Panel (AGGIORNATO CON FONT AWESOME)
function openDetailPanel(properties) {
    const panel = document.getElementById('detail-panel');
    const content = document.getElementById('detail-content');
    
    if (!panel || !content) return;
    
    const tipoIcon = document.getElementById('detail-tipo-icon');
    const subtitle = document.getElementById('detail-subtitle');
    
    if (tipoIcon) tipoIcon.innerHTML = tipologiaIcons[properties.Tipologia] || '<i class="fas fa-car"></i>';
    if (subtitle) subtitle.textContent = `Incidente del ${properties.Data || 'Data non disponibile'}`;
    
    let html = '';
    
    // Sezione Tipologia e Gravità (ICONA AGGIORNATA)
    html += `
        <div class="detail-section">
            <h3><i class="fas fa-exclamation-triangle"></i> Tipologia e Gravità</h3>
            <div class="detail-row">
                <span class="detail-label">Tipo Incidente</span>
                <span class="tipo-badge ${properties.Tipologia}">${properties.Tipologia} - ${tipologiaNames[properties.Tipologia]}</span>
            </div>
        </div>
    `;
    
    // Sezione Quando (ICONA AGGIORNATA)
    html += '<div class="detail-section"><h3><i class="fas fa-calendar-alt"></i> Quando è Avvenuto</h3>';
    const temporalFields = [
        { key: 'Data', label: 'Data' },
        { key: 'Anno', label: 'Anno' },
        { key: 'Stagione', label: 'Stagione' },
        { key: 'Mese', label: 'Mese' },
        { key: 'Giorno settimana', label: 'Giorno Settimana' },
        { key: 'Feriale/Weekend', label: 'Tipo Giorno' },
        { key: 'Giorno/Notte', label: 'Momento' },
        { key: 'Fascia oraria (4 fasce)', label: 'Fascia Oraria' },
        { key: 'Fascia oraria dettagliata (6 fasce)', label: 'Fascia Dettagliata' },
        { key: 'Ora di punta (Picchi di traffico)', label: 'Ora di Punta' }
    ];
    
    temporalFields.forEach(field => {
        if (properties[field.key] && properties[field.key] !== 'null') {
            html += `
                <div class="detail-row">
                    <span class="detail-label">${field.label}</span>
                    <span class="detail-value">${properties[field.key]}</span>
                </div>
            `;
        }
    });
    html += '</div>';
    
    // Sezione Dove (ICONA AGGIORNATA)
    html += '<div class="detail-section"><h3><i class="fas fa-map-marker-alt"></i> Dove è Avvenuto</h3>';
    const locationFields = [
        { key: 'Circoscrizione', label: 'Circoscrizione' },
        { key: 'Quartiere', label: 'Quartiere' },
        { key: 'UPL', label: 'Unità di Primo Livello' }
    ];
    
    locationFields.forEach(field => {
        if (properties[field.key] && properties[field.key] !== 'null') {
            html += `
                <div class="detail-row">
                    <span class="detail-label">${field.label}</span>
                    <span class="detail-value">${properties[field.key]}</span>
                </div>
            `;
        }
    });
    
    if (properties.latitude && properties.longitude) {
        html += `
            <div class="detail-row">
                <span class="detail-label">Coordinate GPS</span>
                <div style="flex: 1; text-align: right;">
                    <div class="coordinates-box">
                        Lat: ${parseFloat(properties.latitude).toFixed(6)}<br>
                        Lng: ${parseFloat(properties.longitude).toFixed(6)}
                    </div>
                </div>
            </div>
        `;
    }
    html += '</div>';
    
    // Sezione Condizioni Ambientali (ICONA AGGIORNATA)
    html += '<div class="detail-section"><h3><i class="fas fa-cloud-sun"></i> Condizioni Ambientali</h3>';
    if (properties['Condizioni luce (Visibilità)'] && properties['Condizioni luce (Visibilità)'] !== 'null') {
        html += `
            <div class="detail-row">
                <span class="detail-label">Condizioni Luce</span>
                <span class="detail-value">${properties['Condizioni luce (Visibilità)']}</span>
            </div>
        `;
    }
    html += '</div>';
    
    content.innerHTML = html;
    panel.classList.add('open');
}

function closeDetailPanel() {
    const panel = document.getElementById('detail-panel');
    if (panel) panel.classList.remove('open');
}

// Show 2019 Info Popup (ICONA AGGIORNATA)
function show2019InfoPopup() {
    const existingPopup = document.getElementById('popup-2019');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    const popup = document.createElement('div');
    popup.id = 'popup-2019';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        z-index: 10000;
        max-width: 500px;
        border: 2px solid #3b82f6;
    `;
    
    // ICONA AGGIORNATA
    popup.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;"><i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i></div>
            <h3 style="color: #3b82f6; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">
                Anno 2019 - Dati Parziali
            </h3>
            <p style="color: #cbd5e1; margin: 0 0 16px 0; font-size: 14px; line-height: 1.6;">
                Il <strong style="color: #f1f5f9;">2019</strong> include <strong style="color: #3b82f6;">3.192 incidenti non mappati</strong> 
                perché nel dataset non erano presenti le coordinate geografiche.
            </p>
            <p style="color: #94a3b8; margin: 0 0 20px 0; font-size: 13px; font-style: italic;">
                Questi incidenti sono conteggiati nelle statistiche ma non visualizzati sulla mappa.
            </p>
            <button onclick="document.getElementById('popup-2019').remove(); document.getElementById('popup-overlay-2019').remove();" 
                    style="
                        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                        color: white;
                        border: none;
                        padding: 12px 32px;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 700;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(59,130,246,0.4)';"
                    onmouseout="this.style.transform=''; this.style.boxShadow='';">
                Ho capito
            </button>
        </div>
    `;
    
    const overlay = document.createElement('div');
    overlay.id = 'popup-overlay-2019';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9999;
    `;
    overlay.onclick = () => {
        popup.remove();
        overlay.remove();
    };
    
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
}

// Open Top Luoghi Modal (ICONA AGGIORNATA)
function openTopLuoghiModal() {
    const modal = document.getElementById('top-luoghi-modal');
    const tbody = document.getElementById('top-luoghi-body');
    const countEl = document.getElementById('top-luoghi-count');
    
    if (!modal || !tbody) return;
    
    if (countEl) {
        countEl.textContent = topLuoghiData.length;
    }
    
    const activeFilters = Object.entries(currentFilters)
        .filter(([key, value]) => value && value !== '')
        .map(([key, value]) => {
            const label = filterConfig[key] || key;
            return `${label}: ${value}`;
        });
    
    const existingFilters = modal.querySelector('.filters-info-top');
    if (existingFilters) existingFilters.remove();
    
    if (activeFilters.length > 0) {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.insertAdjacentHTML('afterbegin', `
                <div class="filters-info-top" style="margin-bottom: 16px; padding: 12px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; border-radius: 6px;">
                    <strong style="color: #60a5fa;">Filtri applicati:</strong><br>
                    <span style="color: #cbd5e1; font-size: 13px;">${activeFilters.join(' • ')}</span>
                </div>
            `);
        }
    }
    
    let html = '';
    topLuoghiData.forEach((item, index) => {
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'rank-1';
        else if (rank === 2) rankClass = 'rank-2';
        else if (rank === 3) rankClass = 'rank-3';
        
        // ICONA AGGIORNATA per il pulsante visualizza
        html += `
            <tr>
                <td style="text-align: center;">
                    <span class="rank-badge ${rankClass}">${rank}</span>
                </td>
                <td style="font-weight: 600; color: #f1f5f9;">${item.indirizzo}</td>
                <td style="text-align: center; font-weight: 700; color: #3b82f6; font-size: 16px;">
                    ${item.total}
                </td>
                <td style="text-align: center;">
                    <span class="tipo-count" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;">
                        ${item.M}
                    </span>
                </td>
                <td style="text-align: center;">
                    <span class="tipo-count" style="background: rgba(168, 85, 247, 0.2); color: #a855f7;">
                        ${item.R}
                    </span>
                </td>
                <td style="text-align: center;">
                    <span class="tipo-count" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b;">
                        ${item.F}
                    </span>
                </td>
                <td style="text-align: center;">
                    <span class="tipo-count" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">
                        ${item.C}
                    </span>
                </td>
                <td style="text-align: center;">
                    <button class="btn-zoom-location" onclick="zoomToLocation(${item.coordinates[0]}, ${item.coordinates[1]})">
                        <i class="fas fa-search-location"></i> Visualizza
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    modal.classList.add('show');
}

function closeTopLuoghiModal() {
    const modal = document.getElementById('top-luoghi-modal');
    if (modal) modal.classList.remove('show');
}
