// app/auth/reset-password/page.tsx

"use client";

import React from "react";

import ResetPasswordForm from "./components/ResetPasswordForm";

const ResetPasswordPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-5rem-1px)] bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
