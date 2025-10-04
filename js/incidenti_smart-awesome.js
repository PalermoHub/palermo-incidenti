// ==========================================
// INCIDENTI PALERMO - DASHBOARD INTERATTIVA
// File JavaScript Completo con Icone Font Awesome
// Versione: 2.0 - Font Awesome Edition
// Build: 2025-10-02T19:29:13Z
// ==========================================


// ==========================================
// PARTE 1 - incidenti_part1
// ==========================================

// ==========================================
// PARTE 1: VARIABILI GLOBALI E CONFIGURAZIONI
// ==========================================

// Global Variables
let map;
let allIncidenti = [];
let currentFilters = {};
let showHeatmap = false;
let analyticsCharts = {};
let monthlyInjuriesChart = null;
let showClustering = false;
let topLuoghiData = [];
let monthlyAreaChart = null;

// Calendario Custom - Variabili Globali
let customCalendarState = {
    currentYear: 2023,
    selectedYear: null,
    selectedMonth: null,
    selectedWeekday: null,
    selectedDay: null
};

const MESI_ITALIANI = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const GIORNI_SETTIMANA = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const GIORNI_SETTIMANA_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

// Register Chart.js plugins globally
Chart.register(ChartDataLabels);

// Unregister datalabels by default
Chart.defaults.set('plugins.datalabels', {
    display: false
});

// Color Map per tipologie (invariato)
const colorMap = {
    'M': '#ef4444',  // Rosso - Mortale
    'R': '#a855f7',  // Viola - Riserva  
    'F': '#f59e0b',  // Ambra - Feriti
    'C': '#10b981'   // Verde - Cose
};

// Icone Font Awesome per tipologie (AGGIORNATO)
const tipologiaIcons = {
    'M': '<i class="fas fa-skull"></i>',           // Mortale
    'R': '<i class="fas fa-ambulance"></i>',       // Riserva
    'F': '<i class="fas fa-user-injured"></i>',    // Feriti
    'C': '<i class="fas fa-car-crash"></i>'        // Cose
};

// Nomi tipologie
const tipologiaNames = {
    'M': 'Mortale',
    'R': 'Riserva',
    'F': 'Feriti',
    'C': 'Cose'
};

// Basemap styles (invariato)
const basemapStyles = {
    'carto-dark': {
        version: 8,
        glyphs: 'https://api.mapbox.com/fonts/v1/mapbox/{fontstack}/{range}.pbf?access_token=eyJ1IjoiZ2J2aXRyYW5vIiwiYSI6ImNtNWpwMDloejBtN3ozM3F3NzJvZGh2ZG4ifQ.AXXkYYL7XY6RBVXpJ2IrBA',  // AGGIUNTO
        sources: {
            'carto': {
                type: 'raster',
                tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© CARTO | <a href="https://www.dati.gov.it/view-dataset?Cerca=incidenti+palermo" target="_blank">Fonte Dati: dati.gov.it</a> - Rielaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank">@gbvitrano</a> - <a href="http://opendatasicilia.it/" target="_blank">opendatasicilia.it</a>'
            }
        },
        layers: [{
            id: 'carto',
            type: 'raster',
            source: 'carto'
        }]
    },
    'osm': {
        version: 8,
        glyphs: 'https://api.mapbox.com/fonts/v1/mapbox/{fontstack}/{range}.pbf?access_token=eyJ1IjoiZ2J2aXRyYW5vIiwiYSI6ImNtNWpwMDloejBtN3ozM3F3NzJvZGh2ZG4ifQ.AXXkYYL7XY6RBVXpJ2IrBA',  // AGGIUNTO
        sources: {
            'osm': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors | <a href="https://www.dati.gov.it/view-dataset?Cerca=incidenti+palermo" target="_blank">Fonte Dati: dati.gov.it</a> - Rielaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank">@gbvitrano</a> - <a href="http://opendatasicilia.it/" target="_blank">opendatasicilia.it</a>'
            }
        },
        layers: [{
            id: 'osm',
            type: 'raster',
            source: 'osm'
        }]
    },
    'satellite': {
        version: 8,
        glyphs: 'https://api.mapbox.com/fonts/v1/mapbox/{fontstack}/{range}.pbf?access_token=eyJ1IjoiZ2J2aXRyYW5vIiwiYSI6ImNtNWpwMDloejBtN3ozM3F3NzJvZGh2ZG4ifQ.AXXkYYL7XY6RBVXpJ2IrBA',  // AGGIUNTO
        sources: {
            'satellite': {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
                tileSize: 256,
                attribution: '© Google | <a href="https://www.dati.gov.it/view-dataset?Cerca=incidenti+palermo" target="_blank">Fonte Dati: dati.gov.it</a> - Rielaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank">@gbvitrano</a> - <a href="http://opendatasicilia.it/" target="_blank">opendatasicilia.it</a>'
            }
        },
        layers: [{
            id: 'satellite',
            type: 'raster',
            source: 'satellite'
        }]
    },
    'carto-light': {
        version: 8,
        glyphs: 'https://api.mapbox.com/fonts/v1/mapbox/{fontstack}/{range}.pbf?access_token=eyJ1IjoiZ2J2aXRyYW5vIiwiYSI6ImNtNWpwMDloejBtN3ozM3F3NzJvZGh2ZG4ifQ.AXXkYYL7XY6RBVXpJ2IrBA',  // AGGIUNTO
        sources: {
            'carto': {
                type: 'raster',
                tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© CARTO | <a href="https://www.dati.gov.it/view-dataset?Cerca=incidenti+palermo" target="_blank">Fonte Dati: dati.gov.it</a> - Rielaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank">@gbvitrano</a> - <a href="http://opendatasicilia.it/" target="_blank">opendatasicilia.it</a>'
            }
        },
        layers: [{
            id: 'carto',
            type: 'raster',
            source: 'carto'
        }]
    }
};

const filterConfig = {
    'filter-tipologia': 'Tipologia',
    'filter-circoscrizione': 'Circoscrizione',
    'filter-quartiere': 'Quartiere',
    'filter-upl': 'UPL',
    'filter-anno': 'Anno',
    'filter-stagione': 'Stagione',
    'filter-mese': 'Mese',
    'filter-giorno-settimana': 'Giorno settimana',
    'filter-feriale-weekend': 'Feriale/Weekend',
    'filter-giorno-notte': 'Giorno/Notte',
    'filter-condizioni-luce': 'Condizioni luce (Visibilità)',
    'filter-fascia-4': 'Fascia oraria (4 fasce)',
    'filter-fascia-6': 'Fascia oraria dettagliata (6 fasce)',
    'filter-ora-punta': 'Ora di punta (Picchi di traffico)'
};

const filterDependencies = {
    'filter-circoscrizione': ['filter-quartiere', 'filter-upl'],
    'filter-quartiere': ['filter-upl']
};

// ==========================================
// PARTE 2 - incidenti_part2
// ==========================================

// ==========================================
// PARTE 2: INIZIALIZZAZIONE E TOGGLE FUNZIONI
// ==========================================

// Initialization
async function init() {
    try {
        console.log('Inizio caricamento CSV...');
        document.getElementById('loading').innerHTML = '<div>Caricamento CSV...</div><small>Download in corso</small>';
        
        await loadCSV();
        
        console.log('CSV caricato, inizializzazione mappa...');
        document.getElementById('loading').innerHTML = '<div>Creazione mappa...</div><small>Attendere</small>';
        
        initMap();
        initCustomCalendar();
        setupEventListeners();

    } catch (error) {
        console.error('Errore inizializzazione:', error);
        document.getElementById('loading').innerHTML = '<div>Errore caricamento</div><small>' + error.message + '</small>';
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
        }, 2000);
    }
}

// CSV Loading
async function loadCSV() {
    return new Promise((resolve, reject) => {
        Papa.parse('data/incidenti_2015_2023.csv', {
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function(results) {
                console.log('CSV scaricato, parsing righe...');
                
                allIncidenti = results.data.filter(row => {
                    return row.Tipologia && 
                           row.longitude && 
                           row.latitude &&
                           !isNaN(parseFloat(row.longitude)) &&
                           !isNaN(parseFloat(row.latitude));
                });
                
                console.log(`CSV processato: ${allIncidenti.length} incidenti validi`);
                resolve();
            },
            error: function(error) {
                console.error('Errore download CSV:', error);
                reject(error);
            }
        });
    });
}

// Toggle Heatmap (AGGIORNATO CON FONT AWESOME)
function toggleHeatmap() {
    showHeatmap = !showHeatmap;
    const btn = document.getElementById('btn-toggle-heatmap');
    const btnMap = document.getElementById('btn-heatmap-map');
    
    if (showHeatmap) {
        map.setLayoutProperty('incidenti-heatmap', 'visibility', 'visible');
        ['C', 'F', 'R', 'M'].forEach(tipo => {
            map.setLayoutProperty(`incidenti-${tipo}`, 'visibility', 'none');
        });
        if (btn) {
            btn.innerHTML = '<i class="fas fa-map"></i> Localizzazione incidenti';
            btn.classList.add('active');
        }
        if (btnMap) {
            btnMap.innerHTML = '<i class="fas fa-map"></i> Mappa di localizzazione';
            btnMap.classList.add('active');
        }
        const analyticsPanel = document.getElementById('analytics-side-panel');
        const heatmapLegend = document.getElementById('heatmap-legend');
        if (pointsLegend) pointsLegend.classList.add('hidden');
        if (heatmapLegend) heatmapLegend.classList.remove('hidden');
    } else {
        map.setLayoutProperty('incidenti-heatmap', 'visibility', 'none');
        ['C', 'F', 'R', 'M'].forEach(tipo => {
            map.setLayoutProperty(`incidenti-${tipo}`, 'visibility', 'visible');
        });
        if (btn) {
            btn.innerHTML = '<i class="fas fa-fire"></i> Heatmap';
            btn.classList.remove('active');
        }
        if (btnMap) {
            btnMap.innerHTML = '<i class="fas fa-fire"></i> Heatmap';
            btnMap.classList.remove('active');
        }
        const analyticsPanel = document.getElementById('analytics-side-panel');
        const heatmapLegend = document.getElementById('heatmap-legend');
        if (pointsLegend) pointsLegend.classList.remove('hidden');
        if (heatmapLegend) heatmapLegend.classList.add('hidden');
    }
}

// Toggle Clustering (AGGIORNATO CON FONT AWESOME)
function toggleClustering() {
    showClustering = !showClustering;
    const btn = document.getElementById('btn-clustering-map');
    const btnTopLuoghi = document.getElementById('btn-top-luoghi-map');
    
    if (showClustering) {
        if (showHeatmap) {
            toggleHeatmap();
        }
        
        ['C', 'F', 'R', 'M'].forEach(tipo => {
            if (map.getLayer(`incidenti-${tipo}`)) {
                map.setLayoutProperty(`incidenti-${tipo}`, 'visibility', 'none');
            }
        });
        
        createClusteringLayers();
        
        if (btn) {
            btn.innerHTML = '<i class="fas fa-map"></i> <span>Localizzazione</span>';
            btn.classList.add('active');
        }
        
        if (btnTopLuoghi) {
            btnTopLuoghi.style.display = 'block';
        }
        
        calculateTopLuoghi();
        
    } else {
        // RIMUOVI I LAYER IN ORDINE SICURO
        const layersToRemove = ['cluster-count', 'clusters', 'unclustered-point'];
        layersToRemove.forEach(layerId => {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', 'none');
            }
        });
        
        ['C', 'F', 'R', 'M'].forEach(tipo => {
            if (map.getLayer(`incidenti-${tipo}`)) {
                map.setLayoutProperty(`incidenti-${tipo}`, 'visibility', 'visible');
            }
        });
        
        if (btn) {
            btn.innerHTML = '<i class="fas fa-circle"></i> <span>Clustering</span>';
            btn.classList.remove('active');
        }
        
        if (btnTopLuoghi) {
            btnTopLuoghi.style.display = 'none';
        }
        
        const modal = document.getElementById('top-luoghi-modal');
        if (modal && modal.classList.contains('show')) {
            closeTopLuoghiModal();
        }
    }
}

// Toggle Section
function toggleSection(sectionId) {
    const content = document.getElementById(`content-${sectionId}`);
    const header = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (!content || !header) return;
    
    const toggle = header.querySelector('.toggle-icon');
    
    content.classList.toggle('collapsed');
    if (toggle) toggle.classList.toggle('collapsed');
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobile-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (!sidebar) return;
    
    sidebar.classList.toggle('open');
    if (toggle) toggle.classList.toggle('active');
    
    if (overlay) {
        if (sidebar.classList.contains('open')) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobile-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar) sidebar.classList.remove('open');
    if (toggle) toggle.classList.remove('active');
    if (overlay) overlay.classList.remove('show');
}

// ==========================================
// PARTE 3 - incidenti_part3
// ==========================================

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

// ==========================================
// PARTE 4 - incidenti_part4
// ==========================================

