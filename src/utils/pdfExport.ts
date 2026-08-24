import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

// Logical section IDs for 4 distinct pages in the print-ready Vedic Report
export const SECTION_PAGE_IDS = [
  'a4-jathagam-sheet-page-1', // Page 1: Basic Details, Rasi & Navamsa Charts, Dasa-Bhukti Table
  'a4-jathagam-sheet-page-2', // Page 2: Divisional Charts Grid (D-Charts)
  'a4-jathagam-sheet-page-3', // Page 3: Ashtakavarga & Shadbala Strengths
  'a4-jathagam-sheet-page-4'  // Page 4: Jaimini, Upagrahas, and D.S. Astro System Predictions
];

/**
 * Robust Multi-Page A4 PDF Export Engine
 * 
 * Supports two operating modes:
 * 1. Discrete Page Sections: Converts explicit #a4-jathagam-sheet-page-{1..N} elements into dedicated A4 pages.
 * 2. Canvas Slicing Fallback: If a long monolithic element is supplied, computes exact A4 aspect ratio 
 *    (210mm x 297mm) and cleanly slices the high-res canvas into consecutive pages without stretching.
 * 
 * Includes privacy filter handling: elements with class `privacy-hide-print` or `no-print` are omitted.
 */
export async function exportToPdf(
  containerElement: HTMLElement,
  fileName: string = 'Tamil_Jathagam.pdf'
): Promise<boolean> {
  // Add print-generating class to trigger privacy masking
  document.body.classList.add('pdf-generating');
  const scrollYBefore = window.scrollY;
  const scrollXBefore = window.scrollX;
  window.scrollTo(0, 0);

  try {
    // Initialize jsPDF with standard A4 portrait format (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const margin = 5; // 5mm page margin
    const printableWidth = pdfWidth - margin * 2; // 200mm
    const printableHeight = pdfHeight - margin * 2; // 287mm

    // Find discrete page elements by configured IDs
    const pageElements: HTMLElement[] = [];
    for (const pageId of SECTION_PAGE_IDS) {
      const el = document.getElementById(pageId) || containerElement.querySelector<HTMLElement>(`#${pageId}`);
      if (el) {
        pageElements.push(el);
      }
    }

    // Common filter function for html-to-image to enforce privacy & no-print
    const nodeFilter = (node: Node): boolean => {
      if (node.nodeType === 1) {
        const el = node as HTMLElement;
        if (
          el.getAttribute('data-html2canvas-ignore') === 'true' ||
          el.classList?.contains('no-print') ||
          el.classList?.contains('privacy-hide-print') ||
          el.id === 'pred-intimacy'
        ) {
          return false;
        }
      }
      return true;
    };

    if (pageElements.length > 0) {
      // MODE 1: Discrete Structured A4 Page Export (Page 1, 2, 3, 4)
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];

        const imgData = await toJpeg(pageEl, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#FDF7E3',
          cacheBust: true,
          fontEmbedCSS: '',
          filter: nodeFilter
        });

        const img = new Image();
        img.src = imgData;
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });

        const naturalWidth = img.naturalWidth || pageEl.offsetWidth || 800;
        const naturalHeight = img.naturalHeight || pageEl.offsetHeight || 1100;
        const canvasAspect = naturalWidth / naturalHeight;

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // Fill background parchment tone on entire A4 sheet
        pdf.setFillColor(253, 247, 227); // #FDF7E3
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

        // Proportional dimension scaling to prevent any stretching
        let targetWidth = printableWidth;
        let targetHeight = targetWidth / canvasAspect;

        if (targetHeight > printableHeight) {
          targetHeight = printableHeight;
          targetWidth = targetHeight * canvasAspect;
        }

        // Center within A4 page margins
        const posX = margin + (printableWidth - targetWidth) / 2;
        const posY = margin + (printableHeight - targetHeight) / 2;

        pdf.addImage(imgData, 'JPEG', posX, posY, targetWidth, targetHeight, undefined, 'FAST');
      }
    } else {
      // MODE 2: Multi-Page Canvas Slicing Fallback
      const imgData = await toJpeg(containerElement, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#FDF7E3',
        cacheBust: true,
        fontEmbedCSS: '',
        filter: nodeFilter
      });

      const img = new Image();
      img.src = imgData;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });

      const imgWidth = img.naturalWidth || containerElement.offsetWidth;
      const imgHeight = img.naturalHeight || containerElement.offsetHeight;

      // Calculate slice height corresponding to A4 printable area
      const pageHeightPx = Math.floor(imgWidth * (printableHeight / printableWidth));
      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < imgHeight) {
        if (pageIndex > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // Create canvas slice for this page
        const canvas = document.createElement('canvas');
        canvas.width = imgWidth;
        const sliceHeight = Math.min(pageHeightPx, imgHeight - renderedHeight);
        canvas.height = sliceHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FDF7E3';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            img,
            0, renderedHeight, imgWidth, sliceHeight,
            0, 0, imgWidth, sliceHeight
          );

          const sliceData = canvas.toDataURL('image/jpeg', 0.95);

          pdf.setFillColor(253, 247, 227);
          pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

          const sliceHeightMm = (sliceHeight / imgWidth) * printableWidth;
          pdf.addImage(sliceData, 'JPEG', margin, margin, printableWidth, sliceHeightMm, undefined, 'FAST');
        }

        renderedHeight += pageHeightPx;
        pageIndex++;
      }
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Multi-page A4 PDF export failed:', error);
    return false;
  } finally {
    document.body.classList.remove('pdf-generating');
    window.scrollTo(scrollXBefore, scrollYBefore);
  }
}
