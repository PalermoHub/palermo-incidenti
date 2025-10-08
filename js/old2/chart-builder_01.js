// ============================================
// CHART BUILDER - JAVASCRIPT LOGIC FIXED
// Versione Mobile-Compatible
// ============================================

let customChart = null;
let customChartConfig = {
    type: 'bar',
    dimension: null,
    metric: 'count',
    limit: 10,
    orientation: 'vertical'
};

// ============================================
// GESTIONE MODALI GLOBALE
// ============================================
const ModalManager = {
    activeModals: new Set(),
    
    open(modalId) {
        this.activeModals.add(modalId);
        if (this.activeModals.size === 1) {
            document.body.classList.add('modal-open');
        }
        console.log('ModalManager.open:', modalId, 'Totale modali:', this.activeModals.size);
    },
    
    close(modalId) {
        this.activeModals.delete(modalId);
        if (this.activeModals.size === 0) {
            document.body.classList.remove('modal-open');
            document.body.classList.remove('analytics-panel-open');
        }
        console.log('ModalManager.close:', modalId, 'Totale modali:', this.activeModals.size);
    },
    
    isAnyOpen() {
        return this.activeModals.size > 0;
    }
};

// Rendi disponibile globalmente
window.ModalManager = ModalManager;

// ============================================
// INIZIALIZZAZIONE UNICA
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Chart Builder: DOM caricato, inizializzazione...');
    
    // Attendi che il DOM sia completamente caricato
    setTimeout(() => {
        initChartBuilderUI();
    }, 300);
});

function initChartBuilderUI() {
    const triggerBtn = document.getElementById('chart-builder-trigger');
    const closeBtn = document.getElementById('chart-builder-close');
    const modal = document.getElementById('chart-builder-modal');
    
    if (!triggerBtn || !modal) {
        console.error('Chart Builder: Elementi DOM non trovati');
        return;
    }
    
    console.log('Chart Builder: Elementi DOM trovati');
    
    // ========================================
    // RIMUOVI TUTTI GLI EVENT LISTENER ESISTENTI
    // ========================================
    const newTrigger = triggerBtn.cloneNode(true);
    triggerBtn.parentNode.replaceChild(newTrigger, triggerBtn);
    
    // ========================================
    // GESTIONE CLICK DESKTOP
    // ========================================
    newTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Chart Builder: Click desktop sul pulsante');
        openChartBuilder();
    });
    
    // ========================================
    // GESTIONE TOUCH MOBILE - OTTIMIZZATA
    // ========================================
    let touchStartTime = 0;
    let touchMoved = false;
    let touchStartY = 0;
    
    newTrigger.addEventListener('touchstart', function(e) {
        touchStartTime = Date.now();
        touchMoved = false;
        touchStartY = e.touches[0].clientY;
        console.log('Chart Builder: Touch start');
    }, { passive: true });
    
    newTrigger.addEventListener('touchmove', function(e) {
        const touchCurrentY = e.touches[0].clientY;
        if (Math.abs(touchCurrentY - touchStartY) > 10) {
            touchMoved = true;
        }
    }, { passive: true });
    
    newTrigger.addEventListener('touchend', function(e) {
        const touchDuration = Date.now() - touchStartTime;
        
        console.log('Chart Builder: Touch end - moved:', touchMoved, 'duration:', touchDuration);
        
        if (!touchMoved && touchDuration < 500) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Chart Builder: Touch end valido - apertura modale');
            openChartBuilder();
        }
    }, { passive: false });
    
    // ========================================
    // PULSANTE CHIUSURA
    // ========================================
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        newCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeChartBuilder();
        });
        
        newCloseBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeChartBuilder();
        }, { passive: false });
    }
    
    // ========================================
    // CHIUDI CLICCANDO FUORI
    // ========================================
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeChartBuilder();
        }
    });
    
    // ========================================
    // INIZIALIZZA RESTO COMPONENTI
    // ========================================
    initChartBuilder();
    
    console.log('Chart Builder: Inizializzazione UI completata');
}

function openChartBuilder() {
    console.log('Chart Builder: Tentativo apertura modale...');
    
    // Verifica se analytics panel è aperto
    const analyticsPanel = document.getElementById('analytics-panel');
    if (analyticsPanel && analyticsPanel.classList.contains('open')) {
        console.log('Chart Builder: Analytics panel aperto, chiusura...');
        if (typeof closeAnalytics === 'function') {
            closeAnalytics();
        }
        // Attendi che si chiuda
        setTimeout(() => {
            continueOpenChartBuilder();
        }, 100);
    } else {
        continueOpenChartBuilder();
    }
}

