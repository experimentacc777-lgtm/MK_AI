
/**
 * Applies watermarks to images:
 * Top-left: "MK"
 * Bottom-right: "Created with MK"
 */
export const applyWatermark = async (base64Data: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Could not get canvas context');

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Watermark styles
      const fontSize = Math.max(img.width * 0.03, 20);
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';

      // Top-left: "MK"
      ctx.textAlign = 'left';
      ctx.fillText('MK', 20, fontSize + 20);

      // Bottom-right: "Created with MK"
      ctx.textAlign = 'right';
      ctx.fillText('Created with MK', img.width - 20, img.height - 20);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = base64Data;
  });
};

export const downloadImage = (url: string, filename: string = 'mk-ai-image.png') => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
