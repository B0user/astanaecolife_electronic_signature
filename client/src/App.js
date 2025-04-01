import React from 'react';
import './App.css';
import SignatureApp from './components/SignatureApp';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Electronic Signature System</h1>
      </header>
      <main>
        <SignatureApp />
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Electronic Signature System</p>
      </footer>
    </div>
  );
}

export default App; 