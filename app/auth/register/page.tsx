// app/auth/register/page.tsx

"use client";

import React from "react";

import { useRegistration } from "../hooks/useRegistration";

import RegistrationForm from "./components/RegistrationForm";
import SuccessMessage from "./components/SuccessMessage";

const RegisterPage: React.FC = () => {
  const registrationHook = useRegistration();

  return (
    <div className="flex items-center justify-center bg-slate-100 px-4 h-[calc(100vh-5rem-1px)]">
      <div className="w-full max-w-lg">
        {registrationHook.success ? (
          <SuccessMessage message={registrationHook.successMessage} />
        ) : (
          <RegistrationForm registrationHook={registrationHook} />
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
