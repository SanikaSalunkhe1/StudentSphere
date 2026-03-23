const fs = require('fs');
const PDFParser = require("pdf2json");

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    let text = pdfParser.getRawTextContent().replace(/\r\n/g, '\n');
    fs.writeFileSync('report_text.txt', text);
    console.log("Wrote full text to report_text.txt. Length:", text.length);
});

pdfParser.loadPDF("../Report.pdf");
