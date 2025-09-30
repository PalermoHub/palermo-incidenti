// Global Variables
let map;
let allIncidenti = [];
let currentFilters = {};
let showHeatmap = false;
let analyticsCharts = {};

// Register Chart.js plugins globally
Chart.register(ChartDataLabels);

// Unregister datalabels by default (we'll enable it per chart)
Chart.defaults.set('plugins.datalabels', {
    display: false
});

const colorMap = {
    'M': '#ef4444',  // Rosso - Mortale
    'R': '#a855f7',  // Viola - Riserva  
    'F': '#f59e0b',  // Ambra - Feriti
    'C': '#10b981'   // Verde - Cose
};

const basemapStyles = {
    'carto-dark': {
        version: 8,
        sources: {
            'carto': {
                type: 'raster',
                tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© CARTO'
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
        sources: {
            'osm': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
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
        sources: {
            'satellite': {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'],
                tileSize: 256,
                attribution: '© Google'
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
        sources: {
            'carto': {
                type: 'raster',
                tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© CARTO'
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

// Initialization
async function init() {
    try {
        console.log('Inizio caricamento CSV...');
        document.getElementById('loading').innerHTML = '<div>Caricamento CSV...</div><small>Download in corso</small>';
        
        await loadCSV();
        
        console.log('CSV caricato, inizializzazione mappa...');
        document.getElementById('loading').innerHTML = '<div>Creazione mappa...</div><small>Attendere</small>';
        
        initMap();
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

// Map Initialization
function initMap() {
    const palermoBounds = [
        [13.20, 38.00],
        [13.50, 38.25]
    ];
    
    map = new maplibregl.Map({
        container: 'map',
        style: basemapStyles['carto-dark'],
        center: [13.3614, 38.1157],
        zoom: 11,
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
                    center: [13.3614, 38.1157],
                    zoom: 10,
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
            link.href = 'https://opendatasicilia.it/';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.title = 'OpenDataSicilia';
            
            const img = document.createElement('img');
            img.src = 'https://palermohub.opendatasicilia.it/lib/images/opendatasicilia.png';
            img.alt = 'OpenDataSicilia';
            
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
            updateLegendActiveState();
            console.log('Inizializzazione completata!');
        } catch (error) {
            console.error('Errore durante inizializzazione:', error);
        } finally {
            document.getElementById('loading').classList.add('hidden');
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

// Get Filtered Data
function getFilteredData() {
    return allIncidenti.filter(row => {
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

    if (filterDependencies[filterId]) {
        filterDependencies[filterId].forEach(dependentId => {
            currentFilters[dependentId] = '';
            document.getElementById(dependentId).value = '';
        });
    }

    updateAllFilters();
    updateMapData();
    
    if (filterId === 'filter-circoscrizione' || filterId === 'filter-quartiere') {
        zoomToFilteredArea();
    }

    updateStats();
    updateYearStats();
    updateLegendActiveState();
    
    // Update analytics if panel is open
    if (document.getElementById('analytics-panel').classList.contains('open')) {
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

// Update Map Data
function updateMapData() {
    const geojson = createGeoJSON();
    console.log(`Aggiornamento mappa con ${geojson.features.length} features`);
    map.getSource('incidenti').setData(geojson);
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

    document.getElementById('stat-mortale').textContent = stats.M.toLocaleString('it-IT');
    document.getElementById('stat-riserva').textContent = stats.R.toLocaleString('it-IT');
    document.getElementById('stat-feriti').textContent = stats.F.toLocaleString('it-IT');
    document.getElementById('stat-cose').textContent = stats.C.toLocaleString('it-IT');
    document.getElementById('stat-total').textContent = (stats.M + stats.R + stats.F + stats.C).toLocaleString('it-IT');
    
    const annoFiltrato = currentFilters['filter-anno'];
    const labelTotale = document.querySelector('.stat-total .stat-label');
    if (annoFiltrato) {
        labelTotale.textContent = `Totale Incidenti (${annoFiltrato})`;
    } else {
        labelTotale.textContent = 'Totale Incidenti';
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
    
    // AGGIUNGI 3192 incidenti del 2019 non mappati
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
    
    document.getElementById('year-stats-grid').innerHTML = gridHtml;
}

// Show 2019 Info Popup
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
    
    popup.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
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

// Filter By Year
function filterByYear(year) {
    const currentYear = currentFilters['filter-anno'];
    
    if (currentYear === String(year)) {
        currentFilters['filter-anno'] = '';
    } else {
        currentFilters['filter-anno'] = String(year);
    }
    
    document.getElementById('filter-anno').value = currentFilters['filter-anno'];
    
    updateAllFilters();
    updateMapData();
    updateStats();
    updateYearStats();
    
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
    
    if (document.getElementById('analytics-panel').classList.contains('open')) {
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
    
    document.getElementById('filter-tipologia').value = currentFilters['filter-tipologia'];
    
    updateAllFilters();
    updateMapData();
    updateStats();
    updateYearStats();
    updateLegendActiveState();
    
    if (document.getElementById('analytics-panel').classList.contains('open')) {
        updateAnalytics();
    }
}

// Update Legend Active State
function updateLegendActiveState() {
    const selectedTipo = currentFilters['filter-tipologia'];
    
    const legendItems = document.querySelectorAll('.legend-item');
    if (!legendItems || legendItems.length === 0) return;
    
    legendItems.forEach(item => {
        item.classList.remove('active');
    });
    
    if (selectedTipo === '') {
        const allItem = document.querySelector('.legend-item[data-tipo=""]');
        if (allItem) allItem.classList.add('active');
    } else {
        const specificItem = document.querySelector(`.legend-item[data-tipo="${selectedTipo}"]`);
        if (specificItem) specificItem.classList.add('active');
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

// Toggle Heatmap
function toggleHeatmap() {
    showHeatmap = !showHeatmap;
    const btn = document.getElementById('btn-toggle-heatmap');
    const btnMap = document.getElementById('btn-heatmap-map');
    
    if (showHeatmap) {
        map.setLayoutProperty('incidenti-heatmap', 'visibility', 'visible');
        ['C', 'F', 'R', 'M'].forEach(tipo => {
            map.setLayoutProperty(`incidenti-${tipo}`, 'visibility', 'none');
        });
        btn.textContent = '🔵 Localizzazione incidenti';
        btn.classList.add('active');
        btnMap.textContent = '🔵 Punti';
        btnMap.classList.add('active');
        document.getElementById('points-legend').classList.add('hidden');
        document.getElementById('heatmap-legend').classList.remove('hidden');
    } else {
        map.setLayoutProperty('incidenti-heatmap', 'visibility', 'none');
        ['C', 'F', 'R', 'M'].forEach(tipo => {
            map.setLayoutProperty(`incidenti-${tipo}`, 'visibility', 'visible');
        });
        btn.textContent = '🔥 Mappa di Calore';
        btn.classList.remove('active');
        btnMap.textContent = '🔥 Calore';
        btnMap.classList.remove('active');
        document.getElementById('points-legend').classList.remove('hidden');
        document.getElementById('heatmap-legend').classList.add('hidden');
    }
}

// Change Basemap
function changeBasemap() {
    const selectedBasemap = document.getElementById('basemap-select').value;
    const currentStyle = basemapStyles[selectedBasemap];
    
    const sourceData = map.getSource('incidenti')._data;
    const heatmapVisibility = map.getLayoutProperty('incidenti-heatmap', 'visibility');
    const circleVisibility = {};
    ['C', 'F', 'R', 'M'].forEach(tipo => {
        circleVisibility[tipo] = map.getLayoutProperty(`incidenti-${tipo}`, 'visibility');
    });

    const newStyle = JSON.parse(JSON.stringify(currentStyle));
    
    newStyle.sources['incidenti'] = {
        type: 'geojson',
        data: sourceData
    };
    
    newStyle.layers.push({
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
            visibility: heatmapVisibility
        }
    });

    ['C', 'F', 'R', 'M'].forEach(tipo => {
        newStyle.layers.push({
            id: `incidenti-${tipo}`,
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
                'circle-stroke-color': '#fff'
            },
            layout: {
                visibility: circleVisibility[tipo]
            }
        });
    });

    map.setStyle(newStyle);

    map.once('styledata', () => {
        ['C', 'F', 'R', 'M'].forEach(tipo => {
            setupLayerInteractions(`incidenti-${tipo}`);
        });
    });
}

// Reset Filters
function resetFilters() {
    currentFilters = {};
    document.querySelectorAll('select').forEach(select => {
        select.value = '';
        select.disabled = false;
    });
    
    currentFilters['filter-anno'] = '2023';
    
    updateAllFilters();
    updateMapData();
    updateStats();
    updateYearStats();
    updateLegendActiveState();

    map.flyTo({
        center: [13.3614, 38.1157],
        zoom: 11,
        duration: 1000,
        padding: { top: 80, bottom: 80, left: 50, right: 50 }
    });
    
    if (document.getElementById('analytics-panel').classList.contains('open')) {
        updateAnalytics();
    }
}

// Toggle Section
function toggleSection(sectionId) {
    const content = document.getElementById(`content-${sectionId}`);
    const header = document.querySelector(`[data-section="${sectionId}"]`);
    const toggle = header.querySelector('.toggle-icon');
    
    content.classList.toggle('collapsed');
    toggle.classList.toggle('collapsed');
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobile-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('open');
    toggle.classList.toggle('active');
    
    if (sidebar.classList.contains('open')) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobile-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.remove('open');
    toggle.classList.remove('active');
    overlay.classList.remove('show');
}

// Open Detail Panel
function openDetailPanel(properties) {
    const panel = document.getElementById('detail-panel');
    const content = document.getElementById('detail-content');
    
    const tipologiaNames = {
        'M': 'Mortale',
        'R': 'Riserva',
        'F': 'Feriti',
        'C': 'Cose'
    };
    
    const tipologiaIcons = {
        'M': '💀',
        'R': '🚑',
        'F': '🤕',
        'C': '🔧'
    };
    
    document.getElementById('detail-tipo-icon').textContent = tipologiaIcons[properties.Tipologia] || '🚗';
    document.getElementById('detail-subtitle').textContent = `Incidente del ${properties.Data || 'Data non disponibile'}`;
    
    let html = '';
    
    html += `
        <div class="detail-section">
            <h3>⚠️ Tipologia e Gravità</h3>
            <div class="detail-row">
                <span class="detail-label">Tipo Incidente</span>
                <span class="tipo-badge ${properties.Tipologia}">${properties.Tipologia} - ${tipologiaNames[properties.Tipologia]}</span>
            </div>
        </div>
    `;
    
    html += '<div class="detail-section"><h3>📅 Quando è Avvenuto</h3>';
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
    
    html += '<div class="detail-section"><h3>📍 Dove è Avvenuto</h3>';
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
    
    html += '<div class="detail-section"><h3>🌤️ Condizioni Ambientali</h3>';
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
    panel.classList.remove('open');
}

// Analytics Functions
function openAnalytics() {
    const panel = document.getElementById('analytics-panel');
    panel.classList.add('open');
    updateActiveFiltersDisplay();
    updateAnalytics();
}

function closeAnalytics() {
    const panel = document.getElementById('analytics-panel');
    panel.classList.remove('open');
}

function updateActiveFiltersDisplay() {
    const filteredData = getFilteredData();
    const totalData = allIncidenti.length;
    
    let filterText = [];
    
    // Check each filter
    if (currentFilters['filter-anno']) {
        filterText.push(`Anno: ${currentFilters['filter-anno']}`);
    }
    
    if (currentFilters['filter-tipologia']) {
        const tipologiaNames = { 'M': 'Mortale', 'R': 'Riserva', 'F': 'Feriti', 'C': 'Cose' };
        filterText.push(`Tipologia: ${tipologiaNames[currentFilters['filter-tipologia']]}`);
    }
    
    if (currentFilters['filter-circoscrizione']) {
        filterText.push(`Circoscrizione: ${currentFilters['filter-circoscrizione']}`);
    }
    
    if (currentFilters['filter-quartiere']) {
        filterText.push(`Quartiere: ${currentFilters['filter-quartiere']}`);
    }
    
    if (currentFilters['filter-upl']) {
        filterText.push(`UPL: ${currentFilters['filter-upl']}`);
    }
    
    if (currentFilters['filter-stagione']) {
        filterText.push(`Stagione: ${currentFilters['filter-stagione']}`);
    }
    
    if (currentFilters['filter-mese']) {
        filterText.push(`Mese: ${currentFilters['filter-mese']}`);
    }
    
    if (currentFilters['filter-giorno-settimana']) {
        filterText.push(`Giorno: ${currentFilters['filter-giorno-settimana']}`);
    }
    
    if (currentFilters['filter-feriale-weekend']) {
        filterText.push(`${currentFilters['filter-feriale-weekend']}`);
    }
    
    if (currentFilters['filter-giorno-notte']) {
        filterText.push(`${currentFilters['filter-giorno-notte']}`);
    }
    
    if (currentFilters['filter-condizioni-luce']) {
        filterText.push(`Luce: ${currentFilters['filter-condizioni-luce']}`);
    }
    
    if (currentFilters['filter-fascia-4']) {
        filterText.push(`Fascia: ${currentFilters['filter-fascia-4']}`);
    }
    
    if (currentFilters['filter-fascia-6']) {
        filterText.push(`Fascia: ${currentFilters['filter-fascia-6']}`);
    }
    
    if (currentFilters['filter-ora-punta']) {
        filterText.push(`${currentFilters['filter-ora-punta']}`);
    }
    
    // Build display text
    let displayHTML = '';
    
    if (filterText.length === 0) {
        displayHTML = `Tutti gli incidenti (2015-2023) • ${totalData.toLocaleString('it-IT')} incidenti totali`;
    } else {
        displayHTML = `${filteredData.length.toLocaleString('it-IT')} di ${totalData.toLocaleString('it-IT')} incidenti • `;
        displayHTML += filterText.map(f => `<span class="filter-badge">${f}</span>`).join('');
    }
    
    document.getElementById('active-filters-text').innerHTML = displayHTML;
}

function switchAnalyticsTab(tabName) {
    document.querySelectorAll('.analytics-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.analytics-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

function updateAnalytics() {
    const filteredData = getFilteredData();
    
    updatePanoramicaCharts(filteredData);
    updateTemporaleCharts(filteredData);
    updateOrariaCharts(filteredData);
    updateCondizioniCharts(filteredData);
    updateInsights(filteredData);
    
    // Add download buttons to all charts
    setTimeout(() => {
        addChartDownloadButtons();
    }, 100);
}

// Add download buttons to all charts
function addChartDownloadButtons() {
    const chartContainers = document.querySelectorAll('.chart-container');
    
    chartContainers.forEach(container => {
        // Check if button already exists
        if (container.querySelector('.chart-download-btn')) return;
        
        const canvas = container.querySelector('canvas');
        if (!canvas) return;
        
        const chartId = canvas.id;
        const chartTitle = container.querySelector('h3')?.textContent || 'grafico';
        
        // Create download button
        const btn = document.createElement('button');
        btn.className = 'chart-download-btn';
        btn.innerHTML = '⬇️ PNG';
        btn.title = 'Scarica grafico come PNG';
        
        btn.onclick = () => {
            const filename = `${chartTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}`;
            downloadChartAsPNG(chartId, filename);
        };
        
        container.appendChild(btn);
    });
}

// Download Chart as PNG with ODS logo
async function downloadChartAsPNG(chartId, filename) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    // Create temporary canvas with more space for logo and text
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    // Set dimensions (add space at bottom for logo and text)
    const padding = 80;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height + padding;
    
    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw chart
    ctx.drawImage(canvas, 0, 0);
    
    // Add ODS logo
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = 'https://palermohub.opendatasicilia.it/lib/images/opendatasicilia.png';
    
    logo.onload = function() {
        // Draw logo at bottom right
        const logoHeight = 35;
        const logoWidth = logo.width * (logoHeight / logo.height);
        const xPos = tempCanvas.width - logoWidth - 10;
        const yPos = tempCanvas.height - logoHeight - 35;
        
        ctx.drawImage(logo, xPos, yPos, logoWidth, logoHeight);
        
        // Add text with dark color for visibility on white background
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        
        // Source text
        ctx.fillText('Fonte: OpenDataSicilia - Incidenti Palermo 2015-2023', 10, tempCanvas.height - 35);
        
        // Website link
        ctx.font = '10px Arial';
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('https://opendatasicilia.github.io/incidenti_palermo/', 10, tempCanvas.height - 20);
        
        // Download
        const link = document.createElement('a');
        link.download = filename + '.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    };
    
    logo.onerror = function() {
        // Fallback: download without logo but with text
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Fonte: OpenDataSicilia - Incidenti Palermo 2015-2023', 10, tempCanvas.height - 35);
        ctx.font = '10px Arial';
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('https://opendatasicilia.github.io/incidenti_palermo/', 10, tempCanvas.height - 20);
        
        const link = document.createElement('a');
        link.download = filename + '.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    };
}

// Panoramica Charts
function updatePanoramicaCharts(data) {
    // Common chart options with labels - COLORE SCURO per leggibilità su sfondo bianco
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
                color: '#1e293b', // SCURO per PNG
                font: {
                    weight: 'bold',
                    size: 9
                },
                formatter: (value) => value > 0 ? value : ''
            }
        }
    };
    
    // Trend Annuale - MOSTRA TUTTI GLI ANNI 2015-2023 + 3192 incidenti 2019 non mappati
    const allYears = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
    const selectedYear = currentFilters['filter-anno'];
    
    // Conta incidenti per ogni anno usando TUTTI i dati (non solo filtrati)
    const yearData = {};
    
    // Applica filtri SENZA l'anno per contare correttamente
    const tempFilters = {...currentFilters};
    delete tempFilters['filter-anno'];
    
    const dataForYearCount = allIncidenti.filter(row => {
        for (const [filterId, property] of Object.entries(filterConfig)) {
            if (filterId === 'filter-anno') continue; // Salta il filtro anno
            const value = tempFilters[filterId];
            if (!value) continue;

            const rowValue = row[property];
            
            if (String(rowValue) !== String(value)) return false;
        }
        return true;
    });
    
    // Conta per ogni anno
    dataForYearCount.forEach(row => {
        const year = String(row.Anno);
        if (year && allYears.includes(year)) {
            yearData[year] = (yearData[year] || 0) + 1;
        }
    });
    
    // AGGIUNGI 3192 incidenti del 2019 non mappati
    const incidenti2019NonMappati = 3192;
    yearData['2019'] = (yearData['2019'] || 0) + incidenti2019NonMappati;
    
    const counts = allYears.map(y => yearData[y] || 0);
    
    // Crea dataset con colori diversi per anno selezionato
    const pointBackgroundColors = allYears.map(y => y === selectedYear ? '#ef4444' : '#3b82f6');
    const pointBorderColors = allYears.map(y => y === selectedYear ? '#dc2626' : '#2563eb');
    const pointRadius = allYears.map(y => y === selectedYear ? 6 : 4);
    
    if (analyticsCharts.trendAnnuale) analyticsCharts.trendAnnuale.destroy();
    analyticsCharts.trendAnnuale = new Chart(document.getElementById('chart-trend-annuale'), {
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
                        // Alterna le etichette sopra e sotto per evitare sovrapposizioni
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
                    currentFilters['filter-anno'] = String(year);
                    document.getElementById('filter-anno').value = String(year);
                    handleFilterChange('filter-anno', String(year));
                }
            }
        }
    });
    
    // AGGIUNGI NOTA SOTTO IL GRAFICO - QUESTA È LA PARTE CRITICA
    const chartContainer = document.getElementById('chart-trend-annuale').closest('.chart-container');
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
    
    // Distribuzione Tipologia - ETICHETTE SCURE
    const tipoData = { M: 0, R: 0, F: 0, C: 0 };
    data.forEach(row => {
        if (row.Tipologia && tipoData.hasOwnProperty(row.Tipologia)) {
            tipoData[row.Tipologia]++;
        }
    });
    
    if (analyticsCharts.tipologia) analyticsCharts.tipologia.destroy();
    analyticsCharts.tipologia = new Chart(document.getElementById('chart-tipologia'), {
        type: 'doughnut',
        data: {
            labels: ['Mortale', 'Riserva', 'Feriti', 'Cose'],
            datasets: [{
                data: [tipoData.M, tipoData.R, tipoData.F, tipoData.C],
                backgroundColor: ['#ef4444', '#a855f7', '#f59e0b', '#10b981']
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                datalabels: {
                    display: true,
                    color: '#1e293b', // SCURO per leggibilità
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
    
    // Analisi Stagionale
    const stagioneData = {};
    data.forEach(row => {
        const stagione = row.Stagione;
        if (stagione) {
            stagioneData[stagione] = (stagioneData[stagione] || 0) + 1;
        }
    });
    
    const stagioni = ['Primavera', 'Estate', 'Autunno', 'Inverno'];
    const stagioniCounts = stagioni.map(s => stagioneData[s] || 0);
    
    if (analyticsCharts.stagionale) analyticsCharts.stagionale.destroy();
    analyticsCharts.stagionale = new Chart(document.getElementById('chart-stagionale'), {
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
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
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
            },
            onClick: (e, items) => {
                if (items.length > 0) {
                    const stagione = stagioni[items[0].index];
                    currentFilters['filter-stagione'] = stagione;
                    document.getElementById('filter-stagione').value = stagione;
                    handleFilterChange('filter-stagione', stagione);
                }
            }
        }
    });
    
    // Feriale vs Weekend
    const ferialeData = {};
    data.forEach(row => {
        const tipo = row['Feriale/Weekend'];
        if (tipo) {
            ferialeData[tipo] = (ferialeData[tipo] || 0) + 1;
        }
    });
    
    if (analyticsCharts.ferialeWeekend) analyticsCharts.ferialeWeekend.destroy();
    analyticsCharts.ferialeWeekend = new Chart(document.getElementById('chart-feriale-weekend'), {
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
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
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
            },
            onClick: (e, items) => {
                if (items.length > 0) {
                    const tipo = Object.keys(ferialeData)[items[0].index];
                    currentFilters['filter-feriale-weekend'] = tipo;
                    document.getElementById('filter-feriale-weekend').value = tipo;
                    handleFilterChange('filter-feriale-weekend', tipo);
                }
            }
        }
    });
}

// Temporale Charts
function updateTemporaleCharts(data) {
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
    
    // Giorno Settimana
    const giornoData = {};
    data.forEach(row => {
        const giorno = row['Giorno settimana'];
        if (giorno) {
            giornoData[giorno] = (giornoData[giorno] || 0) + 1;
        }
    });
    
    const giorni = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    const giorniCounts = giorni.map(g => giornoData[g] || 0);
    
    if (analyticsCharts.giornoSettimana) analyticsCharts.giornoSettimana.destroy();
    analyticsCharts.giornoSettimana = new Chart(document.getElementById('chart-giorno-settimana'), {
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
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
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
            },
            onClick: (e, items) => {
                if (items.length > 0) {
                    const giorno = giorni[items[0].index];
                    currentFilters['filter-giorno-settimana'] = giorno;
                    document.getElementById('filter-giorno-settimana').value = giorno;
                    handleFilterChange('filter-giorno-settimana', giorno);
                }
            }
        }
    });
    
    // Evoluzione Anni con Feriti
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
    
    if (analyticsCharts.evoluzioneAnni) analyticsCharts.evoluzioneAnni.destroy();
    analyticsCharts.evoluzioneAnni = new Chart(document.getElementById('chart-evoluzione-anni'), {
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
            ...commonOptions,
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
                ...commonOptions.plugins,
                legend: {
                    display: true,
                    labels: {
                        color: '#f1f5f9',
                        font: { size: 10 }
                    }
                },
                datalabels: {
                    display: false // Too crowded in stacked bars
                }
            },
            onClick: (e, items) => {
                if (items.length > 0) {
                    const year = years[items[0].index];
                    currentFilters['filter-anno'] = String(year);
                    document.getElementById('filter-anno').value = String(year);
                    handleFilterChange('filter-anno', String(year));
                }
            }
        }
    });
}

// Oraria Charts
function updateOrariaCharts(data) {
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
    
    if (analyticsCharts.fasciaOraria) analyticsCharts.fasciaOraria.destroy();
    analyticsCharts.fasciaOraria = new Chart(document.getElementById('chart-fascia-oraria'), {
        type: 'polarArea',
        data: {
            labels: fascePresenti,
            datasets: [{
                data: fasceCounts,
                backgroundColor: ['#fbbf24', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#1e3a8a']
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
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
            },
            onClick: (e, items) => {
                if (items.length > 0) {
                    const fascia = fascePresenti[items[0].index];
                    currentFilters['filter-fascia-6'] = fascia;
                    document.getElementById('filter-fascia-6').value = fascia;
                    handleFilterChange('filter-fascia-6', fascia);
                }
            }
        }
    });
    
    // Top 3 per Incidenti
    const sortedFasce = Object.entries(fasciaData).sort((a, b) => b[1] - a[1]).slice(0, 3);
    
    if (analyticsCharts.topIncidenti) analyticsCharts.topIncidenti.destroy();
    analyticsCharts.topIncidenti = new Chart(document.getElementById('chart-top-incidenti'), {
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
            ...commonOptions,
            indexAxis: 'y',
            plugins: {
                ...commonOptions.plugins,
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
    
    // Top 3 per Feriti
    const feritiData = {};
    data.forEach(row => {
        const fascia = row['Fascia oraria dettagliata (6 fasce)'];
        const tipo = row.Tipologia;
        if (fascia && (tipo === 'F' || tipo === 'R' || tipo === 'M')) {
            feritiData[fascia] = (feritiData[fascia] || 0) + 1;
        }
    });
    
    const sortedFeriti = Object.entries(feritiData).sort((a, b) => b[1] - a[1]).slice(0, 3);
    
    if (analyticsCharts.topFeriti) analyticsCharts.topFeriti.destroy();
    analyticsCharts.topFeriti = new Chart(document.getElementById('chart-top-feriti'), {
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
            ...commonOptions,
            indexAxis: 'y',
            plugins: {
                ...commonOptions.plugins,
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

// Condizioni Charts
function updateCondizioniCharts(data) {
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
    
    const luceData = {};
    data.forEach(row => {
        const luce = row['Giorno/Notte'];
        if (luce) {
            luceData[luce] = (luceData[luce] || 0) + 1;
        }
    });
    
    if (analyticsCharts.luceBuio) analyticsCharts.luceBuio.destroy();
    analyticsCharts.luceBuio = new Chart(document.getElementById('chart-luce-buio'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(luceData),
            datasets: [{
                data: Object.values(luceData),
                backgroundColor: ['#fbbf24', '#1e3a8a']
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                datalabels: {
                    display: true,
                    color: '#1e293b', // SCURO per leggibilità su sfondo bianco
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
            },
            onClick: (e, items) => {
                if (items.length > 0) {
                    const luce = Object.keys(luceData)[items[0].index];
                    currentFilters['filter-giorno-notte'] = luce;
                    document.getElementById('filter-giorno-notte').value = luce;
                    handleFilterChange('filter-giorno-notte', luce);
                }
            }
        }
    });
    
    const condizioniData = {};
    data.forEach(row => {
        const cond = row['Condizioni luce (Visibilità)'];
        if (cond) {
            condizioniData[cond] = (condizioniData[cond] || 0) + 1;
        }
    });
    
    if (analyticsCharts.condizioniDettaglio) analyticsCharts.condizioniDettaglio.destroy();
    analyticsCharts.condizioniDettaglio = new Chart(document.getElementById('chart-condizioni-dettaglio'), {
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
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
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
            },
            onClick: (e, items) => {
                if (items.length > 0) {
                    const cond = Object.keys(condizioniData)[items[0].index];
                    currentFilters['filter-condizioni-luce'] = cond;
                    document.getElementById('filter-condizioni-luce').value = cond;
                    handleFilterChange('filter-condizioni-luce', cond);
                }
            }
        }
    });
    
    // Confronto Stagionale Condizioni
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
    
    if (analyticsCharts.stagioniCondizioni) analyticsCharts.stagioniCondizioni.destroy();
    analyticsCharts.stagioniCondizioni = new Chart(document.getElementById('chart-stagioni-condizioni'), {
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
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    display: true,
                    labels: {
                        color: '#f1f5f9',
                        font: { size: 10 }
                    }
                },
                datalabels: {
                    display: false // Too crowded in grouped bars
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

// Update Insights
function updateInsights(data) {
    // Statistiche Real-time
    const totalIncidenti = data.length;
    const totalFeriti = data.filter(r => r.Tipologia === 'F' || r.Tipologia === 'R' || r.Tipologia === 'M').length;
    const percentualeFeriti = totalIncidenti > 0 ? ((totalFeriti / totalIncidenti) * 100).toFixed(1) : 0;
    const mediaFeriti = totalIncidenti > 0 ? (totalFeriti / totalIncidenti).toFixed(2) : 0;
    
    document.getElementById('realtime-total').textContent = totalIncidenti.toLocaleString('it-IT');
    document.getElementById('realtime-feriti').textContent = totalFeriti.toLocaleString('it-IT');
    document.getElementById('realtime-percentuale').textContent = percentualeFeriti + '%';
    document.getElementById('realtime-media').textContent = mediaFeriti;
    
    // Insights Automatici
    const giornoData = {};
    data.forEach(row => {
        const giorno = row['Giorno settimana'];
        if (giorno) {
            giornoData[giorno] = (giornoData[giorno] || 0) + 1;
        }
    });
    const giornoPericoloso = Object.entries(giornoData).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('insight-giorno').textContent = giornoPericoloso ? `${giornoPericoloso[0]} (${giornoPericoloso[1]} incidenti)` : '-';
    
    const fasciaData = {};
    data.forEach(row => {
        const fascia = row['Fascia oraria dettagliata (6 fasce)'];
        if (fascia) {
            fasciaData[fascia] = (fasciaData[fascia] || 0) + 1;
        }
    });
    const fasciaCritica = Object.entries(fasciaData).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('insight-fascia').textContent = fasciaCritica ? `${fasciaCritica[0]} (${fasciaCritica[1]} incidenti)` : '-';
    
    const stagioneData = {};
    data.forEach(row => {
        const stagione = row.Stagione;
        if (stagione) {
            stagioneData[stagione] = (stagioneData[stagione] || 0) + 1;
        }
    });
    const stagioneRischiosa = Object.entries(stagioneData).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('insight-stagione').textContent = stagioneRischiosa ? `${stagioneRischiosa[0]} (${stagioneRischiosa[1]} incidenti)` : '-';
    
    const condizioneData = {};
    data.forEach(row => {
        const cond = row['Condizioni luce (Visibilità)'];
        if (cond) {
            condizioneData[cond] = (condizioneData[cond] || 0) + 1;
        }
    });
    const condizionePericolosa = Object.entries(condizioneData).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('insight-condizione').textContent = condizionePericolosa ? `${condizionePericolosa[0]} (${condizionePericolosa[1]} incidenti)` : '-';
}

// Data Table Functions
function openDataTable() {
    const filteredData = getFilteredData();
    const modal = document.getElementById('data-table-modal');
    
    document.getElementById('table-count').textContent = filteredData.length.toLocaleString('it-IT');
    
    if (filteredData.length === 0) {
        document.getElementById('table-header').innerHTML = '';
        document.getElementById('table-body').innerHTML = '<tr><td colspan="100" style="text-align: center; padding: 40px; color: #94a3b8;">Nessun dato da visualizzare</td></tr>';
        modal.classList.add('show');
        return;
    }
    
    const keys = Object.keys(filteredData[0]);
    let headerHtml = '<tr>';
    keys.forEach(key => {
        headerHtml += `<th>${key}</th>`;
    });
    headerHtml += '</tr>';
    document.getElementById('table-header').innerHTML = headerHtml;
    
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
    
    document.getElementById('table-body').innerHTML = bodyHtml;
    modal.classList.add('show');
}

function closeDataTable() {
    document.getElementById('data-table-modal').classList.remove('show');
}

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

// Setup Event Listeners
function setupEventListeners() {
    // Helper per gestire sia touch che click
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
    
    // Mobile Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (mobileToggle) addTouchClickListener(mobileToggle, toggleSidebar);
    if (sidebarOverlay) addTouchClickListener(sidebarOverlay, closeSidebar);
    
    // Filter Sections
    document.querySelectorAll('.filter-section-header').forEach(header => {
        addTouchClickListener(header, () => {
            const section = header.dataset.section;
            toggleSection(section);
        });
    });
    
    // Year Stats
    const yearStatsGrid = document.getElementById('year-stats-grid');
    if (yearStatsGrid) {
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
                const year = item.dataset.year;
                
                if (year === '2019') {
                    show2019InfoPopup();
                    setTimeout(() => filterByYear(year), 100);
                } else {
                    filterByYear(year);
                }
            }
        });
        
        yearStatsGrid.addEventListener('click', (e) => {
            if (e.target.closest('.year-stat-item, .year-stat-item-all')) {
                e.preventDefault();
            }
        });
    }
    
    // Legend
    document.querySelectorAll('.legend-item').forEach(item => {
        addTouchClickListener(item, () => {
            const tipo = item.dataset.tipo;
            filterByTipologia(tipo);
        });
    });
    
    // Buttons - with null checks
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
    
    // Basemap
    const basemapSelect = document.getElementById('basemap-select');
    if (basemapSelect) basemapSelect.addEventListener('change', changeBasemap);
    
    // Modals Close Buttons
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
    
    // Analytics Tabs
    document.querySelectorAll('.analytics-tab').forEach(tab => {
        addTouchClickListener(tab, () => {
            const tabName = tab.dataset.tab;
            switchAnalyticsTab(tabName);
        });
    });
    
    // Download Buttons
    const btnDownloadCSV = document.getElementById('btn-download-csv');
    if (btnDownloadCSV) addTouchClickListener(btnDownloadCSV, downloadCSV);
    
    const btnDownloadJSON = document.getElementById('btn-download-json');
    if (btnDownloadJSON) addTouchClickListener(btnDownloadJSON, downloadJSON);
    
    // Modal Close on Click Outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
    
    // Previeni zoom su double-tap per tutti i pulsanti
    document.addEventListener('touchend', (e) => {
        if (e.target.closest('button, .legend-item, .year-stat-item, .year-stat-item-all')) {
            e.preventDefault();
        }
    }, { passive: false });
}




// Initialize App
init();
