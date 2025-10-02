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
