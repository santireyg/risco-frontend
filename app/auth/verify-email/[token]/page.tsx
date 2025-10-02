// app/auth/verify-email/[token]/page.tsx

"use client";

import React, { use } from "react";

import EmailVerificationHandler from "../components/EmailVerificationHandler";

interface VerifyEmailPageProps {
  params: Promise<{ token: string }>;
}

const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ params }) => {
  const { token } = use(params);

  return (
    <div className="h-[calc(100vh-5rem-1px)] bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <EmailVerificationHandler token={token} />
      </div>
    </div>
  );
};

export default VerifyEmailPage;
