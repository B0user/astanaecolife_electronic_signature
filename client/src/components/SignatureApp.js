import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import './SignatureApp.css';
import { saveAs } from 'file-saver';
import PdfViewer from './PdfViewer';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://srv.egs.demo.medcore.kz/api'  // Production server
  : 'http://localhost:5000/api';  // Development server

// Default signature position options
const POSITION_OPTIONS = [
  { id: 'bottom-center', label: 'Внизу по центру', x: 50, y: 10 },
  { id: 'bottom-right', label: 'Внизу справа', x: 70, y: 10 },
  { id: 'bottom-left', label: 'Внизу слева', x: 30, y: 10 },
  { id: 'custom', label: 'Выбрать позицию', x: 50, y: 50 }
];

const DEFAULT_SIGNATURE_SCALE = 1.0;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.0;

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
  const [signatureScale, setSignatureScale] = useState(DEFAULT_SIGNATURE_SCALE);
  
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
      setError('Пожалуйста, выберите PDF файл');
    }
  };
  
  // Upload the selected PDF file
  const uploadPdf = async () => {
    if (!file) {
      setError('Пожалуйста, сначала выберите PDF файл');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setMessage('Загрузка файла...');
    
    const formData = new FormData();
    formData.append('pdfFile', file);
    
    try {
      const response = await axios.post(`${API_URL}/pdf/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Use the full URL to access files in production, or use localhost in development
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://srv.egs.demo.medcore.kz'  // Production server
        : 'http://localhost:5000';  // Development server
      
      setPdfUrl(`${baseUrl}${response.data.filePath}`);
      setFileName(response.data.fileName);
      setTotalPages(response.data.pageCount || 1);
      setSignaturePage(response.data.pageCount || 1); // Default to last page
      setMessage('Файл успешно загружен. Теперь вы можете подписать документ.');
    } catch (err) {
      console.error('Ошибка загрузки файла:', err);
      setError(err.response?.data?.message || 'Ошибка загрузки файла. Пожалуйста, попробуйте снова.');
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
  
  // Handle signature scale change
  const handleScaleChange = (e) => {
    const scale = parseFloat(e.target.value);
    setSignatureScale(scale);
  };
  
  // Add signature to the PDF
  const addSignature = async () => {
    if (!fileName) {
      setError('Пожалуйста, сначала загрузите PDF файл');
      return;
    }
    
    if (sigCanvas.current.isEmpty()) {
      setError('Пожалуйста, оставьте подпись');
      return;
    }
    
    setIsSigning(true);
    setError('');
    setMessage('Добавление подписи к документу...');
    
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
        signatureScale,
        newFileName
      });
      
      // Use the full URL to access files in production, or use localhost in development
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://srv.egs.demo.medcore.kz'  // Production server
        : 'http://localhost:5000';  // Development server
      
      setSignedPdfUrl(`${baseUrl}${response.data.filePath}`);
      setMessage('Документ успешно подписан! Теперь вы можете скачать его.');
      setSignatureComplete(true);
    } catch (err) {
      console.error('Ошибка добавления подписи:', err);
      setError(err.response?.data?.message || 'Ошибка добавления подписи. Пожалуйста, попробуйте снова.');
    } finally {
      setIsSigning(false);
    }
  };
  
  // Download the signed PDF
  const downloadSignedPdf = () => {
    if (signedPdfUrl) {
      saveAs(signedPdfUrl, `подписанный_документ_${Date.now()}.pdf`);
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
    setSignatureScale(DEFAULT_SIGNATURE_SCALE);
    clearSignature();
  };
  
  // Generate page options
  const pageOptions = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Handle saving custom position
  const handleSavePosition = () => {
    if (!newPositionName.trim()) {
      setError('Пожалуйста, введите название для этой позиции');
      return;
    }

    const newPosition = {
      id: `custom-${Date.now()}`,
      label: newPositionName,
      x: customPosition.x,
      y: customPosition.y,
      scale: signatureScale
    };

    setCustomPositions([...customPositions, newPosition]);
    setShowSavePosition(false);
    setNewPositionName('');
    setMessage('Пользовательская позиция успешно сохранена!');
  };

  // Handle custom position selection
  const handleCustomPositionSelect = (position) => {
    setCustomPosition({ x: position.x, y: position.y });
    setSignaturePosition(position);
    setShowCustomPosition(true);
    // Apply saved scale if available
    if (position.scale) {
      setSignatureScale(position.scale);
    }
  };
  
  return (
    <div className="signature-app">
      <div className="container">
        <div className="card">
          <h2>Загрузка Контракта</h2>
          <div className="form-group">
            <label htmlFor="pdf-upload">Выберите PDF контракт для подписи:</label>
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
              {isUploading ? 'Загрузка...' : 'Загрузить Контракт'}
            </button>
          )}
          
          {pdfUrl && !signatureComplete && (
            <button className="button secondary" onClick={handleReset}>
              Загрузить Другой Контракт
            </button>
          )}
        </div>
        
        {pdfUrl && (
          <>
            <div className="card">
              <h2>Предварительный Просмотр</h2>
              <div className="pdf-container">
                <PdfViewer pdfUrl={pdfUrl} />
              </div>
            </div>
            
            <div className="card">
              <h2>Подписать Документ</h2>
              <p>Пожалуйста, оставьте подпись в области ниже:</p>
              
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
                  Очистить Подпись
                </button>
              </div>
              
              <div className="signature-position-container">
                <h3>Размещение Подписи</h3>
                
                <div className="form-group">
                  <label htmlFor="signature-page">Страница для подписи:</label>
                  <select 
                    id="signature-page" 
                    className="form-control"
                    value={signaturePage}
                    onChange={handlePageChange}
                  >
                    {pageOptions.map(page => (
                      <option key={page} value={page}>
                        Страница {page} {page === totalPages ? '(Последняя Страница)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="signature-position">Позиция подписи:</label>
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
                      <label htmlFor="position-x">Горизонтальная позиция (0-100%):</label>
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
                      <label htmlFor="position-y">Вертикальная позиция (0-100%):</label>
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
                      <p className="position-note">Примечание: 0% - это внизу страницы, 100% - вверху</p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="signature-scale">Размер подписи ({(signatureScale * 100).toFixed(0)}%):</label>
                      <input
                        type="range"
                        id="signature-scale"
                        min={MIN_SCALE}
                        max={MAX_SCALE}
                        step="0.1"
                        value={signatureScale}
                        onChange={handleScaleChange}
                        className="form-control range"
                      />
                      <div className="scale-indicators">
                        <span>Меньше</span>
                        <span>Больше</span>
                      </div>
                    </div>

                    {!showSavePosition ? (
                      <button 
                        className="button secondary" 
                        onClick={() => setShowSavePosition(true)}
                      >
                        Сохранить Позицию
                      </button>
                    ) : (
                      <div className="save-position-form">
                        <div className="form-group">
                          <label htmlFor="position-name">Название позиции:</label>
                          <input
                            type="text"
                            id="position-name"
                            className="form-control"
                            value={newPositionName}
                            onChange={(e) => setNewPositionName(e.target.value)}
                            placeholder="Введите название для этой позиции"
                          />
                        </div>
                        <div className="button-group">
                          <button 
                            className="button success" 
                            onClick={handleSavePosition}
                            disabled={!newPositionName.trim()}
                          >
                            Сохранить
                          </button>
                          <button 
                            className="button secondary" 
                            onClick={() => {
                              setShowSavePosition(false);
                              setNewPositionName('');
                            }}
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {customPositions.length > 0 && (
                  <div className="saved-positions">
                    <h4>Сохраненные Позиции</h4>
                    <div className="saved-positions-grid">
                      {customPositions.map(position => (
                        <div key={position.id} className="saved-position-item">
                          <span>{position.label}</span>
                          <div className="saved-position-actions">
                            <button 
                              className="button small"
                              onClick={() => handleCustomPositionSelect(position)}
                            >
                              Использовать
                            </button>
                            <button 
                              className="button small danger"
                              onClick={() => setCustomPositions(prev => 
                                prev.filter(p => p.id !== position.id)
                              )}
                            >
                              Удалить
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
                  {isSigning ? 'Обработка...' : 'Применить Подпись к Документу'}
                </button>
              </div>
            </div>
          </>
        )}
        
        {signatureComplete && (
          <div className="card">
            <h2>Подписанный Документ</h2>
            <p>Ваш документ успешно подписан!</p>
            <div className="pdf-container">
              <PdfViewer pdfUrl={signedPdfUrl} />
            </div>
            <button className="button success" onClick={downloadSignedPdf}>
              Скачать Подписанный Документ
            </button>
            <button className="button secondary" onClick={handleReset}>
              Подписать Другой Документ
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