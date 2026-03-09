/**
 * Utilitaires pour la génération de codes et Identifiants
 */

/**
 * Génère un code d'équipe unique de 8 caractères alphanumériques.
 * Utilisé pour permettre aux membres de rejoindre une équipe.
 */
export function generateTeamCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Génère un token d'invitation sécurisé (64 caractères).
 */
export function generateInvitationToken(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}