// ==========================================
// PARTE 4: FUNZIONI DOWNLOAD E ANALYTICS
// ==========================================

// Download CSV
function downloadCSV() {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
        alert('Nessun dato da scaricare');
        return;
    }
    
    const keys = Object.keys(filteredData[0]);
    let csv = keys.join(',') + '\n';
    
    filteredData.forEach(row => {
        const values = keys.map(key => {
            const value = row[key];
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return '"' + stringValue.replace(/"/g, '""') + '"';
            }
            return stringValue;
        });
        csv += values.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const annoFiltro = currentFilters['filter-anno'] || 'tutti';
    link.setAttribute('href', url);
    link.setAttribute('download', `incidenti_palermo_${annoFiltro}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Download JSON
function downloadJSON() {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
        alert('Nessun dato da scaricare');
        return;
    }
    
    const json = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const annoFiltro = currentFilters['filter-anno'] || 'tutti';
    link.setAttribute('href', url);
    link.setAttribute('download', `incidenti_palermo_${annoFiltro}_${new Date().getTime()}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Download Top Luoghi CSV
function downloadTopLuoghiCSV() {
    if (topLuoghiData.length === 0) {
        alert('Nessun dato da scaricare');
        return;
    }
    
    let csv = 'Posizione,Indirizzo,Totale Incidenti,Mortali,Riserva,Feriti,Cose\n';
    
    topLuoghiData.forEach((item, index) => {
        const indirizzo = item.indirizzo.replace(/"/g, '""');
        csv += `${index + 1},"${indirizzo}",${item.total},${item.M},${item.R},${item.F},${item.C}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const annoFiltro = currentFilters['filter-anno'] || 'tutti';
    link.setAttribute('href', url);
    link.setAttribute('download', `top_50_luoghi_palermo_${annoFiltro}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Analytics Functions
function openAnalytics() {
    const panel = document.getElementById('analytics-panel');
    if (panel) {
        panel.classList.add('open');
        updateActiveFiltersDisplay();
        updateAnalytics();
    }
}

function closeAnalytics() {
    const panel = document.getElementById('analytics-panel');
    if (panel) panel.classList.remove('open');
}

function updateActiveFiltersDisplay() {
    const filteredData = getFilteredData();
    const totalData = allIncidenti.length;
    
    let filterText = [];
    
    if (currentFilters['filter-data-selezionata']) {
        filterText.push(`Data: ${currentFilters['filter-data-selezionata']}`);
    }
    
    if (currentFilters['filter-anno']) {
        filterText.push(`Anno: ${currentFilters['filter-anno']}`);
    }
    
    if (currentFilters['filter-mese']) {
        filterText.push(`Mese: ${currentFilters['filter-mese']}`);
    }
    
    if (currentFilters['filter-giorno-settimana']) {
        filterText.push(`Giorno: ${currentFilters['filter-giorno-settimana']}`);
    }
    
    if (currentFilters['filter-tipologia']) {
        filterText.push(`Tipologia: ${currentFilters['filter-tipologia']}`);
    }
    
    let displayHTML = '';
    
    if (filterText.length === 0) {
        displayHTML = `Tutti gli incidenti (2015-2023) • ${totalData.toLocaleString('it-IT')} incidenti totali`;
    } else {
        displayHTML = `${filteredData.length.toLocaleString('it-IT')} di ${totalData.toLocaleString('it-IT')} incidenti • `;
        displayHTML += filterText.map(f => `<span class="filter-badge">${f}</span>`).join('');
    }
    
    const activeFiltersText = document.getElementById('active-filters-text');
    if (activeFiltersText) {
        activeFiltersText.innerHTML = displayHTML;
    }
}

function switchAnalyticsTab(tabName) {
    document.querySelectorAll('.analytics-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.analytics-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`tab-${tabName}`);
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
}

function updateAnalytics() {
    const filteredData = getFilteredData();
    
    updatePanoramicaCharts(filteredData);
    updateTemporaleCharts(filteredData);
    updateOrariaCharts(filteredData);
    updateCondizioniCharts(filteredData);
    updateInsights(filteredData);
    
    setTimeout(() => {
        addChartDownloadButtons();
    }, 100);
}

// Add Chart Download Buttons (ICONA AGGIORNATA)
function addChartDownloadButtons() {
    const chartContainers = document.querySelectorAll('.chart-container');
    
    chartContainers.forEach(container => {
        if (container.querySelector('.chart-download-btn')) return;
        
        const canvas = container.querySelector('canvas');
        if (!canvas) return;
        
        const chartId = canvas.id;
        const chartTitle = container.querySelector('h3')?.textContent || 'grafico';
        
        const btn = document.createElement('button');
        btn.className = 'chart-download-btn';
        btn.innerHTML = '<i class="fas fa-download"></i> PNG';
        btn.title = 'Scarica grafico come PNG';
        
        btn.onclick = () => {
            const filename = `${chartTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}`;
            downloadChartAsPNG(chartId, filename);
        };
        
        container.appendChild(btn);
    });
}

// Download Chart as PNG
async function downloadChartAsPNG(chartId, filename) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const chartInstance = Chart.getChart(canvas);
    if (!chartInstance) return;
    
    const originalOptions = JSON.parse(JSON.stringify(chartInstance.options));
    
    if (chartInstance.options.scales) {
        Object.keys(chartInstance.options.scales).forEach(scaleKey => {
            const scale = chartInstance.options.scales[scaleKey];
            if (scale.ticks) {
                scale.ticks.color = '#1e293b';
            }
            if (scale.grid) {
                scale.grid.color = 'rgba(148, 163, 184, 0.3)';
            }
            if (scale.pointLabels) {
                scale.pointLabels.color = '#1e293b';
            }
        });
    }
    
    if (chartInstance.options.plugins?.legend?.labels) {
        chartInstance.options.plugins.legend.labels.color = '#1e293b';
    }
    
    chartInstance.update();
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    const padding = 80;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height + padding;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    ctx.drawImage(canvas, 0, 0);
    
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = 'img/pa_hub_new.png';
    
    logo.onload = function() {
        const logoHeight = 35;
        const logoWidth = logo.width * (logoHeight / logo.height);
        const xPos = tempCanvas.width - logoWidth - 10;
        const yPos = tempCanvas.height - logoHeight - 35;
        
        ctx.drawImage(logo, xPos, yPos, logoWidth, logoHeight);
        
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px Titillium Web';
        ctx.textAlign = 'left';
        
        ctx.fillText('Fonte Dati: dati.gov.it - Comune di Palermo - Rielaborazione: opendatasicilia.it', 10, tempCanvas.height - 35);
        
        ctx.font = '10px Titillium Web';
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('https://opendatasicilia.github.io/incidenti_palermo/', 10, tempCanvas.height - 20);
        
        const link = document.createElement('a');
        link.download = filename + '.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
        
        chartInstance.options = originalOptions;
        chartInstance.update();
    };
    
    logo.onerror = function() {
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px Titillium Web';
        ctx.textAlign = 'left';
        ctx.fillText('Fonte Dati: dati.gov.it - Comune di Palermo - Rielaborazione: opendatasicilia.it', 10, tempCanvas.height - 35);
        ctx.font = '10px Titillium Web';
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('https://opendatasicilia.github.io/incidenti_palermo/', 10, tempCanvas.height - 20);
        
        const link = document.createElement('a');
        link.download = filename + '.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
        
        chartInstance.options = originalOptions;
        chartInstance.update();
    };
}

// Data Table Functions
function openDataTable() {
    const filteredData = getFilteredData();
    const modal = document.getElementById('data-table-modal');
    
    if (!modal) return;
    
    const tableCount = document.getElementById('table-count');
    if (tableCount) {
        tableCount.textContent = filteredData.length.toLocaleString('it-IT');
    }
    
    if (filteredData.length === 0) {
        const tableHeader = document.getElementById('table-header');
        const tableBody = document.getElementById('table-body');
        if (tableHeader) tableHeader.innerHTML = '';
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="100" style="text-align: center; padding: 40px; color: #94a3b8;">Nessun dato da visualizzare</td></tr>';
        }
        modal.classList.add('show');
        return;
    }
    
    const keys = Object.keys(filteredData[0]);
    let headerHtml = '<tr>';
    keys.forEach(key => {
        headerHtml += `<th>${key}</th>`;
    });
    headerHtml += '</tr>';
    
    const tableHeader = document.getElementById('table-header');
    if (tableHeader) tableHeader.innerHTML = headerHtml;
    
    const displayData = filteredData.slice(0, 500);
    let bodyHtml = '';
    displayData.forEach(row => {
        bodyHtml += '<tr>';
        keys.forEach(key => {
            bodyHtml += `<td>${row[key] !== null && row[key] !== undefined ? row[key] : '-'}</td>`;
        });
        bodyHtml += '</tr>';
    });
    
    if (filteredData.length > 500) {
        bodyHtml += `<tr><td colspan="${keys.length}" style="text-align: center; padding: 20px; color: #f59e0b;">Visualizzate le prime 500 righe di ${filteredData.length.toLocaleString('it-IT')}.</td></tr>`;
    }
    
    const tableBody = document.getElementById('table-body');
    if (tableBody) tableBody.innerHTML = bodyHtml;
    
    modal.classList.add('show');
}

function closeDataTable() {
    const modal = document.getElementById('data-table-modal');
    if (modal) modal.classList.remove('show');
}

// ==========================================
// PARTE 5 - incidenti_part5
// ==========================================

// ==========================================
// PARTE 5: FUNZIONI MAPPA E LAYERS
// ==========================================

// Map Initialization
function initMap() {
    const palermoBounds = [
        [13.05, 38.00],
        [13.65, 38.25]
    ];
    
    map = new maplibregl.Map({
        container: 'map',
        style: basemapStyles['carto-light'],
        center: [13.3913, 38.1454],
        zoom: 11.65,
        minZoom: 9,
        maxZoom: 18,
        maxBounds: palermoBounds,
        hash: true
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-left');
    
    class HomeControl {
        onAdd(map) {
            this._map = map;
            this._container = document.createElement('div');
            this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
            this._container.innerHTML = '<button class="maplibregl-ctrl-home" type="button" title="Torna alla vista iniziale"></button>';
            
            this._container.onclick = () => {
                map.flyTo({
                    center: [13.3913, 38.1454],
					zoom: 11.65,
                    duration: 1500,
                    essential: true
                });
            };
            
            return this._container;
        }
        
        onRemove() {
            this._container.parentNode.removeChild(this._container);
            this._map = undefined;
        }
    }
    
    map.addControl(new HomeControl(), 'top-left');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');
    
    class ODSControl {
        onAdd(map) {
            this._map = map;
            this._container = document.createElement('div');
            this._container.className = 'maplibregl-ctrl maplibregl-ctrl-ods';
            
            const link = document.createElement('a');
            link.href = 'https://palermohub.opendatasicilia.it/';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.title = 'palermohub.opendatasicilia.it';
            
            const img = document.createElement('img');
            img.src = 'img/pa_hub_new.png';
            img.alt = 'palermohub.opendatasicilia.it';
            
            link.appendChild(img);
            this._container.appendChild(link);
            
            return this._container;
        }
        
        onRemove() {
            this._container.parentNode.removeChild(this._container);
            this._map = undefined;
        }
    }
    
    map.addControl(new ODSControl(), 'bottom-left');
    
    map.setPadding({ top: 80, bottom: 80, left: 50, right: 50 });

    map.on('load', () => {
        console.log('Mappa caricata, creazione layers...');
        try {
            currentFilters['filter-anno'] = '2023';
            
            createMapLayers();
            populateFilters();
            updateStats();
            updateYearStats();
            updateLegendChart();
            updatePeriodSwitches();
            updateMonthlyInjuriesChart();
            updateMonthlyAreaChart();
            console.log('Inizializzazione completata!');
        } catch (error) {
            console.error('Errore durante inizializzazione:', error);
        } finally {
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
                loadingEl.classList.add('hidden');
            }
        }
    });
    
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading && !loading.classList.contains('hidden')) {
            console.log('Timeout sicurezza: nascondo loading');
            loading.classList.add('hidden');
        }
    }, 5000);
}

// Create GeoJSON
function createGeoJSON() {
    const filteredData = getFilteredData();
    
    return {
        type: 'FeatureCollection',
        features: filteredData.map(row => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)]
            },
            properties: row
        }))
    };
}

