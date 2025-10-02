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
