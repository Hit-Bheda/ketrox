"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Paperclip, Image as LucideImage, Video, FileText, X, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export interface FileAttachment {
  fileName: string;
  fileUrl: string;
  fileType: "image" | "video" | "document";
  fileSize: string;
  mimeType: string;
}

interface FileUploadProps {
  onFilesSelected: (files: FileAttachment[]) => void;
  selectedFiles: FileAttachment[];
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
}

export function FileUpload({ onFilesSelected, selectedFiles, onRemoveFile, disabled }: FileUploadProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (acceptedTypes: string, fileType: "image" | "video" | "document") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptedTypes;
      fileInputRef.current.setAttribute("data-file-type", fileType);
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadedFiles: FileAttachment[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          uploadedFiles.push(result.file);
        } else {
          const errorData = await response.json();
          console.error('Failed to upload file:', file.name, errorData);
          alert(`Failed to upload ${file.name}: ${errorData.error || 'Unknown error'}`);
        }
      }

      if (uploadedFiles.length > 0) {
        onFilesSelected([...selectedFiles, ...uploadedFiles]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <LucideImage className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handlePreview = (file: FileAttachment) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Preview Area (aligned to end) */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto flex flex-col items-end sm:items-end">
            {selectedFiles.map((file, index) => (
              <div key={index} className="space-y-2 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-muted rounded-md text-sm w-full sm:w-auto gap-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getFileIcon(file.fileType)}
                    <span className="truncate font-medium max-w-[150px] sm:max-w-[200px]">
                      {file.fileName}
                    </span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {formatFileSize(file.fileSize)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    {(file.fileType === "image" || file.fileType === "video") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(file)}
                        className="h-6 w-6 p-0"
                        title="Preview"
                      >
                        <LucideImage className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFile(index)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Inline Preview */}
                {file.fileType === "image" && (
                  <div className="rounded-md overflow-hidden border bg-muted/20 w-full sm:max-w-xs">
                    <Image
                      src={file.fileUrl}
                      alt={file.fileName}
                      width={500}
                      height={500}
                      className="w-full max-h-32 object-cover"
                    />
                  </div>
                )}
                {file.fileType === "video" && (
                  <div className="rounded-md overflow-hidden border bg-muted/20 w-full sm:max-w-xs">
                    <video
                      src={file.fileUrl}
                      className="w-full max-h-32 object-cover"
                      preload="metadata"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}


        {/* Input Row (always stays at bottom) */}
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={disabled}>
                <Paperclip className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end">
              <DropdownMenuItem onClick={() => handleFileSelect("image/*", "image")}>
                <LucideImage className="w-4 h-4 mr-2" />
                Upload Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileSelect("video/*", "video")}>
                <Video className="w-4 h-4 mr-2" />
                Upload Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileSelect(".pdf,.doc,.docx,.txt", "document")}>
                <FileText className="w-4 h-4 mr-2" />
                Upload Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>




      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewFile?.fileName}</DialogTitle>
            <DialogDescription>
              {previewFile?.fileType} • {previewFile && formatFileSize(previewFile.fileSize)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center min-h-[300px] bg-muted rounded-md">
            {previewFile?.fileType === 'image' ? (
              <Image
                src={previewFile.fileUrl}
                alt={previewFile.fileName}
                width={500}
                height={300}
                priority
                fetchPriority="high"
                className="max-w-full max-h-[60vh] object-contain rounded"
              />
            ) : previewFile?.fileType === 'video' ? (
              <video
                src={previewFile.fileUrl}
                controls
                className="max-w-full max-h-[60vh] rounded"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Preview not available</p>
                <Button
                  variant="outline"
                  onClick={() => window.open(previewFile?.fileUrl, '_blank')}
                  className="mt-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Open File
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={() => window.open(previewFile?.fileUrl, '_blank')}>
              <Upload className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
