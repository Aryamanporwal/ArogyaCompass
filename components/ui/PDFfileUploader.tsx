"use client";
import { convertFileToUrl } from "@/lib/utils";
import Image from "next/image";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type FileUploaderProps = {
  files: File[];
  onChange: (files: File[]) => void;
};

const PDFFileUpload = ({ files, onChange }: FileUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange(acceptedFiles); // Pass uploaded files to parent
    },
    [onChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [], // allow images
      "application/pdf": [], // allow PDFs
    },
    maxSize: 10 * 1024 * 1024, 
  });

  const renderPreview = () => {
    const file = files[0];

    if (!file) return null;

    const fileType = file.type;

    if (fileType.startsWith("image/")) {
      return (
        <Image
          src={convertFileToUrl(file)}
          width={1000}
          height={1000}
          alt="uploaded image"
          className="max-h-[400px] overflow-hidden object-cover"
        />
      );
    }

    if (fileType === "application/pdf") {
      return (
        <div className="flex items-center gap-2">
          <Image src="/assets/icons/pdf.svg" width={24} height={24} alt="PDF icon" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
        </div>
      );
    }

    return <p className="text-sm text-red-500">Unsupported file type</p>;
  };

  return (
    <div
      className="text-[12px] leading-[16px] font-normal flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed shadow-md dark:border-gray-800 bg-white dark:bg-[#2a2a2a] p-5"
      {...getRootProps()}
      style={{
        border: "2px dashed #cccccc",
        padding: "20px",
        textAlign: "center",
        cursor: "pointer",
      }}
    >
      <input {...getInputProps()} />
      {files && files.length > 0 ? (
        renderPreview()
      ) : (
        <>
          <Image src="/assets/icons/upload.svg" width={40} height={40} alt="upload" />
          <div className="flex flex-col justify-center gap-2 text-center text-gray-600">
            <p className="text-[14px] leading-[18px] font-normal">
              <span className="text-green-500">Click to Upload</span> or drag and drop
            </p>
            <p>Images or PDF only (max size ~5MB)</p>
          </div>
        </>
      )}
    </div>
  );
};

export default PDFFileUpload;
