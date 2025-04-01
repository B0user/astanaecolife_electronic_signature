import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import './SignatureApp.css';
import { saveAs } from 'file-saver';
import PdfViewer from './PdfViewer';

const API_URL = 'http://localhost:5000/api';

// Default signature position options
const POSITION_OPTIONS = [
  { id: 'bottom-center', label: 'Bottom Center', x: 50, y: 10 },
  { id: 'bottom-right', label: 'Bottom Right', x: 70, y: 10 },
  { id: 'bottom-left', label: 'Bottom Left', x: 30, y: 10 },
  { id: 'custom', label: 'Custom Position', x: 50, y: 50 }
];

const SignatureApp = () => {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [signatureComplete, setSignatureComplete] = useState(false);
  const [signedPdfUrl, setSignedPdfUrl] = useState('');
  const [signaturePage, setSignaturePage] = useState(1);
  const [signaturePosition, setSignaturePosition] = useState(POSITION_OPTIONS[0]);
  const [customPosition, setCustomPosition] = useState({ x: 50, y: 10 });
  const [showCustomPosition, setShowCustomPosition] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [customPositions, setCustomPositions] = useState([]);
  const [showSavePosition, setShowSavePosition] = useState(false);
  const [newPositionName, setNewPositionName] = useState('');
  
  const sigCanvas = useRef({});
  
  // Clear the signature pad
  const clearSignature = () => {
    sigCanvas.current.clear();
    setSignatureComplete(false);
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setPdfUrl('');
      setFileName('');
      setSignedPdfUrl('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };
  
  // Upload the selected PDF file
  const uploadPdf = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setMessage('Uploading file...');
    
    const formData = new FormData();
    formData.append('pdfFile', file);
    
    try {
      const response = await axios.post(`${API_URL}/pdf/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setPdfUrl(`http://localhost:5000${response.data.filePath}`);
      setFileName(response.data.fileName);
      setTotalPages(response.data.pageCount || 1);
      setSignaturePage(response.data.pageCount || 1); // Default to last page
      setMessage('File uploaded successfully. You can now sign the document.');
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.message || 'Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle signature position selection
  const handlePositionChange = (e) => {
    const selectedPosition = POSITION_OPTIONS.find(pos => pos.id === e.target.value) ||
                           customPositions.find(pos => pos.id === e.target.value);
    setSignaturePosition(selectedPosition);
    setShowCustomPosition(selectedPosition.id === 'custom' || selectedPosition.id.startsWith('custom-'));
    if (selectedPosition.id === 'custom' || selectedPosition.id.startsWith('custom-')) {
      setCustomPosition({ x: selectedPosition.x, y: selectedPosition.y });
    }
  };
  
  // Handle custom position change
  const handleCustomPositionChange = (e, axis) => {
    const value = parseInt(e.target.value, 10);
    setCustomPosition(prev => ({
      ...prev,
      [axis]: value
    }));
  };
  
  // Handle signature page selection
  const handlePageChange = (e) => {
    const page = parseInt(e.target.value, 10);
    setSignaturePage(page);
  };
  
  // Add signature to the PDF
  const addSignature = async () => {
    if (!fileName) {
      setError('Please upload a PDF file first');
      return;
    }
    
    if (sigCanvas.current.isEmpty()) {
      setError('Please provide a signature');
      return;
    }
    
    setIsSigning(true);
    setError('');
    setMessage('Adding signature to document...');
    
    try {
      // Convert signature to PNG data URL
      const signatureData = sigCanvas.current.toDataURL('image/png');
      
      // Determine position to use
      const positionToUse = signaturePosition.id === 'custom' ? customPosition : signaturePosition;
      
      // Generate a unique timestamp for the file name
      const timestamp = Date.now();
      const newFileName = `signed_${timestamp}_${fileName}`;
      
      const response = await axios.post(`${API_URL}/pdf/add-signature`, {
        fileName,
        signatureData,
        signaturePage,
        positionX: positionToUse.x,
        positionY: positionToUse.y,
        newFileName
      });
      
      setSignedPdfUrl(`http://localhost:5000${response.data.filePath}`);
      setMessage('Document signed successfully! You can now download it.');
      setSignatureComplete(true);
    } catch (err) {
      console.error('Error adding signature:', err);
      setError(err.response?.data?.message || 'Error adding signature. Please try again.');
    } finally {
      setIsSigning(false);
    }
  };
  
  // Download the signed PDF
  const downloadSignedPdf = () => {
    if (signedPdfUrl) {
      saveAs(signedPdfUrl, `signed_document_${Date.now()}.pdf`);
    }
  };
  
  // Reset the form
  const handleReset = () => {
    setFile(null);
    setPdfUrl('');
    setFileName('');
    setSignedPdfUrl('');
    setMessage('');
    setError('');
    setSignatureComplete(false);
    setSignaturePage(1);
    setSignaturePosition(POSITION_OPTIONS[0]);
    setShowCustomPosition(false);
    clearSignature();
  };
  
  // Generate page options
  const pageOptions = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Handle saving custom position
  const handleSavePosition = () => {
    if (!newPositionName.trim()) {
      setError('Please enter a name for this position');
      return;
    }

    const newPosition = {
      id: `custom-${Date.now()}`,
      label: newPositionName,
      x: customPosition.x,
      y: customPosition.y
    };

    setCustomPositions([...customPositions, newPosition]);
    setShowSavePosition(false);
    setNewPositionName('');
    setMessage('Custom position saved successfully!');
  };

  // Handle custom position selection
  const handleCustomPositionSelect = (position) => {
    setCustomPosition({ x: position.x, y: position.y });
    setSignaturePosition(position);
    setShowCustomPosition(true);
  };
  
  return (
    <div className="signature-app">
      <div className="container">
        <div className="card">
          <h2>Upload Contract</h2>
          <div className="form-group">
            <label htmlFor="pdf-upload">Select PDF contract to sign:</label>
            <input
              type="file"
              id="pdf-upload"
              accept="application/pdf"
              onChange={handleFileChange}
              className="form-control"
              disabled={isUploading || pdfUrl}
            />
          </div>
          
          {file && !pdfUrl && (
            <button 
              className="button" 
              onClick={uploadPdf} 
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Contract'}
            </button>
          )}
          
          {pdfUrl && !signatureComplete && (
            <button className="button secondary" onClick={handleReset}>
              Upload a Different Contract
            </button>
          )}
        </div>
        
        {pdfUrl && (
          <>
            <div className="card">
              <h2>Preview Document</h2>
              <div className="pdf-container">
                <PdfViewer pdfUrl={pdfUrl} />
              </div>
            </div>
            
            <div className="card">
              <h2>Sign Document</h2>
              <p>Please sign in the area below:</p>
              
              <div className="signature-container">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{
                    className: 'signature-canvas',
                    width: 500,
                    height: 200
                  }}
                />
              </div>
              
              <div className="button-group">
                <button className="button secondary" onClick={clearSignature}>
                  Clear Signature
                </button>
              </div>
              
              <div className="signature-position-container">
                <h3>Signature Placement</h3>
                
                <div className="form-group">
                  <label htmlFor="signature-page">Page to sign:</label>
                  <select 
                    id="signature-page" 
                    className="form-control"
                    value={signaturePage}
                    onChange={handlePageChange}
                  >
                    {pageOptions.map(page => (
                      <option key={page} value={page}>
                        Page {page} {page === totalPages ? '(Last Page)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="signature-position">Signature Position:</label>
                  <select 
                    id="signature-position" 
                    className="form-control"
                    value={signaturePosition.id}
                    onChange={handlePositionChange}
                  >
                    {[...POSITION_OPTIONS, ...customPositions].map(position => (
                      <option key={position.id} value={position.id}>
                        {position.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {showCustomPosition && (
                  <div className="custom-position-controls">
                    <div className="form-group">
                      <label htmlFor="position-x">Horizontal Position (0-100%):</label>
                      <input
                        type="range"
                        id="position-x"
                        min="0"
                        max="100"
                        value={customPosition.x}
                        onChange={(e) => handleCustomPositionChange(e, 'x')}
                        className="form-control range"
                      />
                      <span>{customPosition.x}%</span>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="position-y">Vertical Position (0-100%):</label>
                      <input
                        type="range"
                        id="position-y"
                        min="0"
                        max="100"
                        value={customPosition.y}
                        onChange={(e) => handleCustomPositionChange(e, 'y')}
                        className="form-control range"
                      />
                      <span>{customPosition.y}%</span>
                      <p className="position-note">Note: 0% is at the bottom of the page, 100% is at the top</p>
                    </div>

                    {!showSavePosition ? (
                      <button 
                        className="button secondary" 
                        onClick={() => setShowSavePosition(true)}
                      >
                        Save as Custom Position
                      </button>
                    ) : (
                      <div className="save-position-form">
                        <div className="form-group">
                          <label htmlFor="position-name">Position Name:</label>
                          <input
                            type="text"
                            id="position-name"
                            className="form-control"
                            value={newPositionName}
                            onChange={(e) => setNewPositionName(e.target.value)}
                            placeholder="Enter a name for this position"
                          />
                        </div>
                        <div className="button-group">
                          <button 
                            className="button success" 
                            onClick={handleSavePosition}
                            disabled={!newPositionName.trim()}
                          >
                            Save Position
                          </button>
                          <button 
                            className="button secondary" 
                            onClick={() => {
                              setShowSavePosition(false);
                              setNewPositionName('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {customPositions.length > 0 && (
                  <div className="saved-positions">
                    <h4>Saved Custom Positions</h4>
                    <div className="saved-positions-grid">
                      {customPositions.map(position => (
                        <div key={position.id} className="saved-position-item">
                          <span>{position.label}</span>
                          <div className="saved-position-actions">
                            <button 
                              className="button small"
                              onClick={() => handleCustomPositionSelect(position)}
                            >
                              Use
                            </button>
                            <button 
                              className="button small danger"
                              onClick={() => setCustomPositions(prev => 
                                prev.filter(p => p.id !== position.id)
                              )}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  className="button success"
                  onClick={addSignature}
                  disabled={isSigning}
                >
                  {isSigning ? 'Processing...' : 'Apply Signature to Document'}
                </button>
              </div>
            </div>
          </>
        )}
        
        {signatureComplete && (
          <div className="card">
            <h2>Signed Document</h2>
            <p>Your document has been signed successfully!</p>
            <div className="pdf-container">
              <PdfViewer pdfUrl={signedPdfUrl} />
            </div>
            <button className="button success" onClick={downloadSignedPdf}>
              Download Signed Document
            </button>
            <button className="button secondary" onClick={handleReset}>
              Sign Another Document
            </button>
          </div>
        )}
        
        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}
      </div>
    </div>
  );
};

export default SignatureApp; 