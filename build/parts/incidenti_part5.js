// ==========================================
// PARTE 5: FUNZIONI MAPPA E LAYERS
// ==========================================

// Map Initialization
function initMap() {
    const palermoBounds = [
        [13.20, 38.00],
        [13.50, 38.25]
    ];
    
    map = new maplibregl.Map({
        container: 'map',
        style: basemapStyles['carto-light'],
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

// Create Clustering Layers
function createClusteringLayers() {
    const geojson = createGeoJSON();
    
    if (map.getLayer('cluster-count')) map.removeLayer('cluster-count');
    if (map.getLayer('clusters')) map.removeLayer('clusters');
    if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point');
    if (map.getSource('incidenti-cluster')) map.removeSource('incidenti-cluster');
    
    map.addSource('incidenti-cluster', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    });

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
                10,
                '#f59e0b',
                25,
                '#f97316',
                50,
                '#ef4444'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                10,
                25,
                25,
                30,
                50,
                35
            ],
            'circle-opacity': 0.85,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff'
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'incidenti-cluster',
        filter: [
            'all',
            ['has', 'point_count'],
            ['>=', ['get', 'point_count'], 2]
        ],
        layout: {
            'text-field': ['to-string', ['get', 'point_count']],
            'text-font': ['Titillium Web','Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': [
                'step',
                ['get', 'point_count'],
                13,
                10,
                15,
                25,
                17,
                50,
                19
            ],
            'text-allow-overlap': true,
            'text-ignore-placement': true
        },
        paint: {
            'text-color': '#ffffff',
            'text-halo-color': 'rgba(0, 0, 0, 0.9)',
            'text-halo-width': 2
        }
    });

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
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
        }
    });

    if (!map._clusterHandlersAdded) {
        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            if (!features.length) return;
            
            const clusterId = features[0].properties.cluster_id;
            const pointCount = features[0].properties.point_count;
            
            console.log(`Cluster cliccato: ${pointCount} incidenti`);
            
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
    
    console.log('Cluster layers creati con numeri visibili');
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
