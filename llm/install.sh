#!/bin/bash
# ================================================================
# PGV Planning - Installation LLM Local (Linux/Mac)
# ================================================================
# Ce script installe et configure Ollama avec le modèle PGV-Absence
# ================================================================

echo ""
echo "========================================"
echo "  PGV Planning - Installation LLM      "
echo "========================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Étape 1: Vérifier si Ollama est installé
echo -e "${YELLOW}[1/4] Vérification d'Ollama...${NC}"

if ! command -v ollama &> /dev/null; then
    echo -e "  ${RED}-> Ollama non trouvé. Installation...${NC}"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "  Installation via Homebrew..."
        brew install ollama
    else
        # Linux
        echo "  Installation via script officiel..."
        curl -fsSL https://ollama.com/install.sh | sh
    fi

    if [ $? -ne 0 ]; then
        echo -e "  ${RED}-> Erreur d'installation${NC}"
        exit 1
    fi
fi

echo -e "  ${GREEN}-> Ollama installé!${NC}"

# Étape 2: Démarrer Ollama
echo -e "${YELLOW}[2/4] Démarrage d'Ollama...${NC}"

if ! pgrep -x "ollama" > /dev/null; then
    ollama serve &
    sleep 3
    echo -e "  ${GREEN}-> Ollama démarré en arrière-plan${NC}"
else
    echo -e "  ${GREEN}-> Ollama déjà en cours d'exécution${NC}"
fi

# Étape 3: Télécharger le modèle de base
echo -e "${YELLOW}[3/4] Téléchargement du modèle Qwen 2.5 3B...${NC}"
echo "  (Environ 1.5 GB - peut prendre quelques minutes)"

ollama pull qwen2.5:3b

if [ $? -ne 0 ]; then
    echo -e "  ${RED}-> Erreur lors du téléchargement${NC}"
    exit 1
fi
echo -e "  ${GREEN}-> Modèle de base téléchargé!${NC}"

# Étape 4: Créer le modèle personnalisé
echo -e "${YELLOW}[4/4] Création du modèle PGV-Absence...${NC}"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

ollama create pgv-absence -f Modelfile

if [ $? -ne 0 ]; then
    echo -e "  ${RED}-> Erreur lors de la création du modèle${NC}"
    exit 1
fi

echo -e "  ${GREEN}-> Modèle pgv-absence créé!${NC}"

# Résumé
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  INSTALLATION TERMINÉE!               ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Modèle: pgv-absence"
echo "Endpoint: http://localhost:11434/v1/chat/completions"
echo ""
echo -e "${CYAN}Configuration PGV Planning:${NC}"
echo "  1. Ouvrir l'application"
echo "  2. Aller dans Paramètres"
echo "  3. Cliquer sur 'Ollama (Local)'"
echo ""
echo -e "${CYAN}Test du modèle:${NC}"
echo "  ollama run pgv-absence"
echo ""

# Test rapide
echo -e "${YELLOW}Voulez-vous tester le modèle maintenant? (o/n)${NC}"
read -r test

if [[ "$test" == "o" || "$test" == "O" ]]; then
    echo ""
    echo "Test en cours..."
    echo ""
    ollama run pgv-absence "Rédige un message d'absence pour Marie. Raison: congés. Ton: professionnel."
fi

echo ""
echo -e "${CYAN}Merci d'utiliser PGV Planning!${NC}"
