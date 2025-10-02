export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getFileIcon = (fileType: string, extension: string): string => {
  switch (fileType) {
    case 'image':
      return '🖼️'
    case 'video':
      return '🎥'
    case 'pdf':
      return '📄'
    case 'doc':
      return '📝'
    case 'audio':
      return '🎵'
    default:
      if (extension === '.zip' || extension === '.rar') return '📦'
      return '📁'
  }
}

export const isImageFile = (fileType: string): boolean => {
  return fileType === 'image'
}

export const isVideoFile = (fileType: string): boolean => {
  return fileType === 'video'
}

export const isPDFFile = (fileType: string): boolean => {
  return fileType === 'pdf'
}