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
                    anchor: 'end',
                    align: 'end',
                    color: '#f1f5f9',
                    font: {
                        size: 10,
                        weight: 'bold'
                    },
                    formatter: (value) => value > 0 ? value.toLocaleString('it-IT') : '',
                    offset: 4
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
                    borderWidth: 0.5,
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
                    borderWidth: 0.5,
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
