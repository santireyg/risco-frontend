// app/auth/forgot-password/components/ForgotPasswordForm.tsx

import React from "react";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";

import { useForgotPassword } from "../../hooks/useForgotPassword";

import EmailSubmitConfirmation from "./EmailSubmitConfirmation";

const ForgotPasswordForm: React.FC = () => {
  const {
    loading,
    error,
    success,
    successMessage,
    sendResetEmail,
    clearError,
    resetForm,
  } = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    if (email) {
      clearError();
      await sendResetEmail(email);
    }
  };

  const handleReset = () => {
    resetForm();
  };

  return (
    <>
      {success ? (
        <EmailSubmitConfirmation message={successMessage} />
      ) : (
        <Card className="max-w-md mx-auto p-4">
          <CardHeader className="flex flex-col space-y-4 pb-4">
            <h1 className="text-2xl font-medium text-center">
              Recuperar Contraseña
            </h1>
            <p className="text-foreground-600 text-center text-sm">
              Ingresa tu email para recibir instrucciones de recuperación
            </p>
          </CardHeader>

          <CardBody className="space-y-4">
            <Form
              className="space-y-4"
              onReset={handleReset}
              onSubmit={handleSubmit}
            >
              <Input
                isRequired
                errorMessage="Ingresa un email válido"
                label="Email"
                labelPlacement="inside"
                name="email"
                placeholder="usuario@empresa.com"
                type="email"
              />

              <Button
                className="w-full"
                color="primary"
                isDisabled={loading}
                isLoading={loading}
                type="submit"
              >
                {loading ? "Enviando..." : "Enviar Instrucciones"}
              </Button>

              {error && (
                <div className="text-small text-danger">Error: {error}</div>
              )}
            </Form>

            <div className="text-center pt-4 border-t border-divider">
              <p className="text-sm text-foreground-600">
                ¿Recordaste tu contraseña?{" "}
                <a className="text-primary hover:underline" href="/login">
                  Inicia sesión
                </a>
              </p>
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default ForgotPasswordForm;
