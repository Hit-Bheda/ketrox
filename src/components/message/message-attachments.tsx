"use client";

import { Button } from "@/components/ui/button";
import { Image as LucideImage, Video, FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import  Image  from "next/image";

interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  mimeType: string;
}

interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

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

  const handleDownload = (file: MessageAttachment) => {
    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-3 space-y-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="space-y-2">
          {/* File Info Header */}
          <div className="flex items-center justify-between p-2 bg-background/30 rounded-md border text-xs">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {getFileIcon(attachment.fileType)}
              <span className="truncate font-medium">{attachment.fileName}</span>
              <Badge variant="outline" className="text-xs shrink-0">
                {formatFileSize(attachment.fileSize)}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(attachment)}
              className="h-6 w-6 p-0 shrink-0"
              title="Download"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>

          {/* Inline Preview */}
          {attachment.fileType === 'image' && (
            <div className="rounded-md overflow-hidden border bg-muted/20">
              <Image
                src={attachment.fileUrl}
                alt={attachment.fileName}
                width={500}
                height={300}
                className="w-full max-w-sm max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(attachment.fileUrl, "_blank")}
              />
            </div>
          )}

          {attachment.fileType === 'video' && (
            <div className="rounded-md overflow-hidden border bg-muted/20">
              <video
                src={attachment.fileUrl}
                controls
                className="w-full max-w-sm max-h-64 object-cover"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {attachment.fileType === 'document' && (
            <div className="p-4 border rounded-md bg-muted/20 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Document preview not available</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(attachment.fileUrl, '_blank')}
                className="mt-2 cursor-pointer sm:w-auto w-full text-xs"
              >
                Open
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