// Create Map Layers
function createMapLayers() {
    const geojson = createGeoJSON();
    
    console.log(`Creazione source con ${geojson.features.length} features`);
    
    map.addSource('incidenti', {
        type: 'geojson',
        data: geojson
    });

    map.addLayer({
        id: 'incidenti-heatmap',
        type: 'heatmap',
        source: 'incidenti',
        maxzoom: 15,
        paint: {
            'heatmap-weight': [
                'match',
                ['get', 'Tipologia'],
                'C', 0.5,
                'F', 1,
                'R', 1.5,
                'M', 2,
                1
            ],
            'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0.8,
                9, 1,
                15, 2.5
            ],
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0,0,255,0)',
                0.1, 'rgba(0,0,255,0.6)',
                0.3, 'rgba(0,255,255,0.7)',
                0.5, 'rgba(0,255,0,0.8)',
                0.7, 'rgba(255,255,0,0.85)',
                0.9, 'rgba(255,128,0,0.9)',
                1, 'rgba(255,0,0,1)'
            ],
            'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 1,
                9, 3,
                11, 6,
                13, 10,
                15, 14
            ],
            'heatmap-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                7, 0.65,
                15, 0.75
            ]
        },
        layout: {
            visibility: 'none'
        }
    });

    ['C', 'F', 'R', 'M'].forEach(tipo => {
        const layerId = `incidenti-${tipo}`;
        
        map.addLayer({
            id: layerId,
            type: 'circle',
            source: 'incidenti',
            filter: ['==', ['get', 'Tipologia'], tipo],
            paint: {
                'circle-radius': [
                    'interpolate', ['linear'], ['zoom'],
                    10, tipo === 'M' ? 4 : tipo === 'R' ? 3 : 2,
                    16, tipo === 'M' ? 10 : tipo === 'R' ? 8 : 6
                ],
                'circle-color': colorMap[tipo],
                'circle-opacity': 0.8,
                'circle-stroke-width': tipo === 'M' ? 2 : 1,
                'circle-stroke-color': 'transparent'
            }
        });

        setupLayerInteractions(layerId);
    });

    console.log('Layers creati con successo');
}

// Create Clustering Layers - VERSIONE CORRETTA SENZA ERRORI
function createClusteringLayers() {
    const geojson = createGeoJSON();
    
    // Rimuovi TUTTI i layer e source nell'ordine corretto
    const layersToRemove = ['cluster-count', 'clusters', 'unclustered-point'];
    layersToRemove.forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
        }
    });
    
    if (map.getSource('incidenti-cluster')) {
        map.removeSource('incidenti-cluster');
    }
    
    console.log('Creazione clustering con', geojson.features.length, 'incidenti');
    
    // CREA SOURCE
map.addSource('incidenti-cluster', {
    type: 'geojson',
    data: geojson,
    cluster: true,
    clusterMaxZoom: 15,        // zoom più alto
    clusterRadius: 40,         // raggio ridotto
    clusterMinPoints: 2        // minimo 2 punti per cluster
});

    // LAYER 1: CERCHI CLUSTER
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'incidenti-cluster',
        filter: ['has', 'point_count'],
paint: {
    'circle-color': [
        'step',
        ['get', 'point_count'],
        '#3b82f6',
        10, '#f59e0b',
        25, '#f97316',
        50, '#ef4444'
    ],
    'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],                    // ← basato sullo zoom
        10, ['interpolate', ['linear'], ['get', 'point_count'], 2, 6, 100, 25],
        16, ['interpolate', ['linear'], ['get', 'point_count'], 2, 12, 100, 40]
    ],
    'circle-opacity': 0.85,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#ffffff'
}
    });

    // LAYER 2: NUMERI (SUBITO DOPO I CERCHI)
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'incidenti-cluster',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': [
                'interpolate',
                ['linear'],
                ['get', 'point_count'],
                2, 10,
                10, 10,
                25, 12,
                50, 16,
                100, 15
            ],
            'text-allow-overlap': true,
            'text-ignore-placement': true,
            'text-anchor': 'center',
            'text-offset': [0, 0],
            'visibility': 'visible'  // AGGIUNGI ESPLICITAMENTE
        },
        paint: {
            'text-color': '#ffffff',
'text-halo-color': 'rgba(0, 0, 0, 0.3)',
    'text-halo-width': 1.5,
    'text-halo-blur': 1
        }
    });

    // LAYER 3: PUNTI SINGOLI
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'incidenti-cluster',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': [
                'match',
                ['get', 'Tipologia'],
                'M', '#ef4444',
                'R', '#a855f7',
                'F', '#f59e0b',
                'C', '#10b981',
                '#94a3b8'
            ],
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                10, 5,
                16, 8
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    console.log('✓ Tutti i layer cluster creati');

    // Event handlers
    if (!map._clusterHandlersAdded) {
        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            if (!features.length) return;
            
            const clusterId = features[0].properties.cluster_id;
            const pointCount = features[0].properties.point_count;
            
            map.getSource('incidenti-cluster').getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;
                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom + 1,
                        duration: 1000
                    });
                }
            );
        });

        const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 15
        });

        map.on('mouseenter', 'clusters', (e) => {
            map.getCanvas().style.cursor = 'pointer';
            const coordinates = e.features[0].geometry.coordinates.slice();
            const pointCount = e.features[0].properties.point_count;
            
            popup.setLngLat(coordinates)
                .setHTML(`<div style="padding: 10px; font-weight: 600;">
                    <div style="font-size: 18px; color: #3b82f6; margin-bottom: 4px;">${pointCount} incidenti</div>
                    <small style="color: #64748b;">Clicca per espandere</small>
                </div>`)
                .addTo(map);
        });

        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        map.on('click', 'unclustered-point', (e) => {
            if (!e.features || e.features.length === 0) return;
            const props = e.features[0].properties;
            openDetailPanel(props);
        });

        map.on('mouseenter', 'unclustered-point', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        
        map.on('mouseleave', 'unclustered-point', () => {
            map.getCanvas().style.cursor = '';
        });

        map._clusterHandlersAdded = true;
    }
}

// Setup Layer Interactions
function setupLayerInteractions(layerId) {
    map.on('click', layerId, (e) => {
        if (!e.features || e.features.length === 0) return;
        
        const props = e.features[0].properties;
        openDetailPanel(props);
    });

    map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
    });
}

// Change Basemap
function changeBasemap() {
    const basemapSelect = document.getElementById('basemap-select');
    if (!basemapSelect) return;
    
    const selectedStyle = basemapSelect.value;
    
    if (!basemapStyles[selectedStyle]) {
        console.error('Stile mappa non trovato:', selectedStyle);
        return;
    }
    
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    const currentBearing = map.getBearing();
    const currentPitch = map.getPitch();
    
    map.setStyle(basemapStyles[selectedStyle]);
    
    map.once('styledata', () => {
        map.jumpTo({
            center: currentCenter,
            zoom: currentZoom,
            bearing: currentBearing,
            pitch: currentPitch
        });
        
        createMapLayers();
        
        if (showHeatmap) {
            map.setLayoutProperty('incidenti-heatmap', 'visibility', 'visible');
            ['C', 'F', 'R', 'M'].forEach(tipo => {
                map.setLayoutProperty(`incidenti-${tipo}`, 'visibility', 'none');
            });
        }
    });
}

// Zoom to Location
function zoomToLocation(lng, lat) {
    closeTopLuoghiModal();
    
    map.flyTo({
        center: [lng, lat],
        zoom: 16,
        duration: 2000,
        essential: true
    });
    
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
}

// Zoom To Filtered Area
function zoomToFilteredArea() {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) return;

    const coords = filteredData
        .filter(row => row.longitude && row.latitude)
        .map(row => [parseFloat(row.longitude), parseFloat(row.latitude)]);

    if (coords.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    coords.forEach(coord => bounds.extend(coord));

    if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 80, right: 80 },
            maxZoom: 17,
            duration: 1000
        });
    }
}

// Calculate Top Luoghi
function calculateTopLuoghi() {
    const filteredData = getFilteredData();
    const luoghiMap = {};
    
    filteredData.forEach(row => {
        const indirizzo = row.Indirizzo || 'Non specificato';
        
        if (!luoghiMap[indirizzo]) {
            luoghiMap[indirizzo] = {
                indirizzo: indirizzo,
                total: 0,
                M: 0,
                R: 0,
                F: 0,
                C: 0,
                coordinates: []
            };
        }
        
        luoghiMap[indirizzo].total++;
        const tipo = row.Tipologia;
        if (tipo && luoghiMap[indirizzo].hasOwnProperty(tipo)) {
            luoghiMap[indirizzo][tipo]++;
        }
        
        if (luoghiMap[indirizzo].coordinates.length === 0 && row.longitude && row.latitude) {
            luoghiMap[indirizzo].coordinates = [
                parseFloat(row.longitude),
                parseFloat(row.latitude)
            ];
        }
    });
    
    topLuoghiData = Object.values(luoghiMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 25);
    
    console.log('Top 25 luoghi calcolati:', topLuoghiData.length);
}

// Update Top Luoghi Modal if open
function updateTopLuoghiModalIfOpen() {
    const modal = document.getElementById('top-luoghi-modal');
    if (modal && modal.classList.contains('show')) {
        openTopLuoghiModal();
    }
}

// Update Map Data
function updateMapData() {
    const geojson = createGeoJSON();
    console.log(`Aggiornamento mappa con ${geojson.features.length} features`);
    
    const source = map.getSource('incidenti');
    if (source) {
        source.setData(geojson);
    }
    
    const clusterSource = map.getSource('incidenti-cluster');
    if (clusterSource) {
        clusterSource.setData(geojson);
        console.log('Cluster aggiornati con i nuovi filtri');
    }
    
    if (showClustering) {
        calculateTopLuoghi();
    }
}

// ==========================================
// PARTE 6 - incidenti_part6
// ==========================================

// ==========================================
// PARTE 6: FUNZIONI FILTRI E STATISTICHE
// ==========================================

// Get Filtered Data
function getFilteredData() {
    return allIncidenti.filter(row => {
        if (currentFilters['filter-data-selezionata']) {
            if (row.Data !== currentFilters['filter-data-selezionata']) {
                return false;
            }
        }
        
        for (const [filterId, property] of Object.entries(filterConfig)) {
            const value = currentFilters[filterId];
            if (!value) continue;

            const rowValue = row[property];
            
            if (property === 'Anno') {
                if (Number(rowValue) !== Number(value)) return false;
            } else {
                if (String(rowValue) !== String(value)) return false;
            }
        }
        return true;
    });
}

// Populate Filters
function populateFilters() {
    console.log('Popolamento filtri...');

    Object.entries(filterConfig).forEach(([selectId, property]) => {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.addEventListener('change', (e) => {
            handleFilterChange(selectId, e.target.value);
        });
    });

    updateAllFilters();
}

// Handle Filter Change
function handleFilterChange(filterId, value) {
    currentFilters[filterId] = value;
    
    if (filterId === 'filter-anno' || filterId === 'filter-mese' || filterId === 'filter-giorno-settimana') {
        delete currentFilters['filter-data-selezionata'];
        customCalendarState.selectedDay = null;
    }

    if (filterDependencies[filterId]) {
        filterDependencies[filterId].forEach(dependentId => {
            currentFilters[dependentId] = '';
            const dependentEl = document.getElementById(dependentId);
            if (dependentEl) dependentEl.value = '';
        });
    }

    updateAllFilters();
    updateMapData();
    
    if (filterId === 'filter-circoscrizione' || filterId === 'filter-quartiere') {
        zoomToFilteredArea();
    }

    updateStats();
    updateYearStats();
    updateLegendChart();
    updatePeriodSwitches();
    updateMonthlyInjuriesChart();
    updateMonthlyAreaChart();
    
    if (showClustering) {
        calculateTopLuoghi();
        updateTopLuoghiModalIfOpen();
    }
    
    const analyticsPanel = document.getElementById('analytics-panel');
    if (analyticsPanel && analyticsPanel.classList.contains('open')) {
        updateActiveFiltersDisplay();
        updateAnalytics();
    }
}

// Update All Filters
function updateAllFilters() {
    const filteredData = getFilteredData();

    Object.entries(filterConfig).forEach(([selectId, property]) => {
        const select = document.getElementById(selectId);
        if (!select) return;

        const currentValue = currentFilters[selectId] || '';
        const values = new Set();
        
        filteredData.forEach(row => {
            const value = row[property];
            if (value !== null && value !== 'null' && value !== '' && value !== undefined) {
                values.add(String(value));
            }
        });

        let sortedValues = Array.from(values).sort((a, b) => {
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return String(a).localeCompare(String(b), 'it');
        });

        if (property === 'Anno') {
            sortedValues.reverse();
        }

        select.innerHTML = '<option value="">Tutti</option>';
        sortedValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            if (value === currentValue) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.disabled = sortedValues.length === 0 && currentValue === '';
    });
}

