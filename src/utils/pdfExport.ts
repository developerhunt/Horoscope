import { toJpeg, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function exportToPdf(element: HTMLElement, fileName: string = 'Tamil_Jathagam.pdf'): Promise<boolean> {
  try {
    // Generate high-resolution image using html-to-image
    // fontEmbedCSS: '' prevents reading cross-origin CSSStyleSheet rules which causes security DOMExceptions
    const imgData = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#FDF7E3',
      cacheBust: true,
      fontEmbedCSS: '',
      style: {
        margin: '0',
        transform: 'none'
      }
    });

    // Create A4 PDF instance
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Create an HTML Image to calculate natural aspect ratio
    const img = new Image();
    img.src = imgData;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const naturalWidth = img.naturalWidth || element.offsetWidth;
    const naturalHeight = img.naturalHeight || element.offsetHeight;

    // Calculate dimensions to fit neatly within A4 margins
    const margin = 5; // 5mm margin
    const printableWidth = pageWidth - (margin * 2);
    const printableHeight = pageHeight - (margin * 2);

    const calculatedHeight = (naturalHeight * printableWidth) / naturalWidth;

    if (calculatedHeight <= printableHeight) {
      // Single page fit
      const yOffset = margin;
      pdf.addImage(imgData, 'JPEG', margin, yOffset, printableWidth, calculatedHeight);
    } else {
      // Proportional scale to fit within page height
      const scaledWidth = (naturalWidth * printableHeight) / naturalHeight;
      const xOffset = (pageWidth - scaledWidth) / 2;
      pdf.addImage(imgData, 'JPEG', xOffset, margin, scaledWidth, printableHeight);
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.warn('Primary PDF generation attempt:', error);
    
    // Fallback: Try with toPng with fontEmbedCSS disabled
    try {
      const pngData = await toPng(element, {
        pixelRatio: 1.5,
        backgroundColor: '#FDF7E3',
        fontEmbedCSS: '',
      });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(pngData, 'PNG', 5, 5, pageWidth - 10, pageHeight - 10);
      pdf.save(fileName);
      return true;
    } catch (fallbackError) {
      console.error('Fallback PDF export failed:', fallbackError);
      return false;
    }
  }
}
