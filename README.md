# Система Электронной Подписи (Electronic Signature System)

Веб-приложение для электронной подписи, которое позволяет загружать PDF-контракты, подписывать их цифровой подписью и скачивать подписанные документы.

## Features

- Upload PDF contracts
- View uploaded contracts in the browser
- Sign documents with a digital signature pad
- Embed the signature onto the PDF document
- Add timestamp to the signed document
- Download the signed document
- Save custom signature positions
- Multilingual interface (Russian)

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

### Deployment
- Docker
- Nginx

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

### Development mode

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

### Docker Deployment

1. Make sure Docker and Docker Compose are installed on your system.

2. Build and start the containers:
```
docker-compose up --build
```

3. Or run in detached mode:
```
docker-compose up -d --build
```

4. The application will be available at:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000

5. To stop the containers:
```
docker-compose down
```

## Usage

1. **Upload a PDF Contract**
   - Click the "Choose File" button to select a PDF contract from your computer
   - Click the "Upload Contract" button to upload the selected file

2. **Preview the Contract**
   - The uploaded contract will be displayed in the PDF viewer

3. **Sign the Contract**
   - Use the signature pad to draw your signature
   - If you make a mistake, click the "Clear Signature" button to try again
   - Select the page and position for your signature
   - You can create and save custom positions for future use
   - When satisfied with your signature, click the "Apply Signature to Document" button

4. **Download the Signed Contract**
   - After the signature is applied, the signed document will be displayed
   - Click the "Download Signed Document" button to save the document to your computer

## Docker Image Structure

The application is containerized with Docker using a multi-stage build process:

- **Client Container**: 
  - Uses Node.js for building the React app
  - Serves the built static files using Nginx
  - Proxies API requests to the backend service

- **Server Container**:
  - Runs the Node.js Express backend
  - Handles file uploads and PDF manipulation
  - Exposes port 5000 for API access

- **Volume Mounting**:
  - The server's uploads directory is mounted as a volume to persist uploaded files

## Future Enhancements

- User authentication and authorization
- Multiple signers support
- Integration with clinic management software APIs
- Cloud storage for documents
- Audit trail for document signing
- Email notifications

## License

This project is licensed under the MIT License - see the LICENSE file for details. 