import React from 'react';
import './PdfViewer.css';

const PdfViewer = ({ pdfUrl }) => {
  return (
    <div className="pdf-viewer">
      <iframe
        src={`${pdfUrl}#toolbar=0&navpanes=0`}
        title="PDF Viewer"
        width="100%"
        height="600px"
        className="pdf-iframe"
      />
    </div>
  );
};

export default PdfViewer; 