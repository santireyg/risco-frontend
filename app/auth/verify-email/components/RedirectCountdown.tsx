// app/auth/verify-email/components/RedirectCountdown.tsx

import React from "react";
import { Card, CardBody } from "@heroui/card";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

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

export default RedirectCountdown;
