// path: app/upload/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "../globals.css";
import { IoMdArrowBack } from "react-icons/io";
import { Button } from "@heroui/button";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";

import FileUpload from "./components/FileUpload";

const UploadPage = () => {
  const router = useRouter();

  return (
    <div className="h-[calc(100vh-5rem-1px)] flex flex-col">
      <div className="container mx-auto flex items-center h-14 pl-2">
        <div className="flex items-center gap-4">
          <Button
            className="bg-slate-100 text-slate-500 border"
            radius="md"
            size="sm"
            startContent={<IoMdArrowBack />}
            onPress={() => router.push("/")}
          >
            Homepage
          </Button>
          <Breadcrumbs size="md">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/upload">Upload</BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </div>
      <div className="flex-grow bg-slate-100 flex items-center justify-center border-t border-slate-200">
        <div className="bg-white p-10 rounded-xl shadow-lg mx-auto w-1/2 text-center mt-10 mb-20 border border-slate-200">
          <h1 className="text-3xl font-medium text-gray-800 mb-8">
            Carga de archivos PDF
          </h1>
          <FileUpload />
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
