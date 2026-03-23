const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('../Report.pdf');

(async () => {
    try {
        const parseFunc = typeof pdf === 'function' ? pdf : (pdf.default || pdf.pdf);
        const data = await parseFunc(dataBuffer);
        console.log(data.text);
    } catch (error) {
        console.error("Error reading PDF:", error);
        console.log("pdf object keys:", Object.keys(pdf));
    }
})();
