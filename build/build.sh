#!/bin/bash
# ==========================================
# BUILD SCRIPT - Incidenti Smart Awesome
# Assembla automaticamente le 9 parti in un unico file
# Compatibile: Linux, macOS, Git Bash (Windows)
# ==========================================

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  INCIDENTI PALERMO - BUILD SCRIPT     ║${NC}"
echo -e "${BLUE}║  Font Awesome Edition Builder v1.0    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Configurazione
OUTPUT_FILE="incidenti_smart-Awesome.js"
BACKUP_DIR="backups"
PARTS_DIR="parts"

# Array delle parti da assemblare
PARTS=(
    "incidenti_part1.js"
    "incidenti_part2.js"
    "incidenti_part3.js"
    "incidenti_part4.js"
    "incidenti_part5.js"
    "incidenti_part6.js"
    "incidenti_part7.js"
    "incidenti_part8.js"
    "incidenti_part9.js"
)

# Funzione di pulizia
cleanup() {
    if [ -f "$OUTPUT_FILE.tmp" ]; then
        rm "$OUTPUT_FILE.tmp"
    fi
}

# Trap per pulizia in caso di errore
trap cleanup EXIT

# Verifica esistenza cartella parts
if [ ! -d "$PARTS_DIR" ]; then
    echo -e "${RED}✗ Errore: cartella '$PARTS_DIR' non trovata!${NC}"
    echo -e "${YELLOW}  Crea la cartella e inserisci i file delle 9 parti${NC}"
    exit 1
fi

# Crea backup se il file esiste già
if [ -f "$OUTPUT_FILE" ]; then
    echo -e "${YELLOW}⚠ File $OUTPUT_FILE già esistente${NC}"
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/${OUTPUT_FILE}.${TIMESTAMP}.backup"
    cp "$OUTPUT_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup creato: $BACKUP_FILE${NC}"
fi

# Header del file output
cat > "$OUTPUT_FILE.tmp" << 'EOF'
// ==========================================
// INCIDENTI PALERMO - DASHBOARD INTERATTIVA
// File JavaScript Completo con Icone Font Awesome
// Versione: 2.0 - Font Awesome Edition
EOF

echo "// Build: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$OUTPUT_FILE.tmp"
echo "// ==========================================" >> "$OUTPUT_FILE.tmp"
echo "" >> "$OUTPUT_FILE.tmp"