// Update Stats
function updateStats() {
    const filteredData = getFilteredData();
    const stats = { M: 0, R: 0, F: 0, C: 0 };
    
    filteredData.forEach(row => {
        const tipo = row.Tipologia;
        if (tipo && stats.hasOwnProperty(tipo)) {
            stats[tipo]++;
        }
    });

    const statMortale = document.getElementById('stat-mortale');
    const statRiserva = document.getElementById('stat-riserva');
    const statFeriti = document.getElementById('stat-feriti');
    const statCose = document.getElementById('stat-cose');
    const statTotal = document.getElementById('stat-total');
    
    if (statMortale) statMortale.textContent = stats.M.toLocaleString('it-IT');
    if (statRiserva) statRiserva.textContent = stats.R.toLocaleString('it-IT');
    if (statFeriti) statFeriti.textContent = stats.F.toLocaleString('it-IT');
    if (statCose) statCose.textContent = stats.C.toLocaleString('it-IT');
    if (statTotal) statTotal.textContent = (stats.M + stats.R + stats.F + stats.C).toLocaleString('it-IT');
    
    const labelTotale = document.querySelector('.stat-total .stat-label');
    if (labelTotale) {
        let labelText = 'Totale Incidenti';
        
        if (currentFilters['filter-data-selezionata']) {
            labelText = `Totale Incidenti (${currentFilters['filter-data-selezionata']})`;
        }
        else if (currentFilters['filter-mese'] && currentFilters['filter-anno']) {
            labelText = `Totale Incidenti (${currentFilters['filter-mese']} ${currentFilters['filter-anno']})`;
        }
        else if (currentFilters['filter-mese']) {
            labelText = `Totale Incidenti (${currentFilters['filter-mese']})`;
        }
        else if (currentFilters['filter-anno']) {
            labelText = `Totale Incidenti (${currentFilters['filter-anno']})`;
        }
        
        labelTotale.textContent = labelText;
    }

    console.log('Statistiche:', stats, `su ${filteredData.length} incidenti filtrati`);
}

// Update Year Stats
function updateYearStats() {
    const selectedYear = currentFilters['filter-anno'];
    const yearStats = {};
    
    const tempFilters = {...currentFilters};
    delete tempFilters['filter-anno'];
    
    const dataForYearCount = allIncidenti.filter(row => {
        for (const [filterId, property] of Object.entries(filterConfig)) {
            if (filterId === 'filter-anno') continue;
            const value = tempFilters[filterId];
            if (!value) continue;

            const rowValue = row[property];
            
            if (property === 'Anno') {
                if (Number(rowValue) !== Number(value)) return false;
            } else {
                if (String(rowValue) !== String(value)) return false;
            }
        }
        return true;
    });
    
    dataForYearCount.forEach(row => {
        const year = row.Anno;
        if (year) {
            yearStats[year] = (yearStats[year] || 0) + 1;
        }
    });
    
    const incidenti2019NonMappati = 3192;
    if (yearStats['2019']) {
        yearStats['2019'] += incidenti2019NonMappati;
    } else {
        yearStats['2019'] = incidenti2019NonMappati;
    }
    
    const totalAllYears = Object.values(yearStats).reduce((sum, count) => sum + count, 0);
    
    let gridHtml = `
        <div class="year-stat-item-all ${selectedYear === '' ? 'active' : ''}" 
             data-year=""
             title="Clicca per mostrare tutti gli anni">
            <div class="year-stat-year">Tutti gli Anni</div>
            <div class="year-stat-count">${totalAllYears.toLocaleString('it-IT')}</div>
        </div>
    `;
    
    const sortedYears = Object.keys(yearStats).sort((a, b) => b - a);
    gridHtml += sortedYears.map(year => {
        const is2019 = year === '2019';
        const titleText = is2019 
            ? `Anno 2019 - Include ${incidenti2019NonMappati.toLocaleString('it-IT')} incidenti non mappati. Clicca per dettagli` 
            : `Clicca per filtrare l'anno ${year}`;
        
        return `
        <div class="year-stat-item ${selectedYear === String(year) ? 'active' : ''} ${is2019 ? 'year-2019' : ''}" 
             data-year="${year}"
             title="${titleText}">
            <div class="year-stat-year">${year}${is2019 ? ' *' : ''}</div>
            <div class="year-stat-count">${yearStats[year].toLocaleString('it-IT')}</div>
        </div>
    `;
    }).join('');
    
    const yearStatsGrid = document.getElementById('year-stats-grid');
    if (yearStatsGrid) {
        yearStatsGrid.innerHTML = gridHtml;
    }
}

// Filter By Year
function filterByYear(year) {
    const currentYear = currentFilters['filter-anno'];
    
    if (currentYear === String(year)) {
        currentFilters['filter-anno'] = '';
        customCalendarState.selectedYear = null;
    } else {
        currentFilters['filter-anno'] = String(year);
        customCalendarState.selectedYear = parseInt(year);
        customCalendarState.currentYear = parseInt(year);
    }
    
    delete currentFilters['filter-data-selezionata'];
    customCalendarState.selectedDay = null;
    
    const filterAnno = document.getElementById('filter-anno');
    if (filterAnno) {
        filterAnno.value = currentFilters['filter-anno'];
    }
    
    renderCalendarYear();
    renderCalendarMonths();
    
    updateAllFilters();
    updateMapData();
    updateStats();
    updateYearStats();
    updateLegendChart();
    updatePeriodSwitches();
    updateMonthlyInjuriesChart();
    updateMonthlyAreaChart();
    
    if (showClustering) {
        calculateTopLuoghi();
        updateTopLuoghiModalIfOpen();
    }
    
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
    
    const analyticsPanel = document.getElementById('analytics-panel');
    if (analyticsPanel && analyticsPanel.classList.contains('open')) {
        updateAnalytics();
    }
}

// Filter By Tipologia
function filterByTipologia(tipo) {
    const currentTipo = currentFilters['filter-tipologia'];
    
    if (currentTipo === tipo) {
        currentFilters['filter-tipologia'] = '';
    } else {
        currentFilters['filter-tipologia'] = tipo;
    }
    
    const filterTipologia = document.getElementById('filter-tipologia');
    if (filterTipologia) {
        filterTipologia.value = currentFilters['filter-tipologia'];
    }
    
    updateAllFilters();
    updateMapData();
    updateStats();
    updateYearStats();
    updateLegendChart();
    updatePeriodSwitches();
    updateMonthlyInjuriesChart();
    updateMonthlyAreaChart();
    
    const analyticsPanel = document.getElementById('analytics-panel');
    if (analyticsPanel && analyticsPanel.classList.contains('open')) {
        updateAnalytics();
    }
}

// Filter By Day/Night
function filterByDayNight(periodo) {
    const currentPeriodo = currentFilters['filter-giorno-notte'];
    
    if (currentPeriodo === periodo) {
        currentFilters['filter-giorno-notte'] = '';
    } else {
        currentFilters['filter-giorno-notte'] = periodo;
    }
    
    const filterGiornoNotte = document.getElementById('filter-giorno-notte');
    if (filterGiornoNotte) {
        filterGiornoNotte.value = currentFilters['filter-giorno-notte'];
    }
    
    updateAllFilters();
    updateMapData();
    updateStats();
    updateYearStats();
    updateLegendChart();
    updatePeriodSwitches();
    updateMonthlyInjuriesChart();
    updateMonthlyAreaChart();
    
    const analyticsPanel = document.getElementById('analytics-panel');
    if (analyticsPanel && analyticsPanel.classList.contains('open')) {
        updateAnalytics();
    }
}

// Filter By Month
function filterByMonth(mese) {
    const currentMese = currentFilters['filter-mese'];
    
    if (currentMese === mese) {
        currentFilters['filter-mese'] = '';
        customCalendarState.selectedMonth = null;
        document.getElementById('cal-days-container').style.display = 'none';
    } else {
        currentFilters['filter-mese'] = mese;
        customCalendarState.selectedMonth = mese;
        const monthIndex = MESI_ITALIANI.indexOf(mese);
        if (monthIndex >= 0) {
            renderCalendarDays(monthIndex);
        }
    }
    
    const filterMese = document.getElementById('filter-mese');
    if (filterMese) {
        filterMese.value = currentFilters['filter-mese'];
    }
    
    renderCalendarMonths();
    updateCalendarSummary();
    
    updateAllFilters();
    updateMapData();
    updateStats();
    updateYearStats();
    updateLegendChart();
    updatePeriodSwitches();
    updateMonthlyInjuriesChart();
    updateMonthlyAreaChart();
    
    const analyticsPanel = document.getElementById('analytics-panel');
    if (analyticsPanel && analyticsPanel.classList.contains('open')) {
        updateAnalytics();
    }
}

// Reset Filters
function resetFilters() {
    currentFilters = {};
    document.querySelectorAll('select').forEach(select => {
        select.value = '';
        select.disabled = false;
    });
    
    currentFilters['filter-anno'] = '2023';
    
    const filterAnno = document.getElementById('filter-anno');
    if (filterAnno) filterAnno.value = '2023';
    
    customCalendarState.selectedYear = 2023;
    customCalendarState.currentYear = 2023;
    
    resetCustomCalendar();
	
	    if (map) {
        map.flyTo({
            center: [13.3913, 38.1454],  // Centro Palermo
            zoom: 11.65,                     // Zoom iniziale
            duration: 1500,               // Animazione 1.5 secondi
            essential: true
        });
    }        
    
    updateAllFilters();
    updateMapData();
    updateStats();
    updateYearStats();
    updateLegendChart();
    updatePeriodSwitches();
    updateMonthlyInjuriesChart();
    updateMonthlyAreaChart();
    
    if (showClustering) {
        calculateTopLuoghi();
        updateTopLuoghiModalIfOpen();
    }
    
    const analyticsPanel = document.getElementById('analytics-panel');
    if (analyticsPanel && analyticsPanel.classList.contains('open')) {
        updateAnalytics();
    }
}

// Reset Charts Filters
function resetChartsFilters() {
    currentFilters['filter-tipologia'] = '';
    const filterTipologia = document.getElementById('filter-tipologia');
    if (filterTipologia) filterTipologia.value = '';
    
    currentFilters['filter-giorno-notte'] = '';
    const filterGiornoNotte = document.getElementById('filter-giorno-notte');
    if (filterGiornoNotte) filterGiornoNotte.value = '';
    
    currentFilters['filter-mese'] = '';
    const filterMese = document.getElementById('filter-mese');
    if (filterMese) filterMese.value = '';
    
    updateAllFilters();
    updateMapData();
    updateStats();
    updateYearStats();
    updateLegendChart();
    updatePeriodSwitches();
    updateMonthlyInjuriesChart();
    updateMonthlyAreaChart();
    
    const analyticsPanel = document.getElementById('analytics-panel');
    if (analyticsPanel && analyticsPanel.classList.contains('open')) {
        updateAnalytics();
    }
}

// Update Period Switches (Giorno/Notte)
function updatePeriodSwitches() {
    const filteredData = getFilteredData();
    const stats = { 'Giorno': 0, 'Notte': 0 };
    
    filteredData.forEach(row => {
        const periodo = row['Giorno/Notte'];
        if (periodo && stats.hasOwnProperty(periodo)) {
            stats[periodo]++;
        }
    });
    
    const selectedPeriodo = currentFilters['filter-giorno-notte'];
    
    const countGiornoEl = document.getElementById('count-giorno');
    const countNotteEl = document.getElementById('count-notte');
    
    if (countGiornoEl) {
        countGiornoEl.textContent = stats['Giorno'].toLocaleString('it-IT');
    }
    if (countNotteEl) {
        countNotteEl.textContent = stats['Notte'].toLocaleString('it-IT');
    }
    
    const switchGiorno = document.getElementById('switch-giorno');
    const switchNotte = document.getElementById('switch-notte');
    
    if (switchGiorno) {
        switchGiorno.classList.toggle('active', selectedPeriodo === 'Giorno');
    }
    if (switchNotte) {
        switchNotte.classList.toggle('active', selectedPeriodo === 'Notte');
    }
}

