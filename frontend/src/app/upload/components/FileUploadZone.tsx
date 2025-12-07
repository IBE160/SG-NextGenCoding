// frontend/src/app/upload/components/FileUploadZone.tsx

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes: string[];
  maxFileSizeMB: number;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  acceptedFileTypes,
  maxFileSizeMB,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    if (!acceptedFileTypes.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Accepted types are: ${acceptedFileTypes.join(', ')}.`;
    }
    if (file.size > maxFileSizeBytes) {
      return `File size exceeds limit. Max size is ${maxFileSizeMB}MB.`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
      setError(null);
      onFileSelect(file);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const openFileExplorer = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={openFileExplorer}
      aria-label="file upload area"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept={acceptedFileTypes.join(',')}
      />
      {selectedFile ? (
        <div>
          <p className="font-semibold">Selected File:</p>
          <p>{selectedFile.name} ({selectedFile.type})</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      ) : (
        <div>
          <p className="text-gray-600">Drag & drop your file here, or click to select</p>
          <p className="text-sm text-gray-500 mt-1">
            Accepted: {acceptedFileTypes.map(type => type.split('/')[1] || type).join(', ')} | Max size: {maxFileSizeMB}MB
          </p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;