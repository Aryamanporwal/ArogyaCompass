"use client"
import { convertFileToUrl } from '@/lib/utils';
import Image from 'next/image';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type FileUplaoderProps = {
    files : File[],
    onChange: (files: File[]) => void
}
const FileUpload = ({files, onChange}:FileUplaoderProps) => {
  const onDrop = useCallback((acceptedFiles : File[]) => {
    onChange(acceptedFiles); // Handle the uploaded files here
  }, []);

  const { getRootProps,  getInputProps} = useDropzone({ onDrop });

  return (
    <div className='text-[12px] leading-[16px] font-normal flex cursor-pointer  flex-col items-center justify-center gap-3 rounded-md border border-dashed border-gray-800 bg-gray-900 p-5'
      {...getRootProps()}
      style={{
        border: '2px dashed #cccccc',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
         <input {...getInputProps()} /> 
        {files && files?.length>0 ? (
            <Image
            src = {convertFileToUrl(files[0])}
            width = {1000}
            height = {1000}
            alt = "uplaoded img"
            className = "max-h-[400px] overflow-hidden object-cover"/>
        ):(
            <>
              <Image
                src = "/assets/icons/upload.svg"
                width = {40}
                height = {40}
                alt='uplaod'
              />
              <div className='flex flex-col justify-center gap-2 text-center text-gray-600'>
                  <p className='text-[14px] leading-[18px] font-normal'>
                    <span className='text-green-500'>Click to Upload</span> or drag an drop
                  </p>
                  <p>
                    SVG, PNG, JPG or GIF(max 800x400)
                  </p>
              </div>
            </>
        )}
    </div>
  );
};

export default FileUpload;
