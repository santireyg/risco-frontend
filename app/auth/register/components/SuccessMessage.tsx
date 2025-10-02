// app/auth/register/components/SuccessMessage.tsx

import React from "react";
import { Card, CardBody } from "@heroui/card";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface SuccessMessageProps {
  message: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => {
  return (
    <Card className="max-w-lg mx-auto shadow-lg p-4">
      <CardBody className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <CheckCircleIcon className="h-20 w-20 text-success" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-medium text-foreground">
            ¡Solicitud Recibida!
          </h2>
          <p className="text-foreground-600 text-md leading-relaxed">
            {message}
          </p>
        </div>

        <div className="bg-success-50 p-5 rounded-lg border border-success-200">
          <p className="text-sm text-success-800 font-semibold mb-3">
            📧 ¿Qué sigue ahora?
          </p>
          <ol className="list-decimal list-inside text-sm text-success-700 space-y-2 text-left">
            <li>
              <strong>Revisa tu email:</strong> Te enviamos un correo de
              verificación
            </li>
            <li>
              <strong>Verifica tu cuenta:</strong> Haz clic en el enlace del
              email
            </li>
            <li>
              <strong>Espera aprobación:</strong> Un administrador aceptará tu
              cuenta
            </li>
            <li>
              <strong>¡Listo!</strong> Podrás acceder a la plataforma
            </li>
          </ol>
        </div>

        <div className="bg-warning-50 p-4 rounded-lg border border-warning-200">
          <p className="text-sm text-warning-800">
            <strong>💡 Consejo:</strong> Si no ves el email en unos minutos,
            revisa tu carpeta de spam o correo no deseado.
          </p>
        </div>

        <div className="pt-4 space-y-2">
          <a
            className="block text-primary hover:underline font-medium"
            href="/login"
          >
            ← Volver al inicio de sesión
          </a>
          <p className="text-xs text-foreground-500">
            ¿Problemas? Contacta al administrador del sistema
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default SuccessMessage;
