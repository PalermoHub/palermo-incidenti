
        let map;
        let allIncidenti = [];
        let currentFilters = {};
        let showHeatmap = false;
        
        const colorMap = {
            'M': '#ef4444',
            'R': '#f97316',
            'F': '#f59e0b',
            'C': '#10b981'
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

        function toggleSection(sectionId) {
            const content = document.getElementById(`content-${sectionId}`);
            const toggle = document.getElementById(`toggle-${sectionId}`);
            
            content.classList.toggle('collapsed');
            toggle.classList.toggle('collapsed');
        }

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
            
            // Chiudi sidebar su mobile
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        }
        
        function filterAllYears() {
            currentFilters['filter-anno'] = '';
            document.getElementById('filter-anno').value = '';
            
            updateAllFilters();
            updateMapData();
            updateStats();
            updateYearStats();
            
            // Chiudi sidebar su mobile
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        }

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
        }

        function updateLegendActiveState() {
            const selectedTipo = currentFilters['filter-tipologia'];
            
            document.querySelectorAll('.legend-item').forEach(item => {
                item.classList.remove('active');
            });
            
            if (selectedTipo === '') {
                document.querySelector('.legend-item[data-tipo=""]').classList.add('active');
            } else {
                document.querySelector(`.legend-item[data-tipo="${selectedTipo}"]`).classList.add('active');
            }
        }

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
            
            // Aggiorna header
            document.getElementById('detail-tipo-icon').textContent = tipologiaIcons[properties.Tipologia] || '🚗';
            document.getElementById('detail-subtitle').textContent = `Incidente del ${properties.Data || 'Data non disponibile'}`;
            
            // Costruisci contenuto strutturato
            let html = '';
            
            // Sezione 1: Tipologia e Gravità
            html += `
                <div class="detail-section">
                    <h3>⚠️ Tipologia e Gravità</h3>
                    <div class="detail-row">
                        <span class="detail-label">Tipo Incidente</span>
                        <span class="tipo-badge ${properties.Tipologia}">${properties.Tipologia} - ${tipologiaNames[properties.Tipologia]}</span>
                    </div>
                </div>
            `;
            
            // Sezione 2: Informazioni Temporali
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
            
            // Sezione 3: Localizzazione
            html += '<div class="detail-section"><h3>📍 Dove è Avvenuto</h3>';
            const locationFields = [
                { key: 'Circoscrizione', label: 'Circoscrizione' },
                { key: 'Quartiere', label: 'Quartiere' },
                { key: 'UPL', label: 'Unità Primo Livello' }
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
            
            // Sezione 4: Condizioni Ambientali
            html += '<div class="detail-section"><h3>🌤️ Condizioni Ambientali</h3>';
            const conditionsFields = [
                { key: 'Condizioni luce (Visibilità)', label: 'Condizioni Luce' }
            ];
            
            conditionsFields.forEach(field => {
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
            
            // Sezione 5: Altri Dati
            html += '<div class="detail-section"><h3>📊 Informazioni Aggiuntive</h3>';
            const otherFields = Object.keys(properties).filter(key => {
                return !['Tipologia', 'Data', 'Anno', 'Stagione', 'Mese', 'Giorno settimana', 
                         'Feriale/Weekend', 'Giorno/Notte', 'Fascia oraria (4 fasce)', 
                         'Fascia oraria dettagliata (6 fasce)', 'Ora di punta (Picchi di traffico)',
                         'Circoscrizione', 'Quartiere', 'UPL', 'latitude', 'longitude',
                         'Condizioni luce (Visibilità)'].includes(key) &&
                       properties[key] && properties[key] !== 'null';
            });
            
            if (otherFields.length > 0) {
                otherFields.forEach(key => {
                    html += `
                        <div class="detail-row">
                            <span class="detail-label">${key}</span>
                            <span class="detail-value">${properties[key]}</span>
                        </div>
                    `;
                });
            } else {
                html += '<p style="color: #64748b; font-size: 13px; text-align: center; padding: 10px;">Nessun dato aggiuntivo disponibile</p>';
            }
            html += '</div>';
            
            content.innerHTML = html;
            panel.classList.add('open');
        }

        function closeDetailPanel() {
            const panel = document.getElementById('detail-panel');
            panel.classList.remove('open');
        }

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

        async function init() {
            try {
                console.log('Inizio caricamento CSV...');
                document.getElementById('loading').innerHTML = '<div>Caricamento CSV...</div><small>Download in corso</small>';
                
                await loadCSV();
                
                console.log('CSV caricato, inizializzazione mappa...');
                document.getElementById('loading').innerHTML = '<div>Creazione mappa...</div><small>Attendere</small>';
                
                initMap();

            } catch (error) {
                console.error('Errore inizializzazione:', error);
                document.getElementById('loading').innerHTML = '<div>Errore caricamento</div><small>' + error.message + '</small>';
                // Nascondi il loading anche in caso di errore
                setTimeout(() => {
                    document.getElementById('loading').classList.add('hidden');
                }, 2000);
            }
        }

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
                        
                        console.log(`CSV processato: ${allIncidenti.length} incidenti validi su ${results.data.length} righe totali`);
                        resolve();
                    },
                    error: function(error) {
                        console.error('Errore download CSV:', error);
                        reject(error);
                    }
                });
            });
        }

        function openInfoModal() {
            document.getElementById('info-modal').classList.add('show');
        }

        function closeInfoModal() {
            document.getElementById('info-modal').classList.remove('show');
        }

        function openDataTable() {
            const filteredData = getFilteredData();
            const modal = document.getElementById('data-table-modal');
            
            // Aggiorna conteggio
            document.getElementById('table-count').textContent = filteredData.length.toLocaleString('it-IT');
            
            if (filteredData.length === 0) {
                document.getElementById('table-header').innerHTML = '';
                document.getElementById('table-body').innerHTML = '<tr><td colspan="100" style="text-align: center; padding: 40px; color: #94a3b8;">Nessun dato da visualizzare con i filtri attuali</td></tr>';
                modal.classList.add('show');
                return;
            }
            
            // Genera header della tabella
            const keys = Object.keys(filteredData[0]);
            let headerHtml = '<tr>';
            keys.forEach(key => {
                headerHtml += `<th>${key}</th>`;
            });
            headerHtml += '</tr>';
            document.getElementById('table-header').innerHTML = headerHtml;
            
            // Genera righe della tabella (limita a 500 righe per performance)
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
                bodyHtml += `<tr><td colspan="${keys.length}" style="text-align: center; padding: 20px; color: #f59e0b; background: rgba(245, 158, 11, 0.1);">Visualizzate le prime 500 righe di ${filteredData.length.toLocaleString('it-IT')}. Il download include tutti i dati.</td></tr>`;
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
                alert('Nessun dato da scaricare con i filtri attuali');
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
                alert('Nessun dato da scaricare con i filtri attuali');
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

        // Chiudi modal cliccando fuori
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });

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
            
            // Controllo personalizzato per logo ODS
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
                    // Imposta il filtro anno a 2023 di default
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
            
            // Timeout di sicurezza per nascondere il loading
            setTimeout(() => {
                const loading = document.getElementById('loading');
                if (loading && !loading.classList.contains('hidden')) {
                    console.log('Timeout sicurezza: nascondo loading');
                    loading.classList.add('hidden');
                }
            }, 5000);
        }

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
                        'circle-stroke-color': '#fff'
                    }
                });

                setupLayerInteractions(layerId);
            });

            console.log('Layers creati con successo');
        }

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
        }

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

        function updateMapData() {
            const geojson = createGeoJSON();
            console.log(`Aggiornamento mappa con ${geojson.features.length} features`);
            map.getSource('incidenti').setData(geojson);
        }

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
            
            // Aggiorna il label del totale con l'anno se filtrato
            const annoFiltrato = currentFilters['filter-anno'];
            const labelTotale = document.querySelector('.stat-total .stat-label');
            if (annoFiltrato) {
                labelTotale.textContent = `Totale Incidenti (${annoFiltrato})`;
            } else {
                labelTotale.textContent = 'Totale Incidenti';
            }

            console.log('Statistiche:', stats, `su ${filteredData.length} incidenti filtrati`);
        }

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
            
            // Calcola totale di tutti gli anni
            const totalAllYears = Object.values(yearStats).reduce((sum, count) => sum + count, 0);
            
            // Pulsante "Tutti"
            let gridHtml = `
                <div class="year-stat-item-all ${selectedYear === '' ? 'active' : ''}" 
                     onclick="filterAllYears()"
                     title="Clicca per mostrare tutti gli anni">
                    <div class="year-stat-year">Tutti gli Anni</div>
                    <div class="year-stat-count">${totalAllYears.toLocaleString('it-IT')}</div>
                </div>
            `;
            
            // Mostra tutti gli anni (dal 2023 al 2015)
            const sortedYears = Object.keys(yearStats).sort((a, b) => b - a);
            gridHtml += sortedYears.map(year => `
                <div class="year-stat-item ${selectedYear === String(year) ? 'active' : ''}" 
                     onclick="filterByYear('${year}')"
                     title="Clicca per filtrare l'anno ${year}">
                    <div class="year-stat-year">${year}</div>
                    <div class="year-stat-count">${yearStats[year].toLocaleString('it-IT')}</div>
                </div>
            `).join('');
            
            document.getElementById('year-stats-grid').innerHTML = gridHtml;
        }

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

        function toggleHeatmap() {
            showHeatmap = !showHeatmap;
            const btn = document.getElementById('btn-toggle-heatmap');
            
            if (showHeatmap) {
                map.setLayoutProperty('incidenti-heatmap', 'visibility', 'visible');
                ['C', 'F', 'R', 'M'].forEach(tipo => {
                    map.setLayoutProperty(`incidenti-${tipo}`, 'visibility', 'none');
                });
                btn.textContent = '🔵 Localizzaione incidenti';
                btn.classList.add('active');
                document.getElementById('points-legend').classList.add('hidden');
                document.getElementById('heatmap-legend').classList.remove('hidden');
            } else {
                map.setLayoutProperty('incidenti-heatmap', 'visibility', 'none');
                ['C', 'F', 'R', 'M'].forEach(tipo => {
                    map.setLayoutProperty(`incidenti-${tipo}`, 'visibility', 'visible');
                });
                btn.textContent = '🔥 Mappa di Calore';
                btn.classList.remove('active');
                document.getElementById('points-legend').classList.remove('hidden');
                document.getElementById('heatmap-legend').classList.add('hidden');
            }
        }

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
        }

        init();