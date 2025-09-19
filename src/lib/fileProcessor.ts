import { PDFDocument } from 'pdf-lib';

export class FileProcessor {
  static async extractTextFromPDF(file: File, password?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      let timedOut = false;

      // Increased timeout to 60 seconds for large/slow PDFs and slow browsers
      const timeout = setTimeout(() => {
        timedOut = true;
        reject(new Error('PDF extraction timed out. Please try a different file or check your browser.'));
      }, 60000); // 60 seconds max

      reader.onload = async (e) => {
        if (timedOut) return;
        const arrayBuffer = e.target?.result as ArrayBuffer;
        // Try pdfjs-dist first
        try {
          // @ts-ignore
          const pdfjsDist = await import('pdfjs-dist/build/pdf');
          // @ts-ignore
          const workerSrc = await import('pdfjs-dist/build/pdf.worker?url');
          // @ts-ignore
          pdfjsDist.GlobalWorkerOptions.workerSrc = workerSrc.default;
          console.log('[pdfjs-dist] Starting extraction...');
          const loadingTask = pdfjsDist.getDocument({ data: arrayBuffer, password });
          const pdf = await loadingTask.promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(' ') + '\n';
          }
          clearTimeout(timeout);
          console.log('[pdfjs-dist] Extraction complete.');
          resolve(text);
          return;
        } catch (error: any) {
          // Handle password-protected PDFs explicitly
          if (error?.name === 'PasswordException') {
            const err = new Error(
              error?.code === 2 ? 'Incorrect PDF password' : 'PDF password required'
            ) as any;
            err.code = error?.code === 2 ? 'PDF_PASSWORD_INCORRECT' : 'PDF_PASSWORD_REQUIRED';
            clearTimeout(timeout);
            return reject(err);
          }
          console.error('[pdfjs-dist] Extraction error, falling back to pdf-lib:', error);
          // Fallback to pdf-lib below
        }
        // Fallback: pdf-lib (no real extraction, just placeholder)
        try {
          console.log('[PDF-lib] Starting extraction...');
          const pdfDoc = await PDFDocument.load(arrayBuffer, password ? { password } : undefined as any);
          let text = '';
          const numPages = pdfDoc.getPageCount();
          for (let i = 0; i < numPages; i++) {
            text += `\n[Page ${i + 1} extraction not supported by pdf-lib. Please use a different PDF or contact support.]`;
          }
          clearTimeout(timeout);
          console.log('[PDF-lib] Extraction complete.');
          resolve(text);
        } catch (error: any) {
          clearTimeout(timeout);
          console.error('[PDF-lib] Extraction error:', error);
          if (String(error?.message || '').toLowerCase().includes('password')) {
            const err = new Error('PDF password required') as any;
            err.code = 'PDF_PASSWORD_REQUIRED';
            return reject(err);
          }
          reject(new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF and try again.'));
        }
      };
      reader.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to read file'));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are supported' };
    }
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }
    return { valid: true };
  }
}