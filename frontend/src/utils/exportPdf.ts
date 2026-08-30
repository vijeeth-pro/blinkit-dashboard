import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function exportPageToPdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Target element with ID '${elementId}' not found for PDF export.`);
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`Export element '${elementId}' not found.`);
    }
    return false;
  }

  // Find scrollable parent container (<main>)
  const mainContainer = element.closest('main') || document.querySelector('main');
  const appRoot = document.getElementById('root');

  // Save original inline styles to restore after capture
  const originalElementStyle = {
    overflow: element.style.overflow,
    height: element.style.height,
    maxHeight: element.style.maxHeight,
  };

  const originalMainStyle = mainContainer ? {
    overflow: mainContainer.style.overflow,
    height: mainContainer.style.height,
    maxHeight: mainContainer.style.maxHeight,
  } : null;

  const originalRootStyle = appRoot ? {
    overflow: appRoot.style.overflow,
    height: appRoot.style.height,
  } : null;

  // Temporarily hide buttons, inputs, selects, and filter bars in snapshot
  const controlsToHide = element.querySelectorAll<HTMLElement>('button, .no-print, input, select');
  const originalVisibilities = new Map<HTMLElement, string>();

  controlsToHide.forEach(ctrl => {
    originalVisibilities.set(ctrl, ctrl.style.visibility);
    ctrl.style.visibility = 'hidden';
  });

  try {
    // 1. Temporarily expand container overflow so html-to-image captures 100% of section height
    element.style.overflow = 'visible';
    element.style.height = 'auto';
    element.style.maxHeight = 'none';

    if (mainContainer) {
      mainContainer.style.overflow = 'visible';
      mainContainer.style.height = 'auto';
      mainContainer.style.maxHeight = 'none';
    }

    if (appRoot) {
      appRoot.style.overflow = 'visible';
      appRoot.style.height = 'auto';
    }

    // Expand inner table overflow containers
    const innerOverflows = element.querySelectorAll('.overflow-x-auto, .overflow-y-auto, .overflow-hidden');
    const originalInnerStyles: { el: HTMLElement; overflow: string; height: string }[] = [];
    
    innerOverflows.forEach(el => {
      const hEl = el as HTMLElement;
      originalInnerStyles.push({ el: hEl, overflow: hEl.style.overflow, height: hEl.style.height });
      hEl.style.overflow = 'visible';
      hEl.style.height = 'auto';
    });

    // Detect dark mode theme
    const isDark = document.documentElement.classList.contains('dark') || 
                   element.classList.contains('bg-slate-900') ||
                   document.body.classList.contains('bg-slate-900') ||
                   window.getComputedStyle(element).backgroundColor === 'rgb(15, 23, 42)';

    const bgColor = isDark ? '#0f172a' : '#ffffff';

    // Wait 80ms for layout reflow
    await new Promise(resolve => setTimeout(resolve, 80));

    // 2. Capture live section DOM element using html-to-image (supports Tailwind v4 & SVG natively)
    const imgDataUrl = await toPng(element, {
      pixelRatio: 2,
      backgroundColor: bgColor,
      cacheBust: true,
      filter: (node: HTMLElement) => {
        // Exclude any sidebar, header, or action buttons
        if (node.tagName === 'BUTTON' || node.tagName === 'ASIDE' || node.tagName === 'HEADER') {
          return false;
        }
        return true;
      },
    });

    // 3. Restore all original DOM styles immediately
    element.style.overflow = originalElementStyle.overflow;
    element.style.height = originalElementStyle.height;
    element.style.maxHeight = originalElementStyle.maxHeight;

    if (mainContainer && originalMainStyle) {
      mainContainer.style.overflow = originalMainStyle.overflow;
      mainContainer.style.height = originalMainStyle.height;
      mainContainer.style.maxHeight = originalMainStyle.maxHeight;
    }

    if (appRoot && originalRootStyle) {
      appRoot.style.overflow = originalRootStyle.overflow;
      appRoot.style.height = originalRootStyle.height;
    }

    originalInnerStyles.forEach(item => {
      item.el.style.overflow = item.overflow;
      item.el.style.height = item.height;
    });

    originalVisibilities.forEach((vis, ctrl) => {
      ctrl.style.visibility = vis;
    });

    if (!imgDataUrl || imgDataUrl.length < 100) {
      throw new Error('html-to-image returned an empty image string.');
    }

    // Create image element to get exact rendered dimensions
    const img = new Image();
    img.src = imgDataUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // 4. Generate Executive PDF Report Document with jsPDF
    const orientation = img.width > img.height ? 'landscape' : 'portrait';
    
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const headerHeight = 22; // Executive header banner height
    const footerHeight = 12; // Executive footer banner height
    const marginTop = headerHeight + 5;
    const marginBottom = footerHeight + 5;
    const marginSide = 10;

    const availableWidth = pdfWidth - marginSide * 2;
    const availableHeight = pdfHeight - marginTop - marginBottom;

    const imgWidth = img.width;
    const imgHeight = img.height;

    // Height of canvas slice corresponding to available height per PDF page
    const pageCanvasHeight = Math.floor((imgWidth * availableHeight) / availableWidth);

    let srcY = 0;
    let pageCount = 0;
    const totalPages = Math.max(1, Math.ceil(imgHeight / pageCanvasHeight));

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Create offscreen canvas for page slicing
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = imgWidth;
    sourceCanvas.height = imgHeight;
    const sourceCtx = sourceCanvas.getContext('2d');
    if (sourceCtx) {
      sourceCtx.drawImage(img, 0, 0);
    }

    while (srcY < imgHeight) {
      if (pageCount > 0) {
        pdf.addPage();
      }

      // Executive Amber Accent Bar
      pdf.setFillColor(245, 158, 11);
      pdf.rect(0, 0, pdfWidth, 3, 'F');

      // Executive Header Background
      pdf.setFillColor(isDark ? 15 : 255, isDark ? 23 : 255, isDark ? 42 : 255);
      pdf.rect(0, 3, pdfWidth, headerHeight - 3, 'F');

      // Brand Logo Text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(245, 158, 11);
      pdf.text('blinkit', marginSide, 12);

      // Report Header Subtitle
      pdf.setFontSize(10);
      pdf.setTextColor(isDark ? 241 : 30, isDark ? 245 : 41, isDark ? 249 : 59);
      pdf.text('Executive BI & Analytics Report', marginSide + 20, 12);

      // Date and Timestamp Metadata
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(isDark ? 148 : 100, isDark ? 163 : 116, isDark ? 184 : 139);
      pdf.text(`Generated: ${dateFormatted} at ${timeFormatted} | Live PostgreSQL Sync`, pdfWidth - marginSide, 12, { align: 'right' });

      // Divider Line
      pdf.setDrawColor(isDark ? 51 : 226, isDark ? 65 : 232, isDark ? 85 : 240);
      pdf.setLineWidth(0.3);
      pdf.line(marginSide, headerHeight, pdfWidth - marginSide, headerHeight);

      // Slice Canvas for current page
      const currentSliceHeight = Math.min(pageCanvasHeight, imgHeight - srcY);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgWidth;
      pageCanvas.height = currentSliceHeight;

      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx && sourceCtx) {
        pageCtx.fillStyle = bgColor;
        pageCtx.fillRect(0, 0, imgWidth, currentSliceHeight);
        pageCtx.drawImage(
          sourceCanvas,
          0, srcY, imgWidth, currentSliceHeight,
          0, 0, imgWidth, currentSliceHeight
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92);
      const renderHeight = (currentSliceHeight * availableWidth) / imgWidth;

      pdf.addImage(pageImgData, 'JPEG', marginSide, marginTop, availableWidth, renderHeight, undefined, 'FAST');

      // Executive Footer Information
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(isDark ? 148 : 100, isDark ? 163 : 116, isDark ? 184 : 139);
      pdf.text('Blinkit Confidential — Internal Analytics Report', marginSide, pdfHeight - 6);
      pdf.text(`Page ${pageCount + 1} of ${totalPages}`, pdfWidth - marginSide, pdfHeight - 6, { align: 'right' });

      srcY += currentSliceHeight;
      pageCount++;
    }

    // Direct browser file download
    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF export error via html-to-image:', error);

    element.style.overflow = originalElementStyle.overflow;
    element.style.height = originalElementStyle.height;
    element.style.maxHeight = originalElementStyle.maxHeight;

    if (mainContainer && originalMainStyle) {
      mainContainer.style.overflow = originalMainStyle.overflow;
      mainContainer.style.height = originalMainStyle.height;
      mainContainer.style.maxHeight = originalMainStyle.maxHeight;
    }

    if (appRoot && originalRootStyle) {
      appRoot.style.overflow = originalRootStyle.overflow;
      appRoot.style.height = originalRootStyle.height;
    }

    originalVisibilities.forEach((vis, ctrl) => {
      ctrl.style.visibility = vis;
    });

    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert('Could not generate PDF. Please try again.');
    }
    return false;
  }
}
