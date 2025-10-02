// app/auth/utils/validations.ts

export interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  message: string;
  validator?: (value: string) => boolean;
}

export interface ValidationRules {
  email: ValidationRule;
  password: ValidationRule;
  username: ValidationRule;
  names: ValidationRule;
}

export const validationRules: ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Ingresa un email válido con formato usuario@empresa.com",
    validator: (email: string) => {
      // Validación básica de formato
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        return false;
      }

      // Verificar que no sea un dominio de email personal común
      const personalDomains = [
        "gmail.com",
        "yahoo.com",
        "hotmail.com",
        "outlook.com",
        "icloud.com",
      ];
      const domain = email.split("@")[1]?.toLowerCase();

      return domain ? !personalDomains.includes(domain) : true;
    },
  },
  password: {
    minLength: 8,
    validator: (password: string) => {
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasDigit = /\d/.test(password);

      return password.length >= 8 && hasUpper && hasLower && hasDigit;
    },
    message:
      "La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 dígito",
  },
  username: {
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message:
      "Username debe tener 3-20 caracteres (letras, números y guiones bajos)",
  },
  names: {
    pattern: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
    message: "Debe tener 2-50 caracteres, solo letras y espacios",
  },
};

export const validateField = (
  value: string,
  rule: ValidationRule,
): { isValid: boolean; message?: string } => {
  if (!value.trim()) {
    return { isValid: false, message: "Este campo es obligatorio" };
  }

  if (rule.minLength && value.length < rule.minLength) {
    return { isValid: false, message: rule.message };
  }

  if (rule.pattern && !rule.pattern.test(value)) {
    return { isValid: false, message: rule.message };
  }

  if (rule.validator && !rule.validator(value)) {
    return { isValid: false, message: rule.message };
  }

  return { isValid: true };
};

// Función específica para validar email con feedback mejorado
export const validateEmailField = (
  email: string,
): { isValid: boolean; message?: string } => {
  if (!email.trim()) {
    return { isValid: false, message: "El email es obligatorio" };
  }

  // Validación básica de formato
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return {
      isValid: false,
      message: "Ingresa un email válido con formato usuario@empresa.com",
    };
  }

  // Verificar que no sea un dominio de email personal común
  const personalDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "live.com",
  ];
  const domain = email.split("@")[1]?.toLowerCase();

  if (domain && personalDomains.includes(domain)) {
    return {
      isValid: false, // No es válido para registro corporativo
      message: "Preferiblemente usa tu email corporativo para el registro",
    };
  }

  return { isValid: true };
};

export const validatePasswordStrength = (password: string) => {
  const rules = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasDigit: /\d/.test(password),
  };

  const score = Object.values(rules).filter(Boolean).length;

  return {
    rules,
    score,
    strength: score === 4 ? "strong" : score >= 2 ? "medium" : "weak",
  };
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): boolean => {
  return password === confirmPassword && password.length > 0;
};
