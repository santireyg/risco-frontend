// app/auth/forgot-password/components/EmailSubmitConfirmation.tsx

import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface EmailSubmitConfirmationProps {
  message: string;
}

const EmailSubmitConfirmation: React.FC<EmailSubmitConfirmationProps> = ({
  message,
}) => {
  return (
    <Card className="max-w-lg mx-auto p-4">
      <CardBody className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <CheckCircleIcon className="h-16 w-16 text-success" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-MEDIUM text-foreground">
            Instrucciones Enviadas
          </h2>
          <p className="text-sm text-foreground-600">{message}</p>
        </div>
        <div className="border-t" />

        <div className="bg-primary-50 px-4 rounded-lg border border-primary-200 py-6">
          <p className="text-sm text-primary-700">
            <strong>Qué hacer ahora:</strong>
          </p>
          <ol className="list-decimal list-inside text-sm text-primary-600 mt-2 space-y-1">
            <li>Revisa tu bandeja de entrada</li>
            <li>También revisa la carpeta de spam</li>
            <li>Haz clic en el enlace del email</li>
            <li>Sigue las instrucciones para crear una nueva contraseña</li>
          </ol>
        </div>

        <div className="text-center space-y-2 pt-2">
          <p className="text-xs text-foreground-500 mb-5">
            ¿No recibiste el email? Espera unos minutos e intenta nuevamente.
          </p>
          <div className="border-t" />
          <div className=" inline-flex flex-col space-y-2">
            <Button
              as="a"
              className="mt-2"
              color="primary"
              href="/auth/forgot-password"
              variant="bordered"
            >
              Reenviar instrucciones
            </Button>
            <a className="text-primary hover:underline text-sm" href="/login">
              Volver al inicio de sesión
            </a>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default EmailSubmitConfirmation;
