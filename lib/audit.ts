/**
 * Système de journalisation d'audit - Sécurité
 * 
 * Enregistre les opérations critiques (connexions, modifications d'équipe,
 * changements de rôles, etc.) dans Firestore pour la conformité
 * et la surveillance de sécurité.
 */

import { adminDb } from '@/lib/firebase/server';

/** Paramètres pour créer une entrée d'audit */
export interface AuditLogParams {
  userId: string;       // Identifiant de l'utilisateur
  action: string;       // Action effectuée (ex: 'team.create')
  resourceType: string; // Type de ressource (ex: 'team', 'member')
  resourceId?: string;  // Identifiant de la ressource concernée
  metadata?: Record<string, unknown>; // Données supplémentaires
  ip?: string | null;       // Adresse IP du client
  userAgent?: string | null; // User-Agent du navigateur
}

/**
 * Créer une entrée dans le journal d'audit.
 * Utilise le client admin pour contourner les règles de sécurité (RLS).
 */
export async function createAuditLog(params: AuditLogParams): Promise<{ success: boolean; error?: unknown }> {
  try {
    await adminDb.collection('audit_logs').add({
      user_id: params.userId,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId || null,
      metadata: params.metadata || {},
      ip_address: params.ip || null,
      user_agent: params.userAgent || null,
      created_at: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('[Audit] Erreur inattendue :', error);
    return { success: false, error };
  }
}

/**
 * Extraire les informations du client depuis les en-têtes HTTP.
 * Récupère l'adresse IP (via proxy ou directe) et le User-Agent.
 */
export function getClientInfo(headers: Headers): { ip: string | null; userAgent: string | null } {
  // Vérifier d'abord l'en-tête de proxy (X-Forwarded-For)
  const forwardedFor = headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : headers.get('x-real-ip');
  const userAgent = headers.get('user-agent');

  return { ip, userAgent };
}

/**
 * Types d'actions d'audit - Constantes pour la cohérence.
 * Utilisées dans tout le code pour éviter les fautes de frappe.
 */
export const AUDIT_ACTIONS = {
  // Authentification
  AUTH_LOGIN: 'auth.login',          // Connexion réussie
  AUTH_LOGOUT: 'auth.logout',        // Déconnexion
  AUTH_SIGNUP: 'auth.signup',        // Création de compte

  // Équipes
  TEAM_CREATE: 'team.create',        // Création d'équipe
  TEAM_DELETE: 'team.delete',        // Suppression d'équipe
  TEAM_UPDATE: 'team.update',        // Modification d'équipe
  TEAM_JOIN: 'team.join',            // Rejoindre une équipe
  TEAM_LEAVE: 'team.leave',          // Quitter une équipe

  // Membres
  MEMBER_ROLE_CHANGE: 'member.role_change', // Changement de rôle
  MEMBER_REMOVE: 'member.remove',           // Suppression d'un membre

  // Calendrier
  CALENDAR_EXPORT: 'calendar.export', // Export du calendrier

  // Congés
  LEAVE_REQUEST: 'leave.request',              // Demande de congé
  LEAVE_BALANCE_RESET: 'leave.balance_reset',  // Réinitialisation des soldes

  // Sécurité
  RATE_LIMIT_EXCEEDED: 'security.rate_limit',    // Limite de requêtes dépassée
  UNAUTHORIZED_ACCESS: 'security.unauthorized',  // Accès non autorisé
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

/**
 * Fonction pratique pour journaliser avec le contexte de la requête HTTP.
 * Extrait automatiquement l'IP et le User-Agent des en-têtes.
 */
export async function auditWithRequest(
  request: Request,
  params: Omit<AuditLogParams, 'ip' | 'userAgent'>
): Promise<{ success: boolean; error?: unknown }> {
  const { ip, userAgent } = getClientInfo(request.headers);
  return createAuditLog({
    ...params,
    ip,
    userAgent,
  });
}