function continueOpenChartBuilder() {
    const modal = document.getElementById('chart-builder-modal');
    if (!modal) {
        console.error('Chart Builder: Modale non trovata nel DOM!');
        return;
    }
    
    // Imposta z-index alto per essere sopra tutto
    modal.style.zIndex = '10001';
    
    // Aggiungi classe show
    modal.classList.add('show');
    
    // Registra nel ModalManager
    ModalManager.open('chart-builder');
    
    console.log('Chart Builder: Modale aperta con successo');
    console.log('Chart Builder: Classe show:', modal.classList.contains('show'));
    console.log('Chart Builder: Display:', window.getComputedStyle(modal).display);
    
    // Aggiorna info se disponibili
    try {
        updateActiveFiltersDisplay();
        updateFooterStats();
    } catch (e) {
        console.warn('Chart Builder: Errore aggiornamento dati:', e);
    }
}

function closeChartBuilder() {
    console.log('Chart Builder: Chiusura modale...');
    const modal = document.getElementById('chart-builder-modal');
    if (modal) {
        modal.classList.remove('show');
        ModalManager.close('chart-builder');
        console.log('Chart Builder: Modale chiusa');
    }
}

// ============================================
// INIZIALIZZAZIONE COMPONENTI
// ============================================

function initChartBuilder() {
    // Chart Type Selection
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            customChartConfig.type = this.dataset.type;
            updateConfigOptions();
        });
    });
    
    // Dimension Select
    const dimensionSelect = document.getElementById('dimension-select');
    if (dimensionSelect) {
        dimensionSelect.addEventListener('change', (e) => {
            customChartConfig.dimension = e.target.value;
        });
    }
    
    // Metric Select
    const metricSelect = document.getElementById('metric-select');
    if (metricSelect) {
        metricSelect.addEventListener('change', (e) => {
            customChartConfig.metric = e.target.value;
        });
    }
    
    // Limit Select
    const limitSelect = document.getElementById('limit-select');
    if (limitSelect) {
        limitSelect.addEventListener('change', (e) => {
            customChartConfig.limit = parseInt(e.target.value);
        });
    }
    
    // Orientation Select
    const orientationSelect = document.getElementById('orientation-select');
    if (orientationSelect) {
        orientationSelect.addEventListener('change', (e) => {
            customChartConfig.orientation = e.target.value;
        });
    }
    
    // Generate Button
    const generateBtn = document.getElementById('btn-generate-chart');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateCustomChart);
    }
    
    // Reset Button
    const resetBtn = document.getElementById('btn-reset-builder');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetChartBuilder);
    }
    
    // Download Button
    const downloadBtn = document.getElementById('btn-download-custom-chart');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadCustomChart);
    }
    
    console.log('Chart Builder: Componenti inizializzati');
}

function updateConfigOptions() {
    const orientationGroup = document.getElementById('orientation-group');
    if (orientationGroup) {
        if (customChartConfig.type === 'bar') {
            orientationGroup.style.display = 'block';
        } else {
            orientationGroup.style.display = 'none';
        }
    }
}

function updateActiveFiltersDisplay() {
    const container = document.getElementById('custom-chart-filters');
    if (!container) return;
    
    const activeFilters = [];
    
    if (typeof currentFilters !== 'undefined') {
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== '') {
                const label = key.replace('filter-', '').replace(/-/g, ' ');
                activeFilters.push({ label: label, value: value });
            }
        });
    }
    
    if (activeFilters.length === 0) {
        container.innerHTML = '<span class="no-filters">Nessun filtro applicato</span>';
    } else {
        container.innerHTML = activeFilters.map(f => 
            `<span class="filter-badge">
                <i class="fas fa-filter"></i>
                ${f.label}: ${f.value}
            </span>`
        ).join('');
    }
}

function updateFooterStats() {
    const totalEl = document.getElementById('custom-chart-total');
    const periodEl = document.getElementById('custom-chart-period');
    
    if (!totalEl || !periodEl) return;
    
    const data = typeof getFilteredData !== 'undefined' ? getFilteredData() : [];
    totalEl.textContent = `${data.length.toLocaleString('it-IT')} incidenti`;
    
    let period = '2015-2023';
    if (typeof currentFilters !== 'undefined' && currentFilters['filter-anno']) {
        period = currentFilters['filter-anno'];
        if (currentFilters['filter-mese']) {
            period += ` - ${currentFilters['filter-mese']}`;
        }
    }
    periodEl.textContent = period;
}

// ============================================
// GENERAZIONE GRAFICO
// ============================================

