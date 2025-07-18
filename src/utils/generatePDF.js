import ejs from 'ejs';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default Chrome location on Render
const CHROME_PATH = '/opt/render/.cache/puppeteer/chrome/linux-x64/chrome';

export const generatePDF = async (data) => {
  try {
    const html = await ejs.renderFile(
      path.join(__dirname, '../templates/resumeTemplate.ejs'),
      data
    );

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // Use this line ONLY if needed!
      executablePath: CHROME_PATH,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });

    await browser.close();

    // ✅ Save locally
    const filename = `${data.name.replace(/\s+/g, "_")}_Resume.pdf`;
    const outputPath = path.join(__dirname, '../resumes', filename);

    // Ensure "resumes" directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    fs.writeFileSync(outputPath, pdfBuffer);

    return filename;
  } catch (err) {
    console.error('❌ Error generating PDF with Puppeteer:', err);
    throw new Error('Puppeteer PDF generation failed.');
  }
};
