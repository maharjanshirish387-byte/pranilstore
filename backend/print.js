const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec } = require('child_process');

// Print plain text on Windows using PowerShell Out-Printer
// Requires the server to run on a machine that has access to the target printer.
function printText(text, printerName) {
    return new Promise((resolve, reject) => {
        try {
            const tmpDir = os.tmpdir();
            const fileName = `order_receipt_${Date.now()}.txt`;
            const filePath = path.join(tmpDir, fileName);

            fs.writeFileSync(filePath, text, 'utf8');

            // Build PowerShell command to print the file to the named printer
            // If printerName is empty, Out-Printer will use default printer.
            const printerArg = printerName ? `-Name "${printerName.replace(/"/g, '')}"` : '';
            const cmd = `powershell -NoProfile -Command "Get-Content -LiteralPath '${filePath.replace(/'/g, "''")}' | Out-Printer ${printerArg}"`;

            exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
                // remove temp file
                try { fs.unlinkSync(filePath); } catch (e) {}

                if (err) {
                    return reject(new Error(stderr || err.message));
                }
                resolve({ stdout, stderr });
            });
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = { printText };