function generateCustomChart() {
    console.log('Generazione grafico personalizzato...');
    console.log('Config:', customChartConfig);
    
    if (!customChartConfig.dimension) {
        alert('⚠️ Seleziona una dimensione per generare il grafico');
        return;
    }
    
    const filteredData = typeof getFilteredData !== 'undefined' ? getFilteredData() : allIncidenti;
    
    if (filteredData.length === 0) {
        alert('⚠️ Nessun dato disponibile con i filtri attuali');
        return;
    }
    
    const chartData = prepareChartData(filteredData);
    renderCustomChart(chartData);
}

function prepareChartData(data) {
    const dimension = customChartConfig.dimension;
    const metric = customChartConfig.metric;
    const limit = customChartConfig.limit;
    
    console.log('Preparazione dati per dimensione:', dimension);
    
    let aggregatedData = {};
    
    if (metric === 'count') {
        data.forEach(row => {
            const value = row[dimension];
            if (value && value !== 'null') {
                aggregatedData[value] = (aggregatedData[value] || 0) + 1;
            }
        });
    } else if (metric === 'tipologia') {
        const tipologie = ['M', 'R', 'F', 'C'];
        data.forEach(row => {
            const value = row[dimension];
            const tipo = row['Tipologia'];
            if (value && value !== 'null' && tipo) {
                if (!aggregatedData[value]) {
                    aggregatedData[value] = { M: 0, R: 0, F: 0, C: 0 };
                }
                aggregatedData[value][tipo]++;
            }
        });
    }
    
    let dataArray = Object.entries(aggregatedData).map(([key, value]) => ({
        label: key,
        value: value
    }));
    
    if (metric === 'count') {
        dataArray.sort((a, b) => b.value - a.value);
    } else {
        dataArray.sort((a, b) => {
            const totalA = Object.values(a.value).reduce((sum, v) => sum + v, 0);
            const totalB = Object.values(b.value).reduce((sum, v) => sum + v, 0);
            return totalB - totalA;
        });
    }
    
    if (limit > 0) {
        dataArray = dataArray.slice(0, limit);
    }
    
    dataArray = sortByDimension(dataArray, dimension);
    
    console.log('Dati preparati:', dataArray);
    return dataArray;
}

function sortByDimension(dataArray, dimension) {
    const monthOrder = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const dayOrder = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    const seasonOrder = ['Primavera', 'Estate', 'Autunno', 'Inverno'];
    const timeOrder = ['Alba', 'Mattina', 'Pranzo', 'Pomeriggio', 'Sera', 'Notte'];
    
    if (dimension === 'Mese') {
        return dataArray.sort((a, b) => monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label));
    } else if (dimension === 'Giorno settimana') {
        return dataArray.sort((a, b) => dayOrder.indexOf(a.label) - dayOrder.indexOf(b.label));
    } else if (dimension === 'Stagione') {
        return dataArray.sort((a, b) => seasonOrder.indexOf(a.label) - seasonOrder.indexOf(b.label));
    } else if (dimension === 'Fascia oraria dettagliata (6 fasce)') {
        return dataArray.sort((a, b) => timeOrder.indexOf(a.label) - timeOrder.indexOf(b.label));
    } else if (dimension === 'Anno') {
        return dataArray.sort((a, b) => parseInt(a.label) - parseInt(b.label));
    }
    
    return dataArray;
}

function renderCustomChart(data) {
    const canvas = document.getElementById('custom-chart-canvas');
    const wrapper = document.getElementById('chart-wrapper-custom');
    const placeholder = document.querySelector('.preview-placeholder');
    
    if (!canvas) return;
    
    if (wrapper) wrapper.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';
    
    if (customChart) {
        customChart.destroy();
    }
    
    const chartDatasets = prepareChartDatasets(data);
    const chartLabels = data.map(d => d.label);
    
    const config = {
        type: customChartConfig.type,
        data: {
            labels: chartLabels,
            datasets: chartDatasets
        },
        options: getChartOptions()
    };
    
    customChart = new Chart(canvas, config);
    
    console.log('Grafico personalizzato creato');
}

