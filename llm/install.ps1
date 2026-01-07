# ================================================================
# PGV Planning - Installation LLM Local (Windows PowerShell)
# ================================================================
# Ce script installe et configure Ollama avec le modèle PGV-Absence
# ================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PGV Planning - Installation LLM      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier si Ollama est installé
Write-Host "[1/4] Vérification d'Ollama..." -ForegroundColor Yellow

$ollamaInstalled = Get-Command ollama -ErrorAction SilentlyContinue

if (-not $ollamaInstalled) {
    Write-Host "  -> Ollama non trouvé. Installation..." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Télécharge Ollama depuis: https://ollama.com/download" -ForegroundColor White
    Write-Host "  Ou exécute: winget install Ollama.Ollama" -ForegroundColor White
    Write-Host ""

    $install = Read-Host "Voulez-vous installer via winget? (O/N)"
    if ($install -eq "O" -or $install -eq "o") {
        winget install Ollama.Ollama
        Write-Host "  -> Relancez ce script après l'installation" -ForegroundColor Yellow
        exit
    } else {
        Write-Host "  -> Installation manuelle requise" -ForegroundColor Red
        exit
    }
}

Write-Host "  -> Ollama installé!" -ForegroundColor Green

# Étape 2: Démarrer Ollama (si pas déjà lancé)
Write-Host "[2/4] Démarrage d'Ollama..." -ForegroundColor Yellow

$ollamaRunning = Get-Process ollama -ErrorAction SilentlyContinue
if (-not $ollamaRunning) {
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "  -> Ollama démarré en arrière-plan" -ForegroundColor Green
} else {
    Write-Host "  -> Ollama déjà en cours d'exécution" -ForegroundColor Green
}

# Étape 3: Télécharger le modèle de base
Write-Host "[3/4] Téléchargement du modèle Qwen 2.5 3B..." -ForegroundColor Yellow
Write-Host "  (Environ 1.5 GB - peut prendre quelques minutes)" -ForegroundColor Gray

ollama pull qwen2.5:3b

if ($LASTEXITCODE -ne 0) {
    Write-Host "  -> Erreur lors du téléchargement" -ForegroundColor Red
    exit 1
}
Write-Host "  -> Modèle de base téléchargé!" -ForegroundColor Green

# Étape 4: Créer le modèle personnalisé PGV
Write-Host "[4/4] Création du modèle PGV-Absence..." -ForegroundColor Yellow

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

ollama create pgv-absence -f Modelfile

if ($LASTEXITCODE -ne 0) {
    Write-Host "  -> Erreur lors de la création du modèle" -ForegroundColor Red
    exit 1
}

Write-Host "  -> Modèle pgv-absence créé!" -ForegroundColor Green

# Résumé
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  INSTALLATION TERMINÉE!               " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Modèle: pgv-absence" -ForegroundColor White
Write-Host "Endpoint: http://localhost:11434/v1/chat/completions" -ForegroundColor White
Write-Host ""
Write-Host "Configuration PGV Planning:" -ForegroundColor Cyan
Write-Host "  1. Ouvrir l'application" -ForegroundColor White
Write-Host "  2. Aller dans Paramètres" -ForegroundColor White
Write-Host "  3. Cliquer sur 'Ollama (Local)'" -ForegroundColor White
Write-Host ""
Write-Host "Test du modèle:" -ForegroundColor Cyan
Write-Host "  ollama run pgv-absence" -ForegroundColor Gray
Write-Host ""

# Test rapide
Write-Host "Voulez-vous tester le modèle maintenant? (O/N)" -ForegroundColor Yellow
$test = Read-Host

if ($test -eq "O" -or $test -eq "o") {
    Write-Host ""
    Write-Host "Test en cours..." -ForegroundColor Yellow
    Write-Host ""
    ollama run pgv-absence "Rédige un message d'absence pour Marie. Raison: congés. Ton: professionnel."
}

Write-Host ""
Write-Host "Merci d'utiliser PGV Planning!" -ForegroundColor Cyan
