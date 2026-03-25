/**
 * Inactivity Recovery Messages & Configuration
 *
 * Handles automatic recovery messaging for inactive conversations
 * and defines timing thresholds for the state machine
 */

export const RECOVERY_MESSAGES = {
  recovery_1: "Oi! 👋 Ainda estou aqui para te ajudar com informações sobre planos de saúde. Posso continuar?",
  recovery_2: "Olá! Percebi que ficamos sem contato. Se quiser conversar sobre planos quando for mais conveniente, pode me chamar aqui! 💛"
}

/**
 * Inactivity thresholds in hours
 * Used to transition conversation states based on time since last inbound message
 */
export const INACTIVITY_THRESHOLDS = {
  recovery_1: 4,      // 4h of no response → send first recovery message, move to recovery_1
  recovery_2: 24,     // 24h total → send second recovery message, move to recovery_2
  dormant: 48,        // 48h total → archive conversation, move to dormant
  closed: 7 * 24      // 7 days → close conversation permanently
}

/**
 * Contact activity log entry for inactivity-related status changes
 */
export const INACTIVITY_ACTIVITY_LOG = {
  recovery_1_sent: {
    type: 'status_change' as const,
    title: 'Primeira mensagem de recuperação enviada'
  },
  recovery_2_sent: {
    type: 'status_change' as const,
    title: 'Segunda mensagem de recuperação enviada (última tentativa)'
  },
  archived_by_inactivity: {
    type: 'status_change' as const,
    title: 'Conversa arquivada por inatividade prolongada'
  },
  closed_by_inactivity: {
    type: 'status_change' as const,
    title: 'Conversa encerrada automaticamente após período arquivado'
  }
}