function prepareChartDatasets(data) {
    const metric = customChartConfig.metric;
    const type = customChartConfig.type;
    
    if (metric === 'count') {
        const values = data.map(d => d.value);
        
        let colors;
        if (type === 'pie' || type === 'doughnut' || type === 'polarArea') {
            colors = generateColors(data.length);
        } else {
            colors = generateGradientColors(data.length);
        }
        
        return [{
            label: 'Incidenti',
            data: values,
            backgroundColor: colors,
            borderColor: type === 'line' ? '#8b5cf6' : colors,
            borderWidth: type === 'line' ? 3 : 1,
            fill: type === 'line' ? false : true,
            tension: 0.4
        }];
    } else {
        const tipologieMap = {
            'M': { label: 'Mortali', color: '#ef4444' },
            'R': { label: 'Riserva', color: '#a855f7' },
            'F': { label: 'Feriti', color: '#f59e0b' },
            'C': { label: 'Cose', color: '#10b981' }
        };
        
        return ['M', 'R', 'F', 'C'].map(tipo => ({
            label: tipologieMap[tipo].label,
            data: data.map(d => d.value[tipo] || 0),
            backgroundColor: tipologieMap[tipo].color + (type === 'line' ? '33' : 'CC'),
            borderColor: tipologieMap[tipo].color,
            borderWidth: type === 'line' ? 2 : 1,
            fill: type === 'line' ? false : true,
            tension: 0.4
        }));
    }
}

function getChartOptions() {
    const type = customChartConfig.type;
    const orientation = customChartConfig.orientation;
    
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    color: '#1f2937',
                    font: { size: 12, family: 'Titillium Web' },
                    padding: 15,
                    usePointStyle: true
                }
            },
            title: {
                display: true,
                text: `${customChartConfig.dimension} - Analisi Incidenti`,
                color: '#1f2937',
                font: { size: 16, weight: 'bold', family: 'Titillium Web' },
                padding: 20
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                padding: 12,
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += context.parsed.y || context.parsed.r || context.parsed;
                        return label;
                    }
                }
            },
            datalabels: {
                display: type !== 'line' && type !== 'scatter' && type !== 'bubble',
                color: type === 'pie' || type === 'doughnut' ? '#ffffff' : '#1f2937',
                font: { weight: 'bold', size: 11 },
                formatter: (value) => value > 0 ? value : ''
            }
        }
    };
    
    if (type === 'bar') {
        baseOptions.indexAxis = orientation === 'horizontal' ? 'y' : 'x';
        baseOptions.scales = {
            x: {
                ticks: { color: '#1f2937', font: { size: 11 } },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#1f2937', font: { size: 11 } },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            }
        };
    } else if (type === 'line') {
        baseOptions.scales = {
            x: {
                ticks: { color: '#1f2937', font: { size: 11 } },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#1f2937', font: { size: 11 } },
                grid: { color: 'rgba(148, 163, 184, 0.1)' }
            }
        };
    } else if (type === 'radar') {
        baseOptions.scales = {
            r: {
                beginAtZero: true,
                ticks: { color: '#1f2937', backdropColor: 'transparent' },
                grid: { color: 'rgba(148, 163, 184, 0.3)' },
                angleLines: { color: 'rgba(148, 163, 184, 0.3)' },
                pointLabels: { color: '#1f2937', font: { size: 11, weight: '600' } }
            }
        };
    }
    
    return baseOptions;
}

function generateColors(count) {
    const baseColors = [
        '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', 
        '#ef4444', '#ec4899', '#06b6d4', '#84cc16'
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
}

function generateGradientColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 360 / count) % 360;
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
}

function resetChartBuilder() {
    customChartConfig = {
        type: 'bar',
        dimension: null,
        metric: 'count',
        limit: 10,
        orientation: 'vertical'
    };
    
    document.querySelectorAll('.chart-type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === 'bar') {
            btn.classList.add('active');
        }
    });
    
    const dimensionSelect = document.getElementById('dimension-select');
    if (dimensionSelect) dimensionSelect.value = '';
    
    const metricSelect = document.getElementById('metric-select');
    if (metricSelect) metricSelect.value = 'count';
    
    const limitSelect = document.getElementById('limit-select');
    if (limitSelect) limitSelect.value = '10';
    
    const orientationSelect = document.getElementById('orientation-select');
    if (orientationSelect) orientationSelect.value = 'vertical';
    
    if (customChart) {
        customChart.destroy();
        customChart = null;
    }
    
    const wrapper = document.getElementById('chart-wrapper-custom');
    const placeholder = document.querySelector('.preview-placeholder');
    if (wrapper) wrapper.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    
    console.log('Chart Builder resettato');
}

function downloadCustomChart() {
    if (!customChart) {
        alert('⚠️ Genera prima un grafico da scaricare');
        return;
    }
    
    const canvas = document.getElementById('custom-chart-canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    link.download = `grafico_personalizzato_${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    console.log('Download grafico completato');
}

console.log('Chart Builder script caricato');