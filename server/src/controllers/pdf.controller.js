const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

/**
 * Upload a PDF file
 */
const uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the PDF's page count
    const filePath = path.join(__dirname, '../../uploads', req.file.filename);
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();

    // Return the file name, path and page count
    return res.status(200).json({
      message: 'File uploaded successfully',
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      pageCount: pageCount
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};

/**
 * Add signature to PDF
 */
const addSignatureToPdf = async (req, res) => {
  try {
    const { fileName, signatureData, signaturePage = 1, positionX = 50, positionY = 10, newFileName } = req.body;

    if (!fileName || !signatureData) {
      return res.status(400).json({ message: 'File name and signature data are required' });
    }

    // File paths
    const filePath = path.join(__dirname, '../../uploads', fileName);
    const signedFilePath = path.join(__dirname, '../../uploads', newFileName || `signed_${fileName}`);
    
    // Create signature image file from base64
    const signatureImagePath = path.join(__dirname, '../../uploads', `signature_${Date.now()}.png`);
    const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(signatureImagePath, Buffer.from(base64Data, 'base64'));

    // Read PDF
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get the selected page
    const pages = pdfDoc.getPages();
    const pageIndex = Math.min(Math.max(signaturePage - 1, 0), pages.length - 1);
    const targetPage = pages[pageIndex];
    
    // Add the signature image
    const signatureImageBytes = fs.readFileSync(signatureImagePath);
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
    
    // Calculate positioning based on percentages
    const { width, height } = targetPage.getSize();
    const signatureWidth = 200; // Adjust as needed
    const signatureHeight = 100; // Adjust as needed
    
    // Convert percentage to coordinates
    // Note: positionY is inverted (0% is bottom, 100% is top)
    const xPosition = (width * positionX / 100) - (signatureWidth / 2);
    const yPosition = (height * positionY / 100); 
    
    // Add timestamp to the signature
    const timestamp = new Date().toLocaleString();
    
    // Draw the signature at the specified position
    targetPage.drawImage(signatureImage, {
      x: xPosition,
      y: yPosition,
      width: signatureWidth,
      height: signatureHeight,
    });
    
    // Add timestamp text
    targetPage.drawText(`Signed on: ${timestamp}`, {
      x: xPosition,
      y: yPosition - 20,
      size: 10,
    });
    
    // Save the modified PDF
    const signedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(signedFilePath, signedPdfBytes);
    
    // Clean up the temporary signature image
    fs.unlinkSync(signatureImagePath);
    
    // Return the new file path
    return res.status(200).json({
      message: 'Signature added successfully',
      fileName: newFileName || `signed_${fileName}`,
      filePath: `/uploads/${newFileName || `signed_${fileName}`}`
    });
  } catch (error) {
    console.error('Error adding signature to PDF:', error);
    return res.status(500).json({ message: 'Error adding signature', error: error.message });
  }
};

module.exports = {
  uploadPdf,
  addSignatureToPdf
}; 