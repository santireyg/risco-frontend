// app/auth/register/components/PasswordStrengthIndicator.tsx

import React from "react";

import { validatePasswordStrength } from "../../utils/validations";

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  const { rules, score, strength } = validatePasswordStrength(password);

  if (!password) return null;

  const getProgressColor = () => {
    switch (strength) {
      case "strong":
        return "bg-success";
      case "medium":
        return "bg-warning";
      default:
        return "bg-danger";
    }
  };

  const getLabel = () => {
    switch (strength) {
      case "strong":
        return "Fuerte";
      case "medium":
        return "Media";
      default:
        return "Débil";
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Custom Progress Bar */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-foreground-600">Fortaleza:</span>
          <span
            className={`text-xs font-medium ${
              strength === "strong"
                ? "text-success"
                : strength === "medium"
                  ? "text-warning"
                  : "text-danger"
            }`}
          >
            {getLabel()}
          </span>
        </div>
        <div className="w-full bg-default-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${(score / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div
          className={`flex items-center space-x-1 ${rules.minLength ? "text-success" : "text-danger"}`}
        >
          <span>{rules.minLength ? "✓" : "✗"}</span>
          <span>Mínimo 8 caracteres</span>
        </div>
        <div
          className={`flex items-center space-x-1 ${rules.hasUpper ? "text-success" : "text-danger"}`}
        >
          <span>{rules.hasUpper ? "✓" : "✗"}</span>
          <span>Una mayúscula</span>
        </div>
        <div
          className={`flex items-center space-x-1 ${rules.hasLower ? "text-success" : "text-danger"}`}
        >
          <span>{rules.hasLower ? "✓" : "✗"}</span>
          <span>Una minúscula</span>
        </div>
        <div
          className={`flex items-center space-x-1 ${rules.hasDigit ? "text-success" : "text-danger"}`}
        >
          <span>{rules.hasDigit ? "✓" : "✗"}</span>
          <span>Un número</span>
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
