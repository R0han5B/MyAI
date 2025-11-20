import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

/* ------------------------
    PDF -> TEXT
------------------------- */
export async function readPDF(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((i) => i.str).join(" ") + "\n";
  }
  return text;
}

/* ------------------------
    DOCX -> TEXT
------------------------- */
export async function readDocx(file) {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

/* ------------------------
    XLSX -> TEXT (all sheets)
------------------------- */
export async function readXlsx(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);

  let output = "";

  workbook.SheetNames.forEach((name) => {
    const sheet = XLSX.utils.sheet_to_csv(workbook.Sheets[name]);
    output += `\n--- Sheet: ${name} ---\n${sheet}\n`;
  });

  return output;
}

/* ------------------------
    GENERIC TEXT FILES
------------------------- */
export async function readText(file) {
  return await file.text();
}

/* ------------------------
    IMAGE -> BASE64
------------------------- */
export async function readImage(file) {
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/* ------------------------
    AUTO-DETECT & READ ANY FILE
------------------------- */
export async function readAnyFile(file) {
  const type = file.type;

  if (type === "application/pdf") return await readPDF(file);

  if (
    type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return await readDocx(file);

  if (
    type ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return await readXlsx(file);

  if (type.startsWith("image/"))
    return await readImage(file);

  if (type.startsWith("text/") || file.name.endsWith(".md"))
    return await readText(file);

  if (
    file.name.endsWith(".json") ||
    file.name.endsWith(".csv") ||
    file.name.endsWith(".html") ||
    file.name.endsWith(".css") ||
    file.name.endsWith(".js") ||
    file.name.endsWith(".jsx") ||
    file.name.endsWith(".ts") ||
    file.name.endsWith(".tsx") ||
    file.name.endsWith(".xml") ||
    file.name.endsWith(".yaml") ||
    file.name.endsWith(".yml")
  )
    return await readText(file);

  return "❌ Unsupported file type for browser reading.";
}
