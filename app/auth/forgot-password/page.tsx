// app/auth/forgot-password/page.tsx

"use client";

import React from "react";

import ForgotPasswordForm from "./components/ForgotPasswordForm";

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center bg-slate-100 px-4 h-[calc(100vh-5rem-1px)]">
      <div className="w-full max-w-lg">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
