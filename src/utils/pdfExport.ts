import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';

export async function exportToPdf(
  element: HTMLElement,
  fileName: string = 'Tamil_Jathagam.pdf'
): Promise<boolean> {
  try {
    // Primary High-Fidelity Multi-Page Engine with html2canvas
    const scrollYBefore = window.scrollY;
    const scrollXBefore = window.scrollX;

    const canvas = await html2canvas(element, {
      scale: 2, // 300 DPI high resolution
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#FDF7E3',
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight
    });

    // Restore scroll position
    window.scrollTo(scrollXBefore, scrollYBefore);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm

    // Calculate canvas pixel height corresponding to one A4 page
    const pageCanvasHeight = Math.floor((canvas.width / pdfWidth) * pdfHeight);
    const totalPages = Math.ceil(canvas.height / pageCanvasHeight);

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const sourceY = pageIndex * pageCanvasHeight;
      const sourceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);

      // Create temporary canvas for this exact A4 slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageCanvasHeight;
      const pageCtx = pageCanvas.getContext('2d');

      if (pageCtx) {
        // Fill authentic Vedic parchment background
        pageCtx.fillStyle = '#FDF7E3';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // Draw the exact slice from master canvas
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.warn('html2canvas multi-page export failed, attempting html-to-image fallback:', error);

    // Fallback: html-to-image with multi-page calculation
    try {
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

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210;
      const pdfHeight = 297;

      const img = new Image();
      img.src = imgData;
      await new Promise(resolve => {
        img.onload = resolve;
      });

      const naturalWidth = img.naturalWidth || element.offsetWidth;
      const naturalHeight = img.naturalHeight || element.offsetHeight;
      const scaledHeight = (naturalHeight * pdfWidth) / naturalWidth;

      let heightLeft = scaledHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage('a4', 'portrait');
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save(fileName);
      return true;
    } catch (fallbackError) {
      console.error('All PDF export attempts failed:', fallbackError);
      return false;
    }
  }
}

