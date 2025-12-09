// frontend/src/app/upload/components/FileUploadZone.tsx

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react'

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  acceptedFileTypes: string[]
  maxFileSizeMB: number
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelect,
  acceptedFileTypes,
  maxFileSizeMB,
}) => {
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024

  const validateFile = (file: File): string | null => {
    if (!acceptedFileTypes.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Accepted types are: ${acceptedFileTypes.join(', ')}.`
    }
    if (file.size > maxFileSizeBytes) {
      return `File size exceeds limit. Max size is ${maxFileSizeMB}MB.`
    }
    return null
  }

  const handleFile = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
    } else {
      setSelectedFile(file)
      setError(null)
      onFileSelect(file)
    }
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const openFileExplorer = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ease-in-out
        ${isDragActive 
          ? 'border-primary bg-primary/5 scale-[1.01] shadow-lg' 
          : 'border-border/60 hover:border-primary/50 hover:bg-accent/30'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={openFileExplorer}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openFileExplorer()
        }
      }}
      aria-label="File upload area. Click or drag and drop to upload a file."
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept={acceptedFileTypes.join(',')}
        aria-hidden="true"
      />
      {selectedFile ? (
        <div className="animate-in fade-in duration-200">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-semibold text-foreground">File Ready</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedFile.name}
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
      ) : (
        <div>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-base font-medium text-foreground">
            Drop your file here, or <span className="text-primary">browse</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            PDF, TXT, or DOCX up to {maxFileSizeMB}MB
          </p>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      )}
    </div>
  )
}

export default FileUploadZone
