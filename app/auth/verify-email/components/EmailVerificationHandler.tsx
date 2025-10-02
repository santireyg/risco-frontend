// app/auth/verify-email/components/EmailVerificationHandler.tsx

import React, { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

import { useEmailVerification } from "../../hooks/useEmailVerification";

// Inline VerificationStatus component
interface VerificationStatusProps {
  type: "loading" | "success" | "error";
  title: string;
  message: string;
  showRetryButton?: boolean;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({
  type,
  title,
  message,
  showRetryButton = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case "loading":
        return <Spinner color="primary" size="lg" />;
      case "success":
        return <CheckCircleIcon className="h-16 w-16 text-success" />;
      case "error":
        return <XCircleIcon className="h-16 w-16 text-danger" />;
      default:
        return <CheckCircleIcon className="h-16 w-16 text-warning" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-success-50 border-success-200";
      case "error":
        return "bg-danger-50 border-danger-200";
      default:
        return "bg-default-50 border-default-200";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-success-700";
      case "error":
        return "text-danger-700";
      default:
        return "text-foreground-700";
    }
  };

  return (
    <Card className="max-w-md mx-auto px-4">
      <CardBody className="text-center space-y-2 py-6">
        <div className="flex justify-center">{getIcon()}</div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>

          <div className={`p-4 rounded-lg border ${getBackgroundColor()}`}>
            <p className={`text-sm ${getTextColor()}`}>{message}</p>
          </div>
        </div>

        {showRetryButton && (
          <div className="pt-4 space-y-4">
            <Button color="primary" onPress={() => window.location.reload()}>
              Intentar nuevamente
            </Button>

            <div className="text-center">
              <a className="text-primary hover:underline text-sm" href="/login">
                Volver al inicio de sesión
              </a>
            </div>
          </div>
        )}

        {type === "success" && (
          <div className="pt-4">
            <p className="text-xs text-foreground-500">
              Serás redirigido automáticamente...
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// Inline RedirectCountdown component
interface RedirectCountdownProps {
  countdown: number;
}

const RedirectCountdown: React.FC<RedirectCountdownProps> = ({ countdown }) => {
  return (
    <Card className="max-w-md mx-auto">
      <CardBody className="text-center py-4">
        <div className="flex items-center justify-center space-x-2">
          <ArrowRightIcon className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground-600">
            Redirigiendo al inicio de sesión en{" "}
            <span className="font-semibold text-primary">{countdown}</span>{" "}
            segundo
            {countdown !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-3">
          <a className="text-primary hover:underline text-sm" href="/login">
            Ir ahora al inicio de sesión
          </a>
        </div>
      </CardBody>
    </Card>
  );
};

interface EmailVerificationHandlerProps {
  token: string;
}

const EmailVerificationHandler: React.FC<EmailVerificationHandlerProps> = ({
  token,
}) => {
  const { loading, result, verifyEmail } = useEmailVerification();
  const [countdown, setCountdown] = useState(15);

  // Verify email when component mounts
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  // Handle countdown for successful verification
  useEffect(() => {
    if (result?.success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (result?.success && countdown === 0) {
      window.location.href = "/login";
    }
  }, [result?.success, countdown]);

  if (loading) {
    return (
      <VerificationStatus
        message="Por favor espera mientras verificamos tu email."
        title="Verificando email..."
        type="loading"
      />
    );
  }

  if (result?.success) {
    return (
      <div className="space-y-6">
        <VerificationStatus
          message={result.message}
          title="¡Email verificado correctamente!"
          type="success"
        />
        <RedirectCountdown countdown={countdown} />
      </div>
    );
  }

  if (result && !result.success) {
    return (
      <VerificationStatus
        showRetryButton
        message={result.error || result.message}
        title="Error en la verificación"
        type="error"
      />
    );
  }

  return null;
};

export default EmailVerificationHandler;
