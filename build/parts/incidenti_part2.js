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
        const pointsLegend = document.getElementById('points-legend');
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
        const pointsLegend = document.getElementById('points-legend');
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
            map.setLayoutProperty(`incidenti-${tipo}`, 'visibility', 'none');
        });
        
        createClusteringLayers();
        map.setLayoutProperty('clusters', 'visibility', 'visible');
        map.setLayoutProperty('cluster-count', 'visibility', 'visible');
        map.setLayoutProperty('unclustered-point', 'visibility', 'visible');
        
        if (btn) {
            btn.innerHTML = '<i class="fas fa-map"></i> Mappa di localizzazione';
            btn.classList.add('active');
        }
        
        if (btnTopLuoghi) {
            btnTopLuoghi.style.display = 'block';
        }
        
        calculateTopLuoghi();
        
        console.log('Clustering attivato - filtri applicati:', Object.keys(currentFilters).filter(k => currentFilters[k]).length);
        
    } else {
        if (map.getLayer('clusters')) {
            map.setLayoutProperty('clusters', 'visibility', 'none');
            map.setLayoutProperty('cluster-count', 'visibility', 'none');
            map.setLayoutProperty('unclustered-point', 'visibility', 'none');
        }
        
        ['C', 'F', 'R', 'M'].forEach(tipo => {
            map.setLayoutProperty(`incidenti-${tipo}`, 'visibility', 'visible');
        });
        
        if (btn) {
            btn.innerHTML = '<i class="fas fa-circle"></i> Mappa con clustering geografico';
            btn.classList.remove('active');
        }
        
        if (btnTopLuoghi) {
            btnTopLuoghi.style.display = 'none';
        }
        
        const modal = document.getElementById('top-luoghi-modal');
        if (modal && modal.classList.contains('show')) {
            closeTopLuoghiModal();
        }
        
        console.log('Clustering disattivato');
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
