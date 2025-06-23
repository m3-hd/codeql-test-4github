import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import VulnerableComponent from '../components/VulnerableComponent';
import { SecurityIssues } from '../securityIssues';

const VulnerableTestPage: NextPage = () => {
  const router = useRouter();
  const [userInput, setUserInput] = useState('');
  const [urlParam, setUrlParam] = useState('');
  const securityIssues = new SecurityIssues();

  // Source: URL parameters (attacker-controlled)
  useEffect(() => {
    if (router.query.input) {
      const input = Array.isArray(router.query.input) 
        ? router.query.input[0] 
        : router.query.input;
      setUrlParam(input);
      setUserInput(input);
      
      // Direct vulnerability: URL parameter to eval
      if (router.query.eval) {
        const evalCode = Array.isArray(router.query.eval) 
          ? router.query.eval[0] 
          : router.query.eval;
        try {
          // SINK: Direct eval of user input from URL
          securityIssues.unsafeDeserialization(evalCode);
        } catch (e) {
          console.error('Eval error:', e);
        }
      }

      // Command injection from URL
      if (router.query.cmd) {
        const command = Array.isArray(router.query.cmd) 
          ? router.query.cmd[0] 
          : router.query.cmd;
        // SINK: Command execution with user input
        securityIssues.commandInjection(command);
      }

      // File path traversal from URL
      if (router.query.file) {
        const filePath = Array.isArray(router.query.file) 
          ? router.query.file[0] 
          : router.query.file;
        // SINK: File operation with user input
        securityIssues.insecureFileOperation(filePath);
      }
    }
  }, [router.query]);

  // Source: Form input (user-controlled)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Multiple sinks for the same source
    securityIssues.unsafeDeserialization(userInput);
    securityIssues.commandInjection(userInput);
    securityIssues.insecureFileOperation(userInput);
    
    // Weak hashing of user input
    const hashedInput = securityIssues.weakHashingAlgorithm(userInput);
    console.log('Weak hash:', hashedInput);
  };

  // Source: localStorage (potentially attacker-controlled)
  useEffect(() => {
    const storedData = localStorage.getItem('userPreference');
    if (storedData) {
      // SINK: Eval of data from localStorage
      try {
        securityIssues.unsafeDeserialization(storedData);
      } catch (e) {
        console.error('LocalStorage eval error:', e);
      }
    }
  }, []);

  // Source: postMessage event (attacker-controlled)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // No origin validation - vulnerability
      const data = event.data;
      
      if (data && typeof data === 'string') {
        // SINK: Direct eval of postMessage data
        securityIssues.unsafeDeserialization(data);
        
        // SINK: Command execution from postMessage
        if (data.startsWith('cmd:')) {
          securityIssues.commandInjection(data.substring(4));
        }
        
        // SINK: File operation from postMessage
        if (data.startsWith('file:')) {
          securityIssues.insecureFileOperation(data.substring(5));
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Source: document.cookie (potentially attacker-controlled via XSS)
  useEffect(() => {
    const cookies = document.cookie;
    if (cookies.includes('malicious=')) {
      const maliciousValue = cookies.split('malicious=')[1]?.split(';')[0];
      if (maliciousValue) {
        // SINK: Eval of cookie data
        securityIssues.unsafeDeserialization(decodeURIComponent(maliciousValue));
      }
    }
  }, []);

  // Source: window.location.hash (attacker-controlled)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        // SINK: Direct eval of hash fragment
        securityIssues.unsafeDeserialization(hash);
        
        // DOM-based XSS
        const element = document.getElementById('hash-content');
        if (element) {
          element.innerHTML = hash; // SINK: innerHTML with user input
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div>
      <Head>
        <title>Vulnerable Test Page - CodeQL Testing</title>
        <meta name="description" content="Page with intentional vulnerabilities for CodeQL testing" />
      </Head>

      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Vulnerable Test Page</h1>
        <p className="mb-4 text-red-600 font-semibold">
          ⚠️ This page contains intentional security vulnerabilities for CodeQL testing purposes only!
        </p>

        {/* Form input source */}
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Form Input Test</h2>
          <form onSubmit={handleFormSubmit}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter test input (will be processed unsafely)"
              className="border p-2 mr-2 w-64"
            />
            <button type="submit" className="bg-red-500 text-white p-2 rounded">
              Process Input (Unsafe)
            </button>
          </form>
        </div>

        {/* URL parameter display */}
        {urlParam && (
          <div className="mb-6 p-4 border rounded bg-yellow-50">
            <h2 className="text-xl font-semibold mb-2">URL Parameter Detected</h2>
            <p>Input from URL: <code>{urlParam}</code></p>
            <p className="text-sm text-gray-600">
              Try: ?input=alert('xss')&eval=console.log('eval')&cmd=ls&file=/etc/passwd
            </p>
          </div>
        )}

        {/* Hash fragment display */}
        <div id="hash-content" className="mb-6 p-4 border rounded bg-blue-50">
          <h2 className="text-xl font-semibold mb-2">Hash Fragment Content</h2>
          <p className="text-sm text-gray-600">
            Content from URL hash will appear here (vulnerable to XSS)
          </p>
        </div>

        {/* PostMessage test */}
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">PostMessage Test</h2>
          <button
            onClick={() => {
              // Simulate malicious postMessage
              window.postMessage('alert("postMessage XSS")', '*');
              window.postMessage('cmd:whoami', '*');
              window.postMessage('file:/etc/hosts', '*');
            }}
            className="bg-orange-500 text-white p-2 rounded"
          >
            Send Malicious PostMessage
          </button>
        </div>

        {/* Cookie test */}
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Cookie Test</h2>
          <button
            onClick={() => {
              document.cookie = 'malicious=alert("cookie XSS"); path=/';
              window.location.reload();
            }}
            className="bg-purple-500 text-white p-2 rounded"
          >
            Set Malicious Cookie
          </button>
        </div>

        {/* Vulnerable Component */}
        <div className="mb-6">
          <VulnerableComponent userInput={userInput} />
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Testing Instructions</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>URL parameters: Add ?input=test&eval=malicious&cmd=ls&file=/etc/passwd</li>
            <li>Hash fragment: Add #alert('xss') to URL</li>
            <li>Form input: Enter any text and click "Process Input"</li>
            <li>PostMessage: Click the PostMessage button</li>
            <li>Cookie: Click the Cookie button</li>
            <li>Component buttons: Use the various vulnerable action buttons</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default VulnerableTestPage;
