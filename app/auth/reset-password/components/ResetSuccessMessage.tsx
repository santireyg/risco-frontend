// app/auth/reset-password/components/ResetSuccessMessage.tsx

import React from "react";
import { Card, CardBody } from "@heroui/card";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

import RedirectCountdown from "../../verify-email/components/RedirectCountdown";

interface ResetSuccessMessageProps {
  message: string;
  countdown: number;
}

const ResetSuccessMessage: React.FC<ResetSuccessMessageProps> = ({
  message,
  countdown,
}) => {
  return (
    <div className="space-y-6">
      <Card className="max-w-md mx-auto">
        <CardBody className="text-center space-y-4 py-8">
          <div className="flex justify-center">
            <CheckCircleIcon className="h-16 w-16 text-success" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              ¡Contraseña Actualizada!
            </h2>

            <div className="bg-success-50 p-4 rounded-lg border border-success-200">
              <p className="text-sm text-success-700">{message}</p>
            </div>
          </div>

          <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
            <p className="text-sm text-primary-700">
              <strong>Ya puedes usar tu nueva contraseña</strong>
            </p>
            <p className="text-xs text-primary-600 mt-1">
              Ahora puedes iniciar sesión con tu nueva contraseña en cualquier
              momento.
            </p>
          </div>
        </CardBody>
      </Card>

      <RedirectCountdown countdown={countdown} />
    </div>
  );
};

export default ResetSuccessMessage;