# Contatori
TOTAL_PARTS=${#PARTS[@]}
CURRENT_PART=0
TOTAL_LINES=0

echo -e "${BLUE}📦 Assemblaggio in corso...${NC}"
echo ""

# Assembla ogni parte
for PART in "${PARTS[@]}"; do
    CURRENT_PART=$((CURRENT_PART + 1))
    PART_PATH="$PARTS_DIR/$PART"
    
    echo -n "   [$CURRENT_PART/$TOTAL_PARTS] $PART ... "
    
    if [ ! -f "$PART_PATH" ]; then
        echo -e "${RED}✗ NON TROVATO${NC}"
        echo -e "${RED}Errore: File $PART_PATH non esiste${NC}"
        rm "$OUTPUT_FILE.tmp"
        exit 1
    fi
    
    # Conta linee
    LINES=$(wc -l < "$PART_PATH")
    TOTAL_LINES=$((TOTAL_LINES + LINES))
    
    # Aggiungi separatore
    echo "" >> "$OUTPUT_FILE.tmp"
    echo "// ==========================================" >> "$OUTPUT_FILE.tmp"
    echo "// PARTE $CURRENT_PART - ${PART%.js}" >> "$OUTPUT_FILE.tmp"
    echo "// ==========================================" >> "$OUTPUT_FILE.tmp"
    echo "" >> "$OUTPUT_FILE.tmp"
    
    # Aggiungi contenuto
    cat "$PART_PATH" >> "$OUTPUT_FILE.tmp"
    
    echo -e "${GREEN}✓ OK${NC} ($LINES linee)"
done

# Muovi il file temporaneo al file finale
mv "$OUTPUT_FILE.tmp" "$OUTPUT_FILE"

# Statistiche finali
FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        BUILD COMPLETATO CON SUCCESSO   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📄 File creato:${NC} $OUTPUT_FILE"
echo -e "${BLUE}📊 Dimensione:${NC} $FILE_SIZE"
echo -e "${BLUE}📝 Linee totali:${NC} $TOTAL_LINES"
echo -e "${BLUE}🧩 Parti assemblate:${NC} $TOTAL_PARTS"
echo ""

# Verifica sintassi JavaScript (se node è disponibile)
if command -v node &> /dev/null; then
    echo -e "${YELLOW}🔍 Verifica sintassi JavaScript...${NC}"
    if node -c "$OUTPUT_FILE" 2>/dev/null; then
        echo -e "${GREEN}✓ Sintassi corretta${NC}"
    else
        echo -e "${RED}✗ Errori di sintassi rilevati${NC}"
        echo -e "${YELLOW}  Controlla il file manualmente${NC}"
    fi
    echo ""
fi

# Istruzioni finali
echo -e "${BLUE}📋 Prossimi passi:${NC}"
echo "   1. Aggiorna index.html per usare il nuovo file JS"
echo "   2. Verifica che Font Awesome sia incluso nell'HTML"
echo "   3. Apri index.html nel browser per testare"
echo ""
echo -e "${GREEN}✨ Build completato! Happy coding! ✨${NC}"

exit 0

# ==========================================
# VERSIONE WINDOWS BATCH (build.bat)
# Salva questo come file separato: build.bat
# ==========================================
: << 'BATCH_VERSION'
@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   INCIDENTI PALERMO - BUILD SCRIPT
echo   Font Awesome Edition Builder v1.0 (Windows)
echo ================================================
echo.

set OUTPUT_FILE=incidenti_smart-Awesome.js
set PARTS_DIR=parts
set BACKUP_DIR=backups

REM Verifica cartella parts
if not exist "%PARTS_DIR%" (
    echo [ERROR] Cartella '%PARTS_DIR%' non trovata!
    echo         Crea la cartella e inserisci i file delle 9 parti
    pause
    exit /b 1
)

REM Backup file esistente
if exist "%OUTPUT_FILE%" (
    echo [WARNING] File %OUTPUT_FILE% gia esistente
    if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
    copy "%OUTPUT_FILE%" "%BACKUP_DIR%\%OUTPUT_FILE%.%mydate%-%mytime%.backup" >nul
    echo [OK] Backup creato
)

REM Header
echo // ========================================== > "%OUTPUT_FILE%"
echo // INCIDENTI PALERMO - DASHBOARD INTERATTIVA >> "%OUTPUT_FILE%"
echo // File JavaScript Completo con Icone Font Awesome >> "%OUTPUT_FILE%"
echo // Versione: 2.0 - Font Awesome Edition >> "%OUTPUT_FILE%"
echo // Build: %date% %time% >> "%OUTPUT_FILE%"
echo // ========================================== >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

REM Assembla parti
set PART_NUM=0
for %%F in (incidenti_part1.js incidenti_part2.js incidenti_part3.js incidenti_part4.js incidenti_part5.js incidenti_part6.js incidenti_part7.js incidenti_part8.js incidenti_part9.js) do (
    set /a PART_NUM+=1
    echo    [!PART_NUM!/9] Aggiungendo %%F ...
    
    if not exist "%PARTS_DIR%\%%F" (
        echo [ERROR] File %PARTS_DIR%\%%F non trovato!
        pause
        exit /b 1
    )
    
    echo. >> "%OUTPUT_FILE%"
    echo // ========================================== >> "%OUTPUT_FILE%"
    echo // PARTE !PART_NUM! - %%~nF >> "%OUTPUT_FILE%"
    echo // ========================================== >> "%OUTPUT_FILE%"
    echo. >> "%OUTPUT_FILE%"
    
    type "%PARTS_DIR%\%%F" >> "%OUTPUT_FILE%"
)

echo.
echo ================================================
echo         BUILD COMPLETATO CON SUCCESSO
echo ================================================
echo.
echo File creato: %OUTPUT_FILE%
echo.
echo Prossimi passi:
echo   1. Aggiorna index.html per usare il nuovo file JS
echo   2. Verifica Font Awesome nell'HTML
echo   3. Apri index.html nel browser
echo.
pause
BATCH_VERSION
