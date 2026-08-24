import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Logical section IDs for 4 distinct pages
const SECTION_PAGE_IDS = [
  'a4-jathagam-sheet-page-1', // Page 1: Basic Info, Planetary Positions, Dasa & Rasi/Navamsa Charts
  'a4-jathagam-sheet-page-2', // Page 2: Shodasavarga Divisional Charts Grid (D1 to D60)
  'a4-jathagam-sheet-page-3', // Page 3: Ashtakavarga Matrix & Shadbala Strengths
  'a4-jathagam-sheet-page-4'  // Page 4: Jaimini 7-Karaka & Upagrahas
];

export async function exportToPdf(
  containerElement: HTMLElement,
  fileName: string = 'Tamil_Jathagam.pdf'
): Promise<boolean> {
  try {
    const scrollYBefore = window.scrollY;
    const scrollXBefore = window.scrollX;
    window.scrollTo(0, 0);

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

    // Find the 4 target page elements step-by-step
    const pageElements: HTMLElement[] = [];

    for (const pageId of SECTION_PAGE_IDS) {
      const el = document.getElementById(pageId) || containerElement.querySelector<HTMLElement>(`#${pageId}`);
      if (el) {
        pageElements.push(el);
      }
    }

    // Fallback: If section IDs are not found directly, query all page containers inside
    if (pageElements.length === 0) {
      const queriedPages = containerElement.querySelectorAll<HTMLElement>('[id^="a4-jathagam-sheet-page-"]');
      if (queriedPages.length > 0) {
        queriedPages.forEach(p => pageElements.push(p));
      } else {
        pageElements.push(containerElement);
      }
    }

    let pagesExported = 0;

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      // Capture single logical section cleanly
      const canvas = await html2canvas(pageEl, {
        scale: 2, // High resolution (300 DPI equivalent)
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FDF7E3',
        ignoreElements: (element) => {
          return (
            element.getAttribute('data-html2canvas-ignore') === 'true' ||
            element.classList.contains('no-print')
          );
        }
      });

      // Add new page for each section after the first
      if (pagesExported > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Fill background parchment tone on entire A4 sheet
      pdf.setFillColor(253, 247, 227); // #FDF7E3
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

      // Proportional dimension scaling to prevent any stretching
      const canvasAspect = canvas.width / canvas.height;
      let targetWidth = printableWidth;
      let targetHeight = targetWidth / canvasAspect;

      // If calculated height exceeds printable height, constrain by height
      if (targetHeight > printableHeight) {
        targetHeight = printableHeight;
        targetWidth = targetHeight * canvasAspect;
      }

      // Center the captured section neatly within the A4 page margins
      const posX = margin + (printableWidth - targetWidth) / 2;
      const posY = margin + (printableHeight - targetHeight) / 2;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', posX, posY, targetWidth, targetHeight, undefined, 'FAST');

      pagesExported++;
    }

    // Restore scroll position
    window.scrollTo(scrollXBefore, scrollYBefore);

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Multi-page section PDF export failed:', error);
    return false;
  }
}


