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
