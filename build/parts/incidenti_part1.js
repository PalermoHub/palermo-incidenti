// ==========================================
// PARTE 1: VARIABILI GLOBALI E CONFIGURAZIONI
// ==========================================

// Global Variables
let map;
let allIncidenti = [];
let currentFilters = {};
let showHeatmap = false;
let analyticsCharts = {};
let monthlyInjuriesChart = null;
let showClustering = false;
let topLuoghiData = [];
let monthlyAreaChart = null;

// Calendario Custom - Variabili Globali
let customCalendarState = {
    currentYear: 2023,
    selectedYear: null,
    selectedMonth: null,
    selectedWeekday: null,
    selectedDay: null
};

const MESI_ITALIANI = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const GIORNI_SETTIMANA = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const GIORNI_SETTIMANA_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

// Register Chart.js plugins globally
Chart.register(ChartDataLabels);

// Unregister datalabels by default
Chart.defaults.set('plugins.datalabels', {
    display: false
});

// Color Map per tipologie (invariato)
const colorMap = {
    'M': '#ef4444',  // Rosso - Mortale
    'R': '#a855f7',  // Viola - Riserva  
    'F': '#f59e0b',  // Ambra - Feriti
    'C': '#10b981'   // Verde - Cose
};

// Icone Font Awesome per tipologie (AGGIORNATO)
const tipologiaIcons = {
    'M': '<i class="fas fa-skull"></i>',           // Mortale
    'R': '<i class="fas fa-ambulance"></i>',       // Riserva
    'F': '<i class="fas fa-user-injured"></i>',    // Feriti
    'C': '<i class="fas fa-car-crash"></i>'        // Cose
};

// Nomi tipologie
const tipologiaNames = {
    'M': 'Mortale',
    'R': 'Riserva',
    'F': 'Feriti',
    'C': 'Cose'
};

// Basemap styles (invariato)
const basemapStyles = {
    'carto-dark': {
        version: 8,
        sources: {
            'carto': {
                type: 'raster',
                tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© CARTO | <a href="https://www.dati.gov.it/view-dataset?Cerca=incidenti+palermo" target="_blank">Fonte Dati: dati.gov.it</a> - Rielaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank">@gbvitrano</a> - <a href="http://opendatasicilia.it/" target="_blank">opendatasicilia.it</a>'
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
                attribution: '© OpenStreetMap contributors | <a href="https://www.dati.gov.it/view-dataset?Cerca=incidenti+palermo" target="_blank">Fonte Dati: dati.gov.it</a> - Rielaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank">@gbvitrano</a> - <a href="http://opendatasicilia.it/" target="_blank">opendatasicilia.it</a>'
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
                attribution: '© Google | <a href="https://www.dati.gov.it/view-dataset?Cerca=incidenti+palermo" target="_blank">Fonte Dati: dati.gov.it</a> - Rielaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank">@gbvitrano</a> - <a href="http://opendatasicilia.it/" target="_blank">opendatasicilia.it</a>'
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
                attribution: '© CARTO | <a href="https://www.dati.gov.it/view-dataset?Cerca=incidenti+palermo" target="_blank">Fonte Dati: dati.gov.it</a> - Rielaborazione: <a href="https://www.linkedin.com/in/gbvitrano/" target="_blank">@gbvitrano</a> - <a href="http://opendatasicilia.it/" target="_blank">opendatasicilia.it</a>'
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
