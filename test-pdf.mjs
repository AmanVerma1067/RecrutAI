import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function testParse() {
  try {
    const buffer = fs.readFileSync('NewResume.pdf'); // Assuming a sample PDF is available, or we'll just test the import
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    console.log("Success! Characters:", result.text.length);
  } catch (err) {
    console.error("Failed:", err);
  }
}

testParse();
