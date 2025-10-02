// ==========================================
// PARTE 4: FUNZIONI DOWNLOAD E ANALYTICS
// ==========================================

// Download CSV
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

// Download JSON
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

// Download Top Luoghi CSV
function downloadTopLuoghiCSV() {
    if (topLuoghiData.length === 0) {
        alert('Nessun dato da scaricare');
        return;
    }
    
    let csv = 'Posizione,Indirizzo,Totale Incidenti,Mortali,Riserva,Feriti,Cose\n';
    
    topLuoghiData.forEach((item, index) => {
        const indirizzo = item.indirizzo.replace(/"/g, '""');
        csv += `${index + 1},"${indirizzo}",${item.total},${item.M},${item.R},${item.F},${item.C}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const annoFiltro = currentFilters['filter-anno'] || 'tutti';
    link.setAttribute('href', url);
    link.setAttribute('download', `top_50_luoghi_palermo_${annoFiltro}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Analytics Functions
function openAnalytics() {
    const panel = document.getElementById('analytics-panel');
    if (panel) {
        panel.classList.add('open');
        updateActiveFiltersDisplay();
        updateAnalytics();
    }
}

function closeAnalytics() {
    const panel = document.getElementById('analytics-panel');
    if (panel) panel.classList.remove('open');
}

function updateActiveFiltersDisplay() {
    const filteredData = getFilteredData();
    const totalData = allIncidenti.length;
    
    let filterText = [];
    
    if (currentFilters['filter-data-selezionata']) {
        filterText.push(`Data: ${currentFilters['filter-data-selezionata']}`);
    }
    
    if (currentFilters['filter-anno']) {
        filterText.push(`Anno: ${currentFilters['filter-anno']}`);
    }
    
    if (currentFilters['filter-mese']) {
        filterText.push(`Mese: ${currentFilters['filter-mese']}`);
    }
    
    if (currentFilters['filter-giorno-settimana']) {
        filterText.push(`Giorno: ${currentFilters['filter-giorno-settimana']}`);
    }
    
    if (currentFilters['filter-tipologia']) {
        filterText.push(`Tipologia: ${currentFilters['filter-tipologia']}`);
    }
    
    let displayHTML = '';
    
    if (filterText.length === 0) {
        displayHTML = `Tutti gli incidenti (2015-2023) • ${totalData.toLocaleString('it-IT')} incidenti totali`;
    } else {
        displayHTML = `${filteredData.length.toLocaleString('it-IT')} di ${totalData.toLocaleString('it-IT')} incidenti • `;
        displayHTML += filterText.map(f => `<span class="filter-badge">${f}</span>`).join('');
    }
    
    const activeFiltersText = document.getElementById('active-filters-text');
    if (activeFiltersText) {
        activeFiltersText.innerHTML = displayHTML;
    }
}

function switchAnalyticsTab(tabName) {
    document.querySelectorAll('.analytics-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.analytics-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    const selectedContent = document.getElementById(`tab-${tabName}`);
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedContent) selectedContent.classList.add('active');
}

function updateAnalytics() {
    const filteredData = getFilteredData();
    
    updatePanoramicaCharts(filteredData);
    updateTemporaleCharts(filteredData);
    updateOrariaCharts(filteredData);
    updateCondizioniCharts(filteredData);
    updateInsights(filteredData);
    
    setTimeout(() => {
        addChartDownloadButtons();
    }, 100);
}

// Add Chart Download Buttons (ICONA AGGIORNATA)
function addChartDownloadButtons() {
    const chartContainers = document.querySelectorAll('.chart-container');
    
    chartContainers.forEach(container => {
        if (container.querySelector('.chart-download-btn')) return;
        
        const canvas = container.querySelector('canvas');
        if (!canvas) return;
        
        const chartId = canvas.id;
        const chartTitle = container.querySelector('h3')?.textContent || 'grafico';
        
        const btn = document.createElement('button');
        btn.className = 'chart-download-btn';
        btn.innerHTML = '<i class="fas fa-download"></i> PNG';
        btn.title = 'Scarica grafico come PNG';
        
        btn.onclick = () => {
            const filename = `${chartTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}`;
            downloadChartAsPNG(chartId, filename);
        };
        
        container.appendChild(btn);
    });
}

// Download Chart as PNG
async function downloadChartAsPNG(chartId, filename) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const chartInstance = Chart.getChart(canvas);
    if (!chartInstance) return;
    
    const originalOptions = JSON.parse(JSON.stringify(chartInstance.options));
    
    if (chartInstance.options.scales) {
        Object.keys(chartInstance.options.scales).forEach(scaleKey => {
            const scale = chartInstance.options.scales[scaleKey];
            if (scale.ticks) {
                scale.ticks.color = '#1e293b';
            }
            if (scale.grid) {
                scale.grid.color = 'rgba(148, 163, 184, 0.3)';
            }
            if (scale.pointLabels) {
                scale.pointLabels.color = '#1e293b';
            }
        });
    }
    
    if (chartInstance.options.plugins?.legend?.labels) {
        chartInstance.options.plugins.legend.labels.color = '#1e293b';
    }
    
    chartInstance.update();
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    const padding = 80;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height + padding;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    ctx.drawImage(canvas, 0, 0);
    
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = 'https://palermohub.opendatasicilia.it/lib/images/opendatasicilia.png';
    
    logo.onload = function() {
        const logoHeight = 35;
        const logoWidth = logo.width * (logoHeight / logo.height);
        const xPos = tempCanvas.width - logoWidth - 10;
        const yPos = tempCanvas.height - logoHeight - 35;
        
        ctx.drawImage(logo, xPos, yPos, logoWidth, logoHeight);
        
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px Titillium Web';
        ctx.textAlign = 'left';
        
        ctx.fillText('Fonte Dati: dati.gov.it - Comune di Palermo - Rielaborazione: opendatasicilia.it', 10, tempCanvas.height - 35);
        
        ctx.font = '10px Titillium Web';
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('https://opendatasicilia.github.io/incidenti_palermo/', 10, tempCanvas.height - 20);
        
        const link = document.createElement('a');
        link.download = filename + '.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
        
        chartInstance.options = originalOptions;
        chartInstance.update();
    };
    
    logo.onerror = function() {
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px Titillium Web';
        ctx.textAlign = 'left';
        ctx.fillText('Fonte Dati: dati.gov.it - Comune di Palermo - Rielaborazione: opendatasicilia.it', 10, tempCanvas.height - 35);
        ctx.font = '10px Titillium Web';
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('https://opendatasicilia.github.io/incidenti_palermo/', 10, tempCanvas.height - 20);
        
        const link = document.createElement('a');
        link.download = filename + '.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
        
        chartInstance.options = originalOptions;
        chartInstance.update();
    };
}

// Data Table Functions
function openDataTable() {
    const filteredData = getFilteredData();
    const modal = document.getElementById('data-table-modal');
    
    if (!modal) return;
    
    const tableCount = document.getElementById('table-count');
    if (tableCount) {
        tableCount.textContent = filteredData.length.toLocaleString('it-IT');
    }
    
    if (filteredData.length === 0) {
        const tableHeader = document.getElementById('table-header');
        const tableBody = document.getElementById('table-body');
        if (tableHeader) tableHeader.innerHTML = '';
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="100" style="text-align: center; padding: 40px; color: #94a3b8;">Nessun dato da visualizzare</td></tr>';
        }
        modal.classList.add('show');
        return;
    }
    
    const keys = Object.keys(filteredData[0]);
    let headerHtml = '<tr>';
    keys.forEach(key => {
        headerHtml += `<th>${key}</th>`;
    });
    headerHtml += '</tr>';
    
    const tableHeader = document.getElementById('table-header');
    if (tableHeader) tableHeader.innerHTML = headerHtml;
    
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
    
    const tableBody = document.getElementById('table-body');
    if (tableBody) tableBody.innerHTML = bodyHtml;
    
    modal.classList.add('show');
}

function closeDataTable() {
    const modal = document.getElementById('data-table-modal');
    if (modal) modal.classList.remove('show');
}
