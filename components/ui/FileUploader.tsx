"use client"
import { convertFileToUrl } from '@/lib/utils';
import Image from 'next/image';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type FileUploaderProps = {
  files: File[],
  onChange: (files: File[]) => void,
  className?: string // <-- NEW
}

const FileUpload = ({ files, onChange, className }: FileUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange(acceptedFiles);
  }, [onChange]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // Default styles for light theme
  const defaultClass = "text-[12px] leading-[16px] font-normal flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed shadow-md border-gray-200 bg-white p-5";

  return (
    <div
      {...getRootProps()}
      className={className ? className : defaultClass}
      style={{
        border: '2px dashed #cccccc',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      <input {...getInputProps()} />
      {files && files.length > 0 ? (
        <Image
          src={convertFileToUrl(files[0])}
          width={1000}
          height={1000}
          alt="uploaded img"
          className="max-h-[400px] overflow-hidden object-cover"
        />
      ) : (
        <>
          <Image
            src="/assets/icons/upload.svg"
            width={40}
            height={40}
            alt="upload"
          />
          <div className="flex flex-col justify-center gap-2 text-center text-gray-600">
            <p className="text-[14px] leading-[18px] font-normal">
              <span className="text-green-500">Click to Upload</span> or drag and drop
            </p>
            <p>
              SVG, PNG, JPG or GIF (max 800x400)
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default FileUpload;
