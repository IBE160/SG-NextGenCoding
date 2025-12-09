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
      className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200 ease-in-out
        ${isDragActive 
          ? 'border-primary bg-primary/10 scale-[1.02]' 
          : 'border-border hover:border-primary/50 hover:bg-accent/50'}`}
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
          <p className="font-semibold text-foreground">Selected File:</p>
          <p className="text-muted-foreground">
            {selectedFile.name} ({selectedFile.type})
          </p>
          {error && <p className="mt-2 text-destructive">{error}</p>}
        </div>
      ) : (
        <div>
          <p className="text-muted-foreground">
            Drag & drop your file here, or click to select
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Accepted:{' '}
            {acceptedFileTypes
              .map((type) => type.split('/')[1] || type)
              .join(', ')}{' '}
            | Max size: {maxFileSizeMB}MB
          </p>
          {error && <p className="mt-2 text-destructive">{error}</p>}
        </div>
      )}
    </div>
  )
}

export default FileUploadZone
