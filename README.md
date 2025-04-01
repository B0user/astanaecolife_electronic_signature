# Electronic Signature System

A web-based electronic signature solution that allows users to upload PDF contracts, sign them digitally, and download the signed documents.

## Features

- Upload PDF contracts
- View uploaded contracts in the browser
- Sign documents with a digital signature pad
- Embed the signature onto the PDF document
- Add timestamp to the signed document
- Download the signed document

## Tech Stack

### Frontend
- React.js
- react-signature-canvas (for signature capture)
- axios (for API requests)
- file-saver (for downloading files)

### Backend
- Node.js
- Express
- pdf-lib (for PDF manipulation)
- multer (for file uploads)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
```
git clone <repository-url>
cd electronic-signature-system
```

2. Install backend dependencies:
```
cd server
npm install
```

3. Install frontend dependencies:
```
cd ../client
npm install
```

## Running the Application

1. Start the backend server:
```
cd server
npm run dev
```

2. In a separate terminal, start the frontend development server:
```
cd client
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Upload a PDF Contract**
   - Click the "Choose File" button to select a PDF contract from your computer
   - Click the "Upload Contract" button to upload the selected file

2. **Preview the Contract**
   - The uploaded contract will be displayed in the PDF viewer

3. **Sign the Contract**
   - Use the signature pad to draw your signature
   - If you make a mistake, click the "Clear Signature" button to try again
   - When satisfied with your signature, click the "Apply Signature to Document" button

4. **Download the Signed Contract**
   - After the signature is applied, the signed document will be displayed
   - Click the "Download Signed Document" button to save the document to your computer

## Future Enhancements

- User authentication and authorization
- Multiple signers support
- Integration with clinic management software APIs
- Cloud storage for documents
- Audit trail for document signing
- Email notifications

## License

This project is licensed under the MIT License - see the LICENSE file for details. 