function updateLegendActiveState() {
    const selectedTipo = currentFilters['filter-tipologia'];
    
    document.querySelectorAll('.legend-item').forEach(item => {
        const tipo = item.dataset.tipo;
        if (selectedTipo === tipo) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ==========================================
// PARTE 7 - incidenti_part7
// ==========================================

// ==========================================
// PARTE 7: GRAFICI CHART.JS
// ==========================================

// Update Legend Chart
let legendChart = null;

function updateLegendChart() {
    const filteredData = getFilteredData();
    const stats = { M: 0, R: 0, F: 0, C: 0 };
    
    filteredData.forEach(row => {
        const tipo = row.Tipologia;
        if (tipo && stats.hasOwnProperty(tipo)) {
            stats[tipo]++;
        }
    });
    
    // AGGIUNGI QUESTO BLOCCO QUI ↓
    // Costruisci il titolo con i filtri attivi
    const activeFilters = [];
    
    if (currentFilters['filter-data-selezionata']) {
        activeFilters.push(currentFilters['filter-data-selezionata']);
    } else {
        if (currentFilters['filter-anno']) {
            activeFilters.push(currentFilters['filter-anno']);
        }
        if (currentFilters['filter-mese']) {
            activeFilters.push(currentFilters['filter-mese']);
        }
        if (currentFilters['filter-giorno-settimana']) {
            activeFilters.push(currentFilters['filter-giorno-settimana']);
        }
    }
    
    if (currentFilters['filter-circoscrizione']) {
        activeFilters.push(currentFilters['filter-circoscrizione']);
    }
    if (currentFilters['filter-quartiere']) {
        activeFilters.push(currentFilters['filter-quartiere']);
    }
    if (currentFilters['filter-giorno-notte']) {
        activeFilters.push(currentFilters['filter-giorno-notte']);
    }
    
    // Aggiorna il titolo del grafico
    const chartTitle = document.getElementById('legend-chart-title');
    if (chartTitle) {
        if (activeFilters.length > 0) {
            chartTitle.innerHTML = `Tipologia Incidenti<br><small style="font-size: 11px; font-weight: 600; color: #94a3b8;">${activeFilters.join(' • ')}</small>`;
        } else {
            chartTitle.textContent = 'Tipologia Incidenti';
        }
    }
    
    const selectedTipo = currentFilters['filter-tipologia'];
    
    const items = [
        { label: 'F - Feriti', value: stats.F, tipo: 'F', color: '#f59e0b' },
        { label: 'C - Cose', value: stats.C, tipo: 'C', color: '#10b981' },
        { label: 'R - Riserva', value: stats.R, tipo: 'R', color: '#a855f7' },
        { label: 'M - Mortale', value: stats.M, tipo: 'M', color: '#ef4444' }
    ];
    
    const labels = items.map(item => item.label);
    const data = items.map(item => item.value);
    const tipos = items.map(item => item.tipo);
    const colors = items.map(item => item.color);
    
    const backgroundColors = tipos.map((tipo, idx) => 
        selectedTipo === tipo ? colors[idx] : colors[idx] + 'CC'
    );
    
    const borderColors = tipos.map((tipo, idx) => 
        selectedTipo === tipo ? colors[idx] : 'transparent'
    );
    
    const borderWidths = tipos.map(tipo => 
        selectedTipo === tipo ? 3 : 0
    );
    
    const canvas = document.getElementById('legend-chart');
    if (!canvas) return;
    
    if (legendChart) {
        legendChart.destroy();
    }
    
    legendChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: borderWidths
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 0,
                    right: 10,
                    top: 8,
                    bottom: 8
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    titleFont: { size: 11, weight: 'bold' },
                    bodyFont: { size: 10 },
                    callbacks: {
                        title: function(context) {
                            const tipo = tipos[context[0].dataIndex];
                            const names = { F: 'Feriti', C: 'Cose', R: 'Riserva', M: 'Mortale' };
                            return names[tipo];
                        },
                        label: function(context) {
                            const value = context.parsed.x;
                            const total = data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${value.toLocaleString('it-IT')} incidenti (${percentage}%)`;
                        },
                        afterLabel: function(context) {
                            const tipo = tipos[context.dataIndex];
                            if (selectedTipo === tipo) {
                                return 'Clicca per deselezionare';
                            }
                            return 'Clicca per filtrare';
                        }
                    }
                },
                datalabels: {
                    display: true,
                    anchor: function(context) {
                        const value = context.dataset.data[context.dataIndex];
                        const maxValue = Math.max(...context.dataset.data);
                        return value > maxValue * 0.2 ? 'end' : 'end';
                    },
                    align: function(context) {
                        const value = context.dataset.data[context.dataIndex];
                        const maxValue = Math.max(...context.dataset.data);
                        return value > maxValue * 0.2 ? 'start' : 'end';
                    },
                    color: function(context) {
                        const value = context.dataset.data[context.dataIndex];
                        const maxValue = Math.max(...context.dataset.data);
                        return value > maxValue * 0.2 ? '#ffffff' : '#f1f5f9';
                    },
                    font: {
                        size: 10,
                        weight: 'bold'
                    },
                    formatter: (value) => value > 0 ? value.toLocaleString('it-IT') : '',
                    offset: function(context) {
                        const value = context.dataset.data[context.dataIndex];
                        const maxValue = Math.max(...context.dataset.data);
                        return value > maxValue * 0.2 ? 2: 4;
                    }
                }
            },
            scales: {
                x: {
                    display: false,
                    grid: {
                        display: false
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 10,
                            weight: '500'
                        },
                        padding: 8
                    }
                }
            },
            onHover: (event, activeElements) => {
                event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
            },
            onClick: (e, items) => {
                if (items.length > 0) {
                    const tipo = tipos[items[0].index];
                    filterByTipologia(tipo);
                }
            }
        }
    });
}



// Update Monthly Injuries Chart (Grafico Radar)
function updateMonthlyInjuriesChart() {
    const filteredData = getFilteredData();
    
    const monthsDataAll = {};
    const monthsDataFeriti = {};
    const monthsDataMorti = {};
    
    MESI_ITALIANI.forEach(mese => {
        monthsDataAll[mese] = 0;
        monthsDataFeriti[mese] = 0;
        monthsDataMorti[mese] = 0;
    });
    
    filteredData.forEach(row => {
        const mese = row.Mese;
        const tipo = row.Tipologia;
        
        if (mese && monthsDataAll.hasOwnProperty(mese)) {
            monthsDataAll[mese]++;
            
            if (tipo === 'F' || tipo === 'R') {
                monthsDataFeriti[mese]++;
            }
            
            if (tipo === 'M') {
                monthsDataMorti[mese]++;
            }
        }
    });
    
    const countsAll = MESI_ITALIANI.map(m => monthsDataAll[m]);
    const countsFeriti = MESI_ITALIANI.map(m => monthsDataFeriti[m]);
    const countsMorti = MESI_ITALIANI.map(m => monthsDataMorti[m]);
    
    const selectedMese = currentFilters['filter-mese'];
    
    const canvas = document.getElementById('monthly-injuries-chart');
    if (!canvas) return;
    
    if (monthlyInjuriesChart) {
        monthlyInjuriesChart.destroy();
    }
    
    monthlyInjuriesChart = new Chart(canvas, {
        type: 'radar',
        data: {
            labels: MESI_ITALIANI,
            datasets: [
                {
                    label: 'Incidenti',
                    data: countsAll,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    pointBackgroundColor: MESI_ITALIANI.map(m => 
                        selectedMese === m ? '#2563eb' : '#3b82f6'
                    ),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 0.5,
                    pointRadius: MESI_ITALIANI.map(m => 
                        selectedMese === m ? 5 : 3
                    ),
                    pointHoverRadius: 6
                },
                {
                    label: 'Feriti',
                    data: countsFeriti,
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    pointBackgroundColor: MESI_ITALIANI.map(m => 
                        selectedMese === m ? '#d97706' : '#f59e0b'
                    ),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 0.5,
                    pointRadius: MESI_ITALIANI.map(m => 
                        selectedMese === m ? 5 : 3
                    ),
                    pointHoverRadius: 6
                },
                {
                    label: 'Morti',
                    data: countsMorti,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    pointBackgroundColor: MESI_ITALIANI.map(m => 
                        selectedMese === m ? '#dc2626' : '#ef4444'
                    ),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 0.5,
                    pointRadius: MESI_ITALIANI.map(m => 
                        selectedMese === m ? 5 : 3
                    ),
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#fff',
                        font: { size: 10 },
                        padding: 8,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    titleFont: { size: 11, weight: 'bold' },
                    bodyFont: { size: 10 },
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.r;
                            return `${label}: ${value}`;
                        },
                        afterBody: function(context) {
                            const mese = MESI_ITALIANI[context[0].dataIndex];
                            if (selectedMese === mese) {
                                return '\nClicca per deselezionare';
                            }
                        }
                    }
                },
                datalabels: {
                    display: false
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        color: '#fff',
                        backdropColor: 'transparent',
                        font: { size: 8 }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.5)'			
                    },
                    angleLines: {
                        color: 'rgba(148, 163, 184, 0.3)',
                        lineWidth: 1
                    },
                    pointLabels: {
                        color: '#fff',
                        font: { 
                            size: 10,
                            weight: '600'
                        }
                    }
                }
            },
            onHover: (event, activeElements) => {
                event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
            },
            onClick: (e, items) => {
                if (items.length > 0) {
                    const mese = MESI_ITALIANI[items[0].index];
                    filterByMonth(mese);
                }
            }
        }
    });
}

// Update Monthly Area Chart
function updateMonthlyAreaChart() {
    const filteredData = getFilteredData();
    
    const monthsDataAll = {};
    const monthsDataFeriti = {};
    
    MESI_ITALIANI.forEach(mese => {
        monthsDataAll[mese] = 0;
        monthsDataFeriti[mese] = 0;
    });
    
    filteredData.forEach(row => {
        const mese = row.Mese;
        const tipo = row.Tipologia;
        
        if (mese && monthsDataAll.hasOwnProperty(mese)) {
            monthsDataAll[mese]++;
            
            if (tipo === 'F' || tipo === 'R' || tipo === 'M') {
                monthsDataFeriti[mese]++;
            }
        }
    });
    
    const countsAll = MESI_ITALIANI.map(m => monthsDataAll[m]);
    const countsFeriti = MESI_ITALIANI.map(m => monthsDataFeriti[m]);
    const countsSenzaFeriti = countsAll.map((total, idx) => total - countsFeriti[idx]);
    
    const selectedMese = currentFilters['filter-mese'];
    
    const canvas = document.getElementById('monthly-area-chart');
    if (!canvas) return;
    
    if (monthlyAreaChart) {
        monthlyAreaChart.destroy();
    }
    
    monthlyAreaChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: MESI_ITALIANI,
            datasets: [
                {
                    label: 'Feriti',
                    data: countsFeriti,
                    backgroundColor:'rgba(245, 158, 11, 0.4)',
                    borderColor: '#f59e0b',
                    pointBorderColor: '#fff', 
                    borderWidth: 2,
                    fill: true,
                    pointBackgroundColor: MESI_ITALIANI.map(m => 
                        selectedMese === m ? '#3b82f6' : '#f59e0b'
                    ),
                    pointBorderWidth: 0.5,
                    pointRadius: MESI_ITALIANI.map(m => 
                        selectedMese === m ? 5 : 3
                    ),
                    pointHoverRadius: 6
                },
                {
                    label: 'Sinistri',
                    data: countsSenzaFeriti,
                    backgroundColor: 'rgba(59, 130, 246, 0.4)',
                    borderColor: '#3b82f6',
                    pointBorderColor: '#fff', 
                    borderWidth: 2,
                    fill: true,
                    pointBackgroundColor: MESI_ITALIANI.map(m => 
                        selectedMese === m ? '#f59e0b' : '#3b82f6',
                    ),
                    pointBorderWidth: 0.5,
                    pointRadius: MESI_ITALIANI.map(m => 
                        selectedMese === m ? 5 : 3
                    ),
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    position: 'bottom',
                    labels: {
                        color: '#fff',
                        font: { size: 9 },
                        padding: 6,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 10,
                    titleFont: { size: 11, weight: 'bold' },
                    bodyFont: { size: 10 },
                    yAlign: function(context) {
                        if (context.tooltip.dataPoints[0].datasetIndex === 1) {
                            return 'bottom';
                        }
                        return 'top';
                    },
                    callbacks: {
                        label: function(context) {
                            const datasetLabel = context.dataset.label;
                            const value = context.parsed.y;
                            const mese = MESI_ITALIANI[context.dataIndex];
                            const totale = monthsDataAll[mese];
                            
                            if (datasetLabel === 'Feriti') {
                                return `Feriti: ${value}`;
                            } else {
                                return `Sinistri senza feriti: ${value}`;
                            }
                        },
                        afterLabel: function(context) {
                            const mese = MESI_ITALIANI[context.dataIndex];
                            const totale = monthsDataAll[mese];
                            return `Totale mese: ${totale}`;
                        },
                        footer: function(context) {
                            const mese = MESI_ITALIANI[context[0].dataIndex];
                            if (selectedMese === mese) {
                                return '\nClicca per deselezionare';
                            } else {
                                return '\nClicca per filtrare';
                            }
                        }
                    }
                },
                datalabels: {
                    display: false,
                    align: 'top',
                    anchor: 'end',
                    color: '#1e293b',
                    font: {
                        weight: 'bold',
                        size: 9
                    },
                    backgroundColor: 'rgba(241, 245, 249, 0.95)',
                    borderRadius: 3,
                    padding: 2,
                    formatter: function(value, context) {
                        if (context.datasetIndex === 1) {
                            const mese = MESI_ITALIANI[context.dataIndex];
                            return monthsDataAll[mese];
                        }
                        return null;
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#fff',
                        font: { size: 9 }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        color: '#fff',
                        font: { size: 9 }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            onHover: (event, activeElements) => {
                event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
            },
            onClick: (e, items) => {
                if (items.length > 0) {
                    const mese = MESI_ITALIANI[items[0].index];
                    filterByMonth(mese);
                }
            }
        }
    });
}

// ==========================================
// PARTE 8 - incidenti_part8
// ==========================================

// ==========================================
// PARTE 8: CALENDARIO CUSTOM E ANALYTICS CHARTS
// ==========================================

// Inizializza Calendario Custom
function initCustomCalendar() {
    const year = currentFilters['filter-anno'] || '2023';
    customCalendarState.currentYear = parseInt(year);
    
    renderCalendarYear();
    renderCalendarMonths();
    renderCalendarWeekdays();
    updateCalendarSummary();
    
    const prevYearBtn = document.getElementById('cal-prev-year');
    const nextYearBtn = document.getElementById('cal-next-year');
    const yearDisplay = document.getElementById('cal-year-display');
    const resetBtn = document.getElementById('btn-calendar-reset');
    
    if (prevYearBtn) {
        prevYearBtn.addEventListener('click', () => {
            if (customCalendarState.currentYear > 2015) {
                customCalendarState.currentYear--;
                selectCalendarYear(customCalendarState.currentYear);
            }
        });
    }
    
    if (nextYearBtn) {
        nextYearBtn.addEventListener('click', () => {
            if (customCalendarState.currentYear < 2023) {
                customCalendarState.currentYear++;
                selectCalendarYear(customCalendarState.currentYear);
            }
        });
    }
    
    if (yearDisplay) {
        yearDisplay.addEventListener('click', () => {
            if (customCalendarState.selectedYear === customCalendarState.currentYear) {
                resetCustomCalendar();
            } else {
                selectCalendarYear(customCalendarState.currentYear);
            }
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetCustomCalendar);
    }
}

// Render Anno
function renderCalendarYear() {
    const yearDisplay = document.getElementById('cal-year-display');
    if (yearDisplay) {
        yearDisplay.textContent = customCalendarState.currentYear;
        yearDisplay.classList.toggle('active', customCalendarState.selectedYear === customCalendarState.currentYear);
    }
}

// Render Mesi
function renderCalendarMonths() {
    const grid = document.getElementById('cal-months-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    MESI_ITALIANI.forEach((mese, index) => {
        const btn = document.createElement('button');
        btn.className = 'calendar-month-btn';
        btn.textContent = mese;
        btn.dataset.month = mese;
        btn.dataset.monthIndex = index;
        
        const hasData = checkMonthHasData(customCalendarState.currentYear, index + 1);
        if (hasData) {
            btn.classList.add('has-data');
        }
        
        if (customCalendarState.selectedMonth === mese && 
            customCalendarState.selectedYear === customCalendarState.currentYear) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => selectCalendarMonth(mese, index));
        grid.appendChild(btn);
    });
}

// Render Giorni Settimana
function renderCalendarWeekdays() {
    const grid = document.getElementById('cal-weekdays-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    GIORNI_SETTIMANA_SHORT.forEach((giorno, index) => {
        const btn = document.createElement('button');
        btn.className = 'calendar-weekday-btn';
        btn.textContent = giorno;
        btn.dataset.weekday = GIORNI_SETTIMANA[index];
        
        if (customCalendarState.selectedWeekday === GIORNI_SETTIMANA[index]) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => selectCalendarWeekday(GIORNI_SETTIMANA[index]));
        grid.appendChild(btn);
    });
}

// Render Giorni del Mese
function renderCalendarDays(monthIndex) {
    const container = document.getElementById('cal-days-container');
    const header = document.getElementById('cal-month-header');
    const grid = document.getElementById('cal-days-grid');
    
    if (!container || !header || !grid) return;
    
    container.style.display = 'block';
    header.textContent = `${MESI_ITALIANI[monthIndex]} ${customCalendarState.currentYear}`;
    grid.innerHTML = '';
    
    const year = customCalendarState.currentYear;
    const month = monthIndex;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    
    for (let i = 0; i < startDay; i++) {
        const emptyBtn = document.createElement('div');
        emptyBtn.className = 'calendar-day-btn empty';
        grid.appendChild(emptyBtn);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const btn = document.createElement('button');
        btn.className = 'calendar-day-btn';
        btn.textContent = day;
        btn.dataset.day = day;
        
        const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
        const incidents = checkDayHasIncidents(dateStr);
        
        if (incidents > 0) {
            btn.classList.add('has-incidents');
            if (incidents >= 5) {
                btn.classList.add('high-incidents');
            }
            btn.title = `${incidents} incident${incidents > 1 ? 'i' : 'e'}`;
        }
        
        if (customCalendarState.selectedDay === day &&
            customCalendarState.selectedMonth === MESI_ITALIANI[monthIndex] &&
            customCalendarState.selectedYear === year) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => selectCalendarDay(day, monthIndex));
        grid.appendChild(btn);
    }
}

// Seleziona Anno
function selectCalendarYear(year) {
    customCalendarState.selectedYear = year;
    customCalendarState.currentYear = year;
    currentFilters['filter-anno'] = String(year);
    
    customCalendarState.selectedMonth = null;
    customCalendarState.selectedDay = null;
    delete currentFilters['filter-mese'];
    delete currentFilters['filter-data-selezionata'];
    
    const daysContainer = document.getElementById('cal-days-container');
    if (daysContainer) {
        daysContainer.style.display = 'none';
    }
    
    renderCalendarYear();
    renderCalendarMonths();
    updateCalendarFromState();
}

// Seleziona Mese
function selectCalendarMonth(mese, monthIndex) {
    if (customCalendarState.selectedMonth === mese && 
        customCalendarState.selectedYear === customCalendarState.currentYear) {
        customCalendarState.selectedMonth = null;
        delete currentFilters['filter-mese'];
        document.getElementById('cal-days-container').style.display = 'none';
    } else {
        customCalendarState.selectedYear = customCalendarState.currentYear;
        customCalendarState.selectedMonth = mese;
        currentFilters['filter-anno'] = String(customCalendarState.currentYear);
        currentFilters['filter-mese'] = mese;
        renderCalendarDays(monthIndex);
    }
    
    customCalendarState.selectedDay = null;
    delete currentFilters['filter-data-selezionata'];
    
    renderCalendarYear();
    renderCalendarMonths();
    updateCalendarFromState();
}

// Seleziona Giorno Settimana
function selectCalendarWeekday(weekday) {
    if (customCalendarState.selectedWeekday === weekday) {
        customCalendarState.selectedWeekday = null;
        delete currentFilters['filter-giorno-settimana'];
    } else {
        customCalendarState.selectedWeekday = weekday;
        currentFilters['filter-giorno-settimana'] = weekday;
    }
    
    renderCalendarWeekdays();
    updateCalendarFromState();
}

// Seleziona Giorno Specifico
function selectCalendarDay(day, monthIndex) {
    const year = customCalendarState.currentYear;
    const month = monthIndex + 1;
    const dateStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    
    if (customCalendarState.selectedDay === day) {
        customCalendarState.selectedDay = null;
        delete currentFilters['filter-data-selezionata'];
    } else {
        customCalendarState.selectedDay = day;
        customCalendarState.selectedYear = year;
        customCalendarState.selectedMonth = MESI_ITALIANI[monthIndex];
        
        currentFilters['filter-anno'] = String(year);
        currentFilters['filter-mese'] = MESI_ITALIANI[monthIndex];
        currentFilters['filter-data-selezionata'] = dateStr;
    }
    
    renderCalendarDays(monthIndex);
    updateCalendarFromState();
}

// Reset Calendario
function resetCustomCalendar() {
    customCalendarState.selectedYear = 2023;
    customCalendarState.currentYear = 2023;
    customCalendarState.selectedMonth = null;
    customCalendarState.selectedWeekday = null;
    customCalendarState.selectedDay = null;
    
    delete currentFilters['filter-mese'];
    delete currentFilters['filter-giorno-settimana'];
    delete currentFilters['filter-data-selezionata'];
    
    document.getElementById('cal-days-container').style.display = 'none';
    
    renderCalendarYear();
    renderCalendarMonths();
    renderCalendarWeekdays();
    updateCalendarFromState();
}

// Aggiorna Filtri e UI
function updateCalendarFromState() {
    const selectAnno = document.getElementById('filter-anno');
    const selectMese = document.getElementById('filter-mese');
    const selectGiornoSettimana = document.getElementById('filter-giorno-settimana');
    
    if (selectAnno) selectAnno.value = currentFilters['filter-anno'] || '';
    if (selectMese) selectMese.value = currentFilters['filter-mese'] || '';
    if (selectGiornoSettimana) selectGiornoSettimana.value = currentFilters['filter-giorno-settimana'] || '';
    
    updateCalendarSummary();
    
    updateAllFilters();
    updateMapData();
    updateStats();
    updateYearStats();
    updateLegendChart();
    updatePeriodSwitches();
    updateMonthlyInjuriesChart();
    updateMonthlyAreaChart();
    
    if (showClustering) {
        calculateTopLuoghi();
        updateTopLuoghiModalIfOpen();
    }
    
    const analyticsPanel = document.getElementById('analytics-panel');
    if (analyticsPanel && analyticsPanel.classList.contains('open')) {
        updateActiveFiltersDisplay();
        updateAnalytics();
    }
}

// Update Summary
function updateCalendarSummary() {
    const summary = document.getElementById('cal-selection-summary');
    if (!summary) return;
    
    const parts = [];
    
    if (customCalendarState.selectedDay) {
        parts.push(`<strong>Giorno:</strong> ${customCalendarState.selectedDay} ${customCalendarState.selectedMonth} ${customCalendarState.selectedYear}`);
    } else {
        if (customCalendarState.selectedYear) {
            parts.push(`<strong>Anno:</strong> ${customCalendarState.selectedYear}`);
        }
        if (customCalendarState.selectedMonth) {
            parts.push(`<strong>Mese:</strong> ${customCalendarState.selectedMonth}`);
        }
    }
    
    if (customCalendarState.selectedWeekday) {
        parts.push(`<strong>Giorno settimana:</strong> ${customCalendarState.selectedWeekday}`);
    }
    
    summary.innerHTML = parts.length > 0 ? parts.join(' • ') : 'Nessun filtro temporale attivo';
}

// Verifica dati mese
function checkMonthHasData(year, month) {
    return allIncidenti.some(row => {
        return row.Anno === year && row.Mese === MESI_ITALIANI[month - 1];
    });
}

// Verifica incidenti giorno
function checkDayHasIncidents(dateStr) {
    return allIncidenti.filter(row => row.Data === dateStr).length;
}

// Panoramica Charts
function updatePanoramicaCharts(data) {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                display: true,
                labels: {
                    color: '#f1f5f9',
                    font: { size: 10 }
                }
            },
            datalabels: {
                display: true,
                color: '#1e293b',
                font: {
                    weight: 'bold',
                    size: 9
                },
                formatter: (value) => value > 0 ? value : ''
            }
        }
    };
    
    const allYears = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
    const selectedYear = currentFilters['filter-anno'];
    
    const yearData = {};
    
    const tempFilters = {...currentFilters};
    delete tempFilters['filter-anno'];
    
    const dataForYearCount = allIncidenti.filter(row => {
        for (const [filterId, property] of Object.entries(filterConfig)) {
            if (filterId === 'filter-anno') continue;
            const value = tempFilters[filterId];
            if (!value) continue;

            const rowValue = row[property];
            
            if (String(rowValue) !== String(value)) return false;
        }
        return true;
    });
    
    dataForYearCount.forEach(row => {
        const year = String(row.Anno);
        if (year && allYears.includes(year)) {
            yearData[year] = (yearData[year] || 0) + 1;
        }
    });
    
    const incidenti2019NonMappati = 3192;
    yearData['2019'] = (yearData['2019'] || 0) + incidenti2019NonMappati;
    
    const counts = allYears.map(y => yearData[y] || 0);
    
    const pointBackgroundColors = allYears.map(y => y === selectedYear ? '#ef4444' : '#3b82f6');
    const pointBorderColors = allYears.map(y => y === selectedYear ? '#dc2626' : '#2563eb');
    const pointRadius = allYears.map(y => y === selectedYear ? 6 : 4);
    
    const trendCanvas = document.getElementById('chart-trend-annuale');
    if (trendCanvas) {
        if (analyticsCharts.trendAnnuale) analyticsCharts.trendAnnuale.destroy();
        analyticsCharts.trendAnnuale = new Chart(trendCanvas, {
            type: 'line',
            data: {
                labels: allYears,
                datasets: [{
                    label: 'Incidenti',
                    data: counts,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: pointBackgroundColors,
                    pointBorderColor: pointBorderColors,
                    pointRadius: pointRadius,
                    pointHoverRadius: 7
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    datalabels: {
                        display: true,
                        align: (context) => {
                            return context.dataIndex % 2 === 0 ? 'top' : 'bottom';
                        },
                        offset: 6,
                        color: (context) => {
                            const year = allYears[context.dataIndex];
                            return year === selectedYear ? '#ef4444' : '#1e293b';
                        },
                        font: { 
                            weight: 'bold', 
                            size: 9
                        },
                        backgroundColor: 'rgba(241, 245, 249, 0.95)',
                        borderRadius: 3,
                        padding: 3
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const year = allYears[context.dataIndex];
                                if (year === '2019') {
                                    return `Totale: ${context.parsed.y} (include ${incidenti2019NonMappati} non mappati)`;
                                }
                                return `Incidenti: ${context.parsed.y}`;
                            },
                            afterLabel: function(context) {
                                const year = allYears[context.dataIndex];
                                if (year === selectedYear) {
                                    return '(Anno selezionato)';
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    },
                    y: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    }
                },
                onClick: (e, items) => {
                    if (items.length > 0) {
                        const year = allYears[items[0].index];
                        const currentYear = currentFilters['filter-anno'];
                        
                        if (currentYear === String(year)) {
                            currentFilters['filter-anno'] = '';
                        } else {
                            currentFilters['filter-anno'] = String(year);
                        }
                        
                        const filterAnno = document.getElementById('filter-anno');
                        if (filterAnno) filterAnno.value = currentFilters['filter-anno'];
                        handleFilterChange('filter-anno', currentFilters['filter-anno']);
                    }
                }
            }
        });
        
        const chartContainer = trendCanvas.closest('.chart-container');
        if (chartContainer) {
            let existingNote = chartContainer.querySelector('.chart-note-2019');
            if (existingNote) {
                existingNote.remove();
            }
            
            const note = document.createElement('div');
            note.className = 'chart-note-2019';
            note.style.cssText = `
                margin-top: 8px;
                padding: 8px 12px;
                background: rgba(59, 130, 246, 0.1);
                border-left: 3px solid #3b82f6;
                border-radius: 4px;
                font-size: 10px;
                color: #94a3b8;
                font-style: italic;
                line-height: 1.4;
            `;
            note.innerHTML = `<strong style="color: #3b82f6;">* Nota 2019:</strong> Include 3.192 incidenti non mappati (assenza coordinate geografiche nel dataset).`;
            
            chartContainer.appendChild(note);
        }
    }
    
    // Altri grafici panoramici continuano nel prossimo artifact...
}

// ==========================================
// PARTE 9 - incidenti_part9
// ==========================================

// ==========================================
// PARTE 9: ANALYTICS CHARTS COMPLETI E EVENT LISTENERS
// ==========================================

// Continuazione Panoramica Charts (da Parte 8)
function updatePanoramicaCharts_continued(data) {
    // Tipologia Chart
    const tipoData = { M: 0, R: 0, F: 0, C: 0 };
    data.forEach(row => {
        if (row.Tipologia && tipoData.hasOwnProperty(row.Tipologia)) {
            tipoData[row.Tipologia]++;
        }
    });
    
    const tipologiaCanvas = document.getElementById('chart-tipologia');
    if (tipologiaCanvas) {
        if (analyticsCharts.tipologia) analyticsCharts.tipologia.destroy();
        analyticsCharts.tipologia = new Chart(tipologiaCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Mortale', 'Riserva', 'Feriti', 'Cose'],
                datasets: [{
                    data: [tipoData.M, tipoData.R, tipoData.F, tipoData.C],
                    backgroundColor: ['#ef4444', '#a855f7', '#f59e0b', '#10b981']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true,
                        labels: {
                            color: '#f1f5f9',
                            font: { size: 10 }
                        }
                    },
                    datalabels: {
                        display: true,
                        color: '#1e293b',
                        font: { weight: 'bold', size: 10 },
                        formatter: (value, ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return value > 0 ? `${value}\n(${percentage}%)` : '';
                        },
                        backgroundColor: 'rgba(241, 245, 249, 0.95)',
                        borderRadius: 3,
                        padding: 4
                    }
                },
                onClick: (e, items) => {
                    if (items.length > 0) {
                        const tipos = ['M', 'R', 'F', 'C'];
                        const tipo = tipos[items[0].index];
                        filterByTipologia(tipo);
                    }
                }
            }
        });
    }
    
    // Stagionale Chart
    const stagioneData = {};
    data.forEach(row => {
        const stagione = row.Stagione;
        if (stagione) {
            stagioneData[stagione] = (stagioneData[stagione] || 0) + 1;
        }
    });
    
    const stagioni = ['Primavera', 'Estate', 'Autunno', 'Inverno'];
    const stagioniCounts = stagioni.map(s => stagioneData[s] || 0);
    
    const stagionaleCanvas = document.getElementById('chart-stagionale');
    if (stagionaleCanvas) {
        if (analyticsCharts.stagionale) analyticsCharts.stagionale.destroy();
        analyticsCharts.stagionale = new Chart(stagionaleCanvas, {
            type: 'bar',
            data: {
                labels: stagioni,
                datasets: [{
                    label: 'Incidenti',
                    data: stagioniCounts,
                    backgroundColor: ['#10b981', '#f59e0b', '#a855f7', '#3b82f6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        offset: 2,
                        color: '#1e293b',
                        font: { weight: 'bold', size: 10 },
                        backgroundColor: 'rgba(241, 245, 249, 0.95)',
                        borderRadius: 3,
                        padding: 3
                    }
                },
                scales: {
                    x: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    },
                    y: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }
    
    // Feriale Weekend Chart
    const ferialeData = {};
    data.forEach(row => {
        const tipo = row['Feriale/Weekend'];
        if (tipo) {
            ferialeData[tipo] = (ferialeData[tipo] || 0) + 1;
        }
    });
    
    const ferialeCanvas = document.getElementById('chart-feriale-weekend');
    if (ferialeCanvas) {
        if (analyticsCharts.ferialeWeekend) analyticsCharts.ferialeWeekend.destroy();
        analyticsCharts.ferialeWeekend = new Chart(ferialeCanvas, {
            type: 'bar',
            data: {
                labels: Object.keys(ferialeData),
                datasets: [{
                    label: 'Incidenti',
                    data: Object.values(ferialeData),
                    backgroundColor: ['#3b82f6', '#8b5cf6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        offset: 2,
                        color: '#1e293b',
                        font: { weight: 'bold', size: 10 },
                        backgroundColor: 'rgba(241, 245, 249, 0.95)',
                        borderRadius: 3,
                        padding: 3
                    }
                },
                scales: {
                    x: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    },
                    y: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }
}

// Temporale Charts
function updateTemporaleCharts(data) {
    const giornoData = {};
    data.forEach(row => {
        const giorno = row['Giorno settimana'];
        if (giorno) {
            giornoData[giorno] = (giornoData[giorno] || 0) + 1;
        }
    });
    
    const giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    const giorniCounts = giorni.map(g => giornoData[g] || 0);
    
    const giornoCanvas = document.getElementById('chart-giorno-settimana');
    if (giornoCanvas) {
        if (analyticsCharts.giornoSettimana) analyticsCharts.giornoSettimana.destroy();
        analyticsCharts.giornoSettimana = new Chart(giornoCanvas, {
            type: 'bar',
            data: {
                labels: giorni,
                datasets: [{
                    label: 'Incidenti',
                    data: giorniCounts,
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        offset: 2,
                        color: '#1e293b',
                        font: { weight: 'bold', size: 9 },
                        backgroundColor: 'rgba(241, 245, 249, 0.95)',
                        borderRadius: 3,
                        padding: 3
                    }
                },
                scales: {
                    x: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    },
                    y: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }
    
    // Evoluzione anni
    const yearDataConFeriti = {};
    const yearDataSenzaFeriti = {};
    
    data.forEach(row => {
        const year = row.Anno;
        const tipo = row.Tipologia;
        if (year) {
            if (tipo === 'F' || tipo === 'R' || tipo === 'M') {
                yearDataConFeriti[year] = (yearDataConFeriti[year] || 0) + 1;
            } else {
                yearDataSenzaFeriti[year] = (yearDataSenzaFeriti[year] || 0) + 1;
            }
        }
    });
    
    const years = [...new Set([...Object.keys(yearDataConFeriti), ...Object.keys(yearDataSenzaFeriti)])].sort();
    
    const evoluzioneCanvas = document.getElementById('chart-evoluzione-anni');
    if (evoluzioneCanvas) {
        if (analyticsCharts.evoluzioneAnni) analyticsCharts.evoluzioneAnni.destroy();
        analyticsCharts.evoluzioneAnni = new Chart(evoluzioneCanvas, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Con Feriti',
                        data: years.map(y => yearDataConFeriti[y] || 0),
                        backgroundColor: '#ef4444'
                    },
                    {
                        label: 'Senza Feriti',
                        data: years.map(y => yearDataSenzaFeriti[y] || 0),
                        backgroundColor: '#10b981'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { 
                        stacked: true,
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    },
                    y: { 
                        stacked: true,
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#f1f5f9',
                            font: { size: 10 }
                        }
                    },
                    datalabels: {
                        display: false
                    }
                }
            }
        });
    }
}

// Oraria Charts
function updateOrariaCharts(data) {
    const fasciaData = {};
    data.forEach(row => {
        const fascia = row['Fascia oraria dettagliata (6 fasce)'];
        if (fascia) {
            fasciaData[fascia] = (fasciaData[fascia] || 0) + 1;
        }
    });
    
    const fasce = ['Alba', 'Mattina', 'Pranzo', 'Pomeriggio', 'Sera', 'Notte'];
    const fascePresenti = fasce.filter(f => fasciaData[f]);
    const fasceCounts = fascePresenti.map(f => fasciaData[f]);
    
    const fasciaCanvas = document.getElementById('chart-fascia-oraria');
    if (fasciaCanvas) {
        if (analyticsCharts.fasciaOraria) analyticsCharts.fasciaOraria.destroy();
        analyticsCharts.fasciaOraria = new Chart(fasciaCanvas, {
            type: 'polarArea',
            data: {
                labels: fascePresenti,
                datasets: [{
                    data: fasceCounts,
                    backgroundColor: ['#fbbf24', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#1e3a8a']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true,
                        labels: {
                            color: '#f1f5f9',
                            font: { size: 10 }
                        }
                    },
                    datalabels: {
                        display: true,
                        color: '#1e293b',
                        font: { weight: 'bold', size: 10 },
                        formatter: (value, ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value}\n${percentage}%`;
                        },
                        backgroundColor: 'rgba(241, 245, 249, 0.95)',
                        borderRadius: 3,
                        padding: 3
                    }
                },
                scales: {
                    r: {
                        ticks: { 
                            color: '#94a3b8', 
                            backdropColor: 'transparent',
                            font: { size: 9 }
                        },
                        grid: { color: 'rgba(148, 163, 184, 0.2)' }
                    }
                }
            }
        });
    }
    
    // Top incidenti e feriti per fascia
    const sortedFasce = Object.entries(fasciaData).sort((a, b) => b[1] - a[1]).slice(0, 3);
    
    const topIncidentiCanvas = document.getElementById('chart-top-incidenti');
    if (topIncidentiCanvas) {
        if (analyticsCharts.topIncidenti) analyticsCharts.topIncidenti.destroy();
        analyticsCharts.topIncidenti = new Chart(topIncidentiCanvas, {
            type: 'bar',
            data: {
                labels: sortedFasce.map(f => f[0]),
                datasets: [{
                    label: 'Incidenti',
                    data: sortedFasce.map(f => f[1]),
                    backgroundColor: '#ef4444'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'right',
                        offset: 4,
                        color: '#1e293b',
                        font: { weight: 'bold', size: 10 },
                        backgroundColor: 'rgba(241, 245, 249, 0.95)',
                        borderRadius: 3,
                        padding: 3
                    }
                },
                scales: {
                    x: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    },
                    y: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }
    
    const feritiData = {};
    data.forEach(row => {
        const fascia = row['Fascia oraria dettagliata (6 fasce)'];
        const tipo = row.Tipologia;
        if (fascia && (tipo === 'F' || tipo === 'R' || tipo === 'M')) {
            feritiData[fascia] = (feritiData[fascia] || 0) + 1;
        }
    });
    
    const sortedFeriti = Object.entries(feritiData).sort((a, b) => b[1] - a[1]).slice(0, 3);
    
    const topFeritiCanvas = document.getElementById('chart-top-feriti');
    if (topFeritiCanvas) {
        if (analyticsCharts.topFeriti) analyticsCharts.topFeriti.destroy();
        analyticsCharts.topFeriti = new Chart(topFeritiCanvas, {
            type: 'bar',
            data: {
                labels: sortedFeriti.map(f => f[0]),
                datasets: [{
                    label: 'Incidenti con Feriti',
                    data: sortedFeriti.map(f => f[1]),
                    backgroundColor: '#a855f7'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'right',
                        offset: 4,
                        color: '#1e293b',
                        font: { weight: 'bold', size: 10 },
                        backgroundColor: 'rgba(241, 245, 249, 0.95)',
                        borderRadius: 3,
                        padding: 3
                    }
                },
                scales: {
                    x: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    },
                    y: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }
}

// Condizioni Charts
function updateCondizioniCharts(data) {
    const luceData = {};
    data.forEach(row => {
        const luce = row['Giorno/Notte'];
        if (luce) {
            luceData[luce] = (luceData[luce] || 0) + 1;
        }
    });
    
    const luceBuioCanvas = document.getElementById('chart-luce-buio');
    if (luceBuioCanvas) {
        if (analyticsCharts.luceBuio) analyticsCharts.luceBuio.destroy();
        analyticsCharts.luceBuio = new Chart(luceBuioCanvas, {
            type: 'doughnut',
            data: {
                labels: Object.keys(luceData),
                datasets: [{
                    data: Object.values(luceData),
                    backgroundColor: ['#fbbf24', '#1e3a8a']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true,
                        labels: {
                            color: '#f1f5f9',
                            font: { size: 10 }
                        }
                    },
                    datalabels: {
                        display: true,
                        color: '#1e293b',
                        font: { weight: 'bold', size: 10 },
                        formatter: (value, ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value}\n(${percentage}%)`;
                        },
                        backgroundColor: 'rgba(241, 245, 249, 0.95)',
                        borderRadius: 3,
                        padding: 4
                    }
                }
            }
        });
    }
    
    const condizioniData = {};
    data.forEach(row => {
        const cond = row['Condizioni luce (Visibilità)'];
        if (cond) {
            condizioniData[cond] = (condizioniData[cond] || 0) + 1;
        }
    });
    
    const condizioniCanvas = document.getElementById('chart-condizioni-dettaglio');
    if (condizioniCanvas) {
        if (analyticsCharts.condizioniDettaglio) analyticsCharts.condizioniDettaglio.destroy();
        analyticsCharts.condizioniDettaglio = new Chart(condizioniCanvas, {
            type: 'bar',
            data: {
                labels: Object.keys(condizioniData),
                datasets: [{
                    label: 'Incidenti',
                    data: Object.values(condizioniData),
                    backgroundColor: '#8b5cf6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        offset: 2,
                        color: '#1e293b',
                        font: { weight: 'bold', size: 9 },
                        backgroundColor: 'rgba(241, 245, 249, 0.95)',
                        borderRadius: 3,
                        padding: 3
                    }
                },
                scales: {
                    x: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    },
                    y: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }
    
    const stagioniCondizioniData = {};
    data.forEach(row => {
        const stagione = row.Stagione;
        const luce = row['Giorno/Notte'];
        if (stagione && luce) {
            if (!stagioniCondizioniData[stagione]) {
                stagioniCondizioniData[stagione] = {};
            }
            stagioniCondizioniData[stagione][luce] = (stagioniCondizioniData[stagione][luce] || 0) + 1;
        }
    });
    
    const stagioni = ['Primavera', 'Estate', 'Autunno', 'Inverno'];
    const giornoData = stagioni.map(s => (stagioniCondizioniData[s] && stagioniCondizioniData[s]['Giorno']) || 0);
    const notteData = stagioni.map(s => (stagioniCondizioniData[s] && stagioniCondizioniData[s]['Notte']) || 0);
    
    const stagioniCondizioniCanvas = document.getElementById('chart-stagioni-condizioni');
    if (stagioniCondizioniCanvas) {
        if (analyticsCharts.stagioniCondizioni) analyticsCharts.stagioniCondizioni.destroy();
        analyticsCharts.stagioniCondizioni = new Chart(stagioniCondizioniCanvas, {
            type: 'bar',
            data: {
                labels: stagioni,
                datasets: [
                    {
                        label: 'Giorno',
                        data: giornoData,
                        backgroundColor: '#fbbf24'
                    },
                    {
                        label: 'Notte',
                        data: notteData,
                        backgroundColor: '#1e3a8a'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#f1f5f9',
                            font: { size: 10 }
                        }
                    },
                    datalabels: {
                        display: false
                    }
                },
                scales: {
                    x: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    },
                    y: { 
                        ticks: { 
                            color: '#94a3b8',
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }
}

// Update Insights
function updateInsights(data) {
    const totalIncidenti = data.length;
    const totalFeriti = data.filter(r => r.Tipologia === 'F' || r.Tipologia === 'R' || r.Tipologia === 'M').length;
    const percentualeFeriti = totalIncidenti > 0 ? ((totalFeriti / totalIncidenti) * 100).toFixed(1) : 0;
    const mediaFeriti = totalIncidenti > 0 ? (totalFeriti / totalIncidenti).toFixed(2) : 0;
    
    const realtimeTotal = document.getElementById('realtime-total');
    const realtimeFeriti = document.getElementById('realtime-feriti');
    const realtimePercentuale = document.getElementById('realtime-percentuale');
    const realtimeMedia = document.getElementById('realtime-media');
    
    if (realtimeTotal) realtimeTotal.textContent = totalIncidenti.toLocaleString('it-IT');
    if (realtimeFeriti) realtimeFeriti.textContent = totalFeriti.toLocaleString('it-IT');
    if (realtimePercentuale) realtimePercentuale.textContent = percentualeFeriti + '%';
    if (realtimeMedia) realtimeMedia.textContent = mediaFeriti;
    
    const giornoData = {};
    data.forEach(row => {
        const giorno = row['Giorno settimana'];
        if (giorno) {
            giornoData[giorno] = (giornoData[giorno] || 0) + 1;
        }
    });
    const giornoPericoloso = Object.entries(giornoData).sort((a, b) => b[1] - a[1])[0];
    const insightGiorno = document.getElementById('insight-giorno');
    if (insightGiorno) {
        insightGiorno.textContent = giornoPericoloso ? `${giornoPericoloso[0]} (${giornoPericoloso[1]} incidenti)` : '-';
    }
    
    const fasciaData = {};
    data.forEach(row => {
        const fascia = row['Fascia oraria dettagliata (6 fasce)'];
        if (fascia) {
            fasciaData[fascia] = (fasciaData[fascia] || 0) + 1;
        }
    });
    const fasciaCritica = Object.entries(fasciaData).sort((a, b) => b[1] - a[1])[0];
    const insightFascia = document.getElementById('insight-fascia');
    if (insightFascia) {
        insightFascia.textContent = fasciaCritica ? `${fasciaCritica[0]} (${fasciaCritica[1]} incidenti)` : '-';
    }
    
    const stagioneData = {};
    data.forEach(row => {
        const stagione = row.Stagione;
        if (stagione) {
            stagioneData[stagione] = (stagioneData[stagione] || 0) + 1;
        }
    });
    const stagioneRischiosa = Object.entries(stagioneData).sort((a, b) => b[1] - a[1])[0];
    const insightStagione = document.getElementById('insight-stagione');
    if (insightStagione) {
        insightStagione.textContent = stagioneRischiosa ? `${stagioneRischiosa[0]} (${stagioneRischiosa[1]} incidenti)` : '-';
    }
    
    const condizioneData = {};
    data.forEach(row => {
        const cond = row['Condizioni luce (Visibilità)'];
        if (cond) {
            condizioneData[cond] = (condizioneData[cond] || 0) + 1;
        }
    });
    const condizionePericolosa = Object.entries(condizioneData).sort((a, b) => b[1] - a[1])[0];
    const insightCondizione = document.getElementById('insight-condizione');
    if (insightCondizione) {
        insightCondizione.textContent = condizionePericolosa ? `${condizionePericolosa[0]} (${condizionePericolosa[1]} incidenti)` : '-';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    function addTouchClickListener(element, handler) {
        if (!element) return;
        
        let touchStartTime = 0;
        let touchMoved = false;
        
        element.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchMoved = false;
        }, { passive: true });
        
        element.addEventListener('touchmove', () => {
            touchMoved = true;
        }, { passive: true });
        
        element.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            if (!touchMoved && touchDuration < 500) {
                e.preventDefault();
                handler(e);
            }
        });
        
        element.addEventListener('click', handler);
    }
    
    const btnResetCharts = document.getElementById('btn-reset-charts');
    if (btnResetCharts) addTouchClickListener(btnResetCharts, resetChartsFilters);
    
    const switchGiorno = document.getElementById('switch-giorno');
    const switchNotte = document.getElementById('switch-notte');
    if (switchGiorno) {
        addTouchClickListener(switchGiorno, () => {
            filterByDayNight('Giorno');
        });
    }
    if (switchNotte) {
        addTouchClickListener(switchNotte, () => {
            filterByDayNight('Notte');
        });
    }
    
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (mobileToggle) addTouchClickListener(mobileToggle, toggleSidebar);
    if (sidebarOverlay) addTouchClickListener(sidebarOverlay, closeSidebar);
    
    document.querySelectorAll('.filter-section-header').forEach(header => {
        addTouchClickListener(header, () => {
            const section = header.dataset.section;
            toggleSection(section);
        });
    });
    
    const yearStatsGrid = document.getElementById('year-stats-grid');
    if (yearStatsGrid) {
        yearStatsGrid.addEventListener('click', (e) => {
            const item = e.target.closest('.year-stat-item, .year-stat-item-all');
            if (!item) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const year = item.dataset.year;
            
            if (year === '2019') {
                show2019InfoPopup();
                setTimeout(() => filterByYear(year), 100);
            } else {
                filterByYear(year);
            }
        });
        
        yearStatsGrid.addEventListener('touchstart', (e) => {
            const item = e.target.closest('.year-stat-item, .year-stat-item-all');
            if (item) {
                item.style.opacity = '0.7';
            }
        }, { passive: true });
        
        yearStatsGrid.addEventListener('touchend', (e) => {
            const item = e.target.closest('.year-stat-item, .year-stat-item-all');
            if (item) {
                item.style.opacity = '';
            }
        }, { passive: true });
        
        yearStatsGrid.addEventListener('touchcancel', (e) => {
            const item = e.target.closest('.year-stat-item, .year-stat-item-all');
            if (item) {
                item.style.opacity = '';
            }
        }, { passive: true });
    }
    
    document.querySelectorAll('.legend-item').forEach(item => {
        addTouchClickListener(item, () => {
            const tipo = item.dataset.tipo;
            filterByTipologia(tipo);
        });
    });
    
    const buttonsConfig = [
        { id: 'btn-toggle-heatmap', handler: toggleHeatmap },
        { id: 'btn-heatmap-map', handler: toggleHeatmap },
        { id: 'btn-reset', handler: resetFilters },
        { id: 'btn-reset-map', handler: resetFilters },
        { id: 'btn-data-table', handler: openDataTable },
        { id: 'btn-data-table-map', handler: openDataTable },
        { id: 'btn-analytics', handler: openAnalytics },
        { id: 'btn-analytics-map', handler: openAnalytics }
    ];
    
    buttonsConfig.forEach(config => {
        const btn = document.getElementById(config.id);
        if (btn) addTouchClickListener(btn, config.handler);
    });
    
    const basemapSelect = document.getElementById('basemap-select');
    if (basemapSelect) basemapSelect.addEventListener('change', changeBasemap);
    
    const infoIconBtn = document.getElementById('info-icon-btn');
    if (infoIconBtn) addTouchClickListener(infoIconBtn, () => {
        const modal = document.getElementById('info-modal');
        if (modal) modal.classList.add('show');
    });
    
    const modalsConfig = [
        { id: 'info-modal-close', modalId: 'info-modal' },
        { id: 'data-table-close', handler: closeDataTable },
        { id: 'detail-close', handler: closeDetailPanel },
        { id: 'analytics-close', handler: closeAnalytics }
    ];
    
    modalsConfig.forEach(config => {
        const btn = document.getElementById(config.id);
        if (btn) {
            if (config.handler) {
                addTouchClickListener(btn, config.handler);
            } else {
                addTouchClickListener(btn, () => {
                    const modal = document.getElementById(config.modalId);
                    if (modal) modal.classList.remove('show');
                });
            }
        }
    });
    
    document.querySelectorAll('.analytics-tab').forEach(tab => {
        addTouchClickListener(tab, () => {
            const tabName = tab.dataset.tab;
            switchAnalyticsTab(tabName);
        });
    });
    
    const btnDownloadCSV = document.getElementById('btn-download-csv');
    if (btnDownloadCSV) addTouchClickListener(btnDownloadCSV, downloadCSV);
    
    const btnDownloadJSON = document.getElementById('btn-download-json');
    if (btnDownloadJSON) addTouchClickListener(btnDownloadJSON, downloadJSON);
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
    
    document.addEventListener('touchend', (e) => {
        if (e.target.closest('button, .legend-item, .year-stat-item, .year-stat-item-all')) {
            e.preventDefault();
        }
    }, { passive: false });
    
    const btnClustering = document.getElementById('btn-clustering-map');
    if (btnClustering) addTouchClickListener(btnClustering, toggleClustering);

    const btnTopLuoghi = document.getElementById('btn-top-luoghi-map');
    if (btnTopLuoghi) addTouchClickListener(btnTopLuoghi, openTopLuoghiModal);

    const btnTopLuoghiClose = document.getElementById('top-luoghi-close');
    if (btnTopLuoghiClose) addTouchClickListener(btnTopLuoghiClose, closeTopLuoghiModal);

    const btnDownloadLuoghi = document.getElementById('btn-download-luoghi-csv');
    if (btnDownloadLuoghi) addTouchClickListener(btnDownloadLuoghi, downloadTopLuoghiCSV);
}

// Initialize App
init();
