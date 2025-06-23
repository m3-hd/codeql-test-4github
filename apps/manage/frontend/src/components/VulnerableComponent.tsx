import React, { useState, useEffect } from 'react';
import { SecurityIssues } from '../securityIssues';

interface VulnerableComponentProps {
  userInput?: string;
}

const VulnerableComponent: React.FC<VulnerableComponentProps> = ({ userInput }) => {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');
  const [fileContent, setFileContent] = useState('');
  const securityIssues = new SecurityIssues();

  // XSS vulnerability - user input directly rendered as HTML
  const renderUnsafeHTML = (input: string) => {
    return { __html: securityIssues.xssVulnerability(input) };
  };

  // Command injection through user input
  const executeUserCommand = async (command: string) => {
    try {
      // This would be vulnerable if uncommented in securityIssues.ts
      const response = await fetch('/api/vulnerable/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const result = await response.text();
      setResult(result);
    } catch (error) {
      console.error('Command execution failed:', error);
    }
  };

  // Unsafe deserialization with user input
  const deserializeUserData = (data: string) => {
    try {
      // Direct eval() execution - extremely dangerous
      const deserializedData = securityIssues.unsafeDeserialization(data);
      setResult(JSON.stringify(deserializedData));
    } catch (error) {
      console.error('Deserialization failed:', error);
    }
  };

  // Path traversal vulnerability
  const readUserFile = async (filePath: string) => {
    try {
      const response = await fetch(`/api/vulnerable/file?path=${encodeURIComponent(filePath)}`);
      const content = await response.text();
      setFileContent(content);
    } catch (error) {
      console.error('File read failed:', error);
    }
  };

  // SQL injection through user input
  const searchUsers = async (searchTerm: string) => {
    try {
      const response = await fetch(`/api/vulnerable/users?name=${encodeURIComponent(searchTerm)}`);
      const result = await response.text();
      setResult(result);
    } catch (error) {
      console.error('User search failed:', error);
    }
  };

  // Weak password hashing
  const hashPassword = (password: string) => {
    const hashedPassword = securityIssues.weakHashingAlgorithm(password);
    setResult(`Hashed password: ${hashedPassword}`);
  };

  // DOM-based XSS
  useEffect(() => {
    if (userInput) {
      // Directly setting innerHTML with user input
      const element = document.getElementById('user-content');
      if (element) {
        element.innerHTML = userInput;
      }
    }
  }, [userInput]);

  // Client-side template injection
  const renderTemplate = (template: string, data: any) => {
    // Unsafe template rendering
    const rendered = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
    return { __html: rendered };
  };

  // Insecure random number generation
  const generateToken = () => {
    // Using Math.random() for security tokens is insecure
    const token = Math.random().toString(36).substring(2, 15);
    setResult(`Generated token: ${token}`);
  };

  // Local storage of sensitive data
  const storeSensitiveData = (data: string) => {
    // Storing sensitive data in localStorage is insecure
    localStorage.setItem('sensitiveData', data);
    localStorage.setItem('apiKey', '1234567890abcdef');
    setResult('Sensitive data stored in localStorage');
  };

  // Unsafe URL construction
  const redirectToUserURL = (url: string) => {
    // Open redirect vulnerability
    window.location.href = url;
  };

  // PostMessage without origin validation
  const sendMessage = (message: string) => {
    // Sending messages without origin validation
    window.parent.postMessage(message, '*');
  };

  return (
    <div className="vulnerable-component p-4">
      <h2 className="text-2xl font-bold mb-4">Vulnerable Component (For Testing Only)</h2>
      
      <div className="mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter test input"
          className="border p-2 mr-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => deserializeUserData(inputValue)}
          className="bg-red-500 text-white p-2 rounded"
        >
          Unsafe Deserialize
        </button>

        <button
          onClick={() => executeUserCommand(inputValue)}
          className="bg-red-500 text-white p-2 rounded"
        >
          Execute Command
        </button>

        <button
          onClick={() => readUserFile(inputValue)}
          className="bg-red-500 text-white p-2 rounded"
        >
          Read File
        </button>

        <button
          onClick={() => searchUsers(inputValue)}
          className="bg-red-500 text-white p-2 rounded"
        >
          Search Users (SQL)
        </button>

        <button
          onClick={() => hashPassword(inputValue)}
          className="bg-red-500 text-white p-2 rounded"
        >
          Hash Password (Weak)
        </button>

        <button
          onClick={() => generateToken()}
          className="bg-red-500 text-white p-2 rounded"
        >
          Generate Token (Insecure)
        </button>

        <button
          onClick={() => storeSensitiveData(inputValue)}
          className="bg-red-500 text-white p-2 rounded"
        >
          Store in LocalStorage
        </button>

        <button
          onClick={() => redirectToUserURL(inputValue)}
          className="bg-red-500 text-white p-2 rounded"
        >
          Redirect to URL
        </button>
      </div>

      {/* XSS vulnerability - unsafe HTML rendering */}
      <div className="mt-4">
        <h3>Unsafe HTML Rendering:</h3>
        <div dangerouslySetInnerHTML={renderUnsafeHTML(inputValue)} />
      </div>

      {/* DOM-based XSS target */}
      <div id="user-content" className="mt-4 border p-2">
        {/* Content will be set via innerHTML */}
      </div>

      {/* Template injection vulnerability */}
      <div className="mt-4">
        <h3>Template Rendering:</h3>
        <div dangerouslySetInnerHTML={renderTemplate(
          '<p>Hello {{name}}, your input is: {{input}}</p>',
          { name: 'User', input: inputValue }
        )} />
      </div>

      {/* Results display */}
      {result && (
        <div className="mt-4 p-2 bg-gray-100">
          <h3>Result:</h3>
          <pre>{result}</pre>
        </div>
      )}

      {fileContent && (
        <div className="mt-4 p-2 bg-gray-100">
          <h3>File Content:</h3>
          <pre>{fileContent}</pre>
        </div>
      )}
    </div>
  );
};

export default VulnerableComponent;
