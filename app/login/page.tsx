// app/login/page.tsx
"use client";

import React, { Suspense } from "react";

import LoginContent from "./LoginContent";

const LoginPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Cargando..</div>}>
      <LoginContent />
    </Suspense>
  );
};

export default LoginPage;
