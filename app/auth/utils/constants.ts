// app/auth/utils/constants.ts

export const RATE_LIMITS = {
  REGISTER: { attempts: 5, windowMinutes: 60 },
  FORGOT_PASSWORD: { attempts: 3, windowMinutes: 60 },
  ADMIN_ACTIONS: { attempts: 30, windowMinutes: 60 },
};

export const RATE_LIMIT_KEYS = {
  REGISTER: "auth:register:lastAttempt",
  FORGOT_PASSWORD: "auth:forgotPassword:lastAttempt",
  ADMIN_ACTIONS: "auth:adminActions:lastAttempt",
};

export const USER_STATUS = {
  PENDING_APPROVAL: "pending_approval",
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPERUSER: "superadmin",
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Error de red. Por favor, intenta nuevamente.",
  UNAUTHORIZED: "No tienes permisos para realizar esta acción.",
  RATE_LIMIT: "Demasiados intentos. Intenta nuevamente en {time}.",
  INVALID_TOKEN: "El link es inválido o ha expirado.",
  VALIDATION_ERROR: "Por favor, revisa los datos ingresados.",
  SERVER_ERROR: "Error del servidor. Por favor, intenta más tarde.",
};

export const SUCCESS_MESSAGES = {
  REGISTRATION:
    "Tu solicitud de cuenta fué recibida exitosamente. Te hemos enviado un correo electrónico con instrucciones para verificar tu cuenta.",
  EMAIL_VERIFIED:
    "Email verificado. Tu cuenta está pendiente de aprobación por un administrador.",
  PASSWORD_RESET_SENT:
    "Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.",
  PASSWORD_RESET:
    "Contraseña actualizada correctamente. Puedes iniciar sesión.",
  PROFILE_UPDATED: "Perfil actualizado correctamente.",
  USER_APPROVED: "Usuario aprobado correctamente.",
  USER_REJECTED: "Usuario rechazado correctamente.",
  USER_UPDATED: "Usuario actualizado correctamente.",
};
