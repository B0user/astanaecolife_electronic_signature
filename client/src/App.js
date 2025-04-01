import React from 'react';
import './App.css';
import SignatureApp from './components/SignatureApp';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Система Электронной Графической Подписи</h1>
      </header>
      <main>
        <SignatureApp />
      </main>
      <footer>
        <p>MEDCORE DEVELOPMENT GROUP &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App; 