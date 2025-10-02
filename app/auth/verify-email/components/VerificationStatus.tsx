// app/auth/verify-email/components/VerificationStatus.tsx

import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { Spinner } from "@heroui/spinner";

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
        return <ClockIcon className="h-16 w-16 text-warning" />;
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
    <Card className="max-w-md mx-auto">
      <CardBody className="text-center space-y-4 py-8">
        <div className="flex justify-center">{getIcon()}</div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>

          <div className={`p-4 rounded-lg border ${getBackgroundColor()}`}>
            <p className={`text-sm ${getTextColor()}`}>{message}</p>
          </div>
        </div>

        {showRetryButton && (
          <div className="pt-4 space-y-3">
            <Button
              color="primary"
              variant="ghost"
              onClick={() => window.location.reload()}
            >
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

export default VerificationStatus;
