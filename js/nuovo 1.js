// Update Monthly Area Chart (Grafico ad Area Incidenti/Feriti per Mese)
let monthlyAreaChart = null;



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
    
    const selectedMese = currentFilters['filter-mese'];
    
    const canvas = document.getElementById('monthly-area-chart');
    if (!canvas) return;
    
    if (monthlyAreaChart) {
        monthlyAreaChart.destroy();
    }
    
    const pointBackgroundIncidenti = MESI_ITALIANI.map(m => 
        selectedMese === m ? '#dc2626' : '#ef4444'
    );
    const pointBackgroundFeriti = MESI_ITALIANI.map(m => 
        selectedMese === m ? '#d97706' : '#f59e0b'
    );
    const pointRadius = MESI_ITALIANI.map(m => 
        selectedMese === m ? 6 : 4
    );
    
    monthlyAreaChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: MESI_ITALIANI,
            datasets: [
                {
                    label: 'Incidenti',
                    data: countsAll,
                    backgroundColor: 'rgba(239, 68, 68, 0.3)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: pointBackgroundIncidenti,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: pointRadius,
                    pointHoverRadius: 7
                },
                {
                    label: 'Feriti',
                    data: countsFeriti,
                    backgroundColor: 'rgba(245, 158, 11, 0.3)',
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: pointBackgroundFeriti,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: pointRadius,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
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
                            const value = context.parsed.y;
                            return `${label}: ${value}`;
                        },
                        afterBody: function(context) {
                            const mese = MESI_ITALIANI[context[0].dataIndex];
                            if (selectedMese === mese) {
                                return '\nClicca per deselezionare';
                            }
                            return 'Clicca per filtrare';
                        }
                    }
                },
                datalabels: {
                    display: true,
                    align: 'top',
                    offset: 4,
                    color: '#1e293b',
                    font: { 
                        weight: 'bold', 
                        size: 9
                    },
                    backgroundColor: 'rgba(241, 245, 249, 0.95)',
                    borderRadius: 3,
                    padding: 2,
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                x: { 
                    ticks: { 
                        color: '#94a3b8',
                        font: { size: 9 }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                y: { 
                    beginAtZero: true,
                    ticks: { 
                        color: '#94a3b8',
                        font: { size: 9 }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
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




// Update Monthly Injuries Chart (Grafico Radar Incidenti/Feriti/Morti per Mese)
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
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    pointBackgroundColor: MESI_ITALIANI.map(m => 
                        selectedMese === m ? '#dc2626' : '#ef4444'
                    ),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
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
                    pointBorderWidth: 2,
                    pointRadius: MESI_ITALIANI.map(m => 
                        selectedMese === m ? 5 : 3
                    ),
                    pointHoverRadius: 6
                },
                {
                    label: 'Morti',
                    data: countsMorti,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    pointBackgroundColor: MESI_ITALIANI.map(m => 
                        selectedMese === m ? '#2563eb' : '#3b82f6'
                    ),
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
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
                        color: 'rgba(148, 163, 184, 0.2)'
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