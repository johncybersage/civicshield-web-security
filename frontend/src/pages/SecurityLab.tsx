import React, { useState } from 'react';
import api from '../utils/api';
import { ShieldAlert, ShieldCheck, Play, AlertTriangle } from 'lucide-react';

const SecurityLab = () => {
  const [payload, setPayload] = useState('<img src="x" onerror="alert(\'Stored XSS Demonstration Executed!\')">');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const res = await api.post('/security/xss-lab', { payload });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <ShieldAlert className="h-8 w-8 text-red-600 mr-3" />
          Security Lab: Stored XSS Demonstration
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-3xl">
          This controlled environment demonstrates the mechanics of Stored Cross-Site Scripting (XSS). 
          It isolates the vulnerability to prevent actual exploitation of the platform.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">1. Inject Malicious Payload</h3>
        <p className="text-sm text-slate-500 mb-4">
          Enter an HTML/JavaScript payload. For React, payloads like <code>&lt;img src="x" onerror="alert(1)"&gt;</code> 
          demonstrate execution effectively, as standard script tags injected via innerHTML are blocked by the browser by default.
        </p>
        <div className="flex space-x-4">
          <input
            type="text"
            className="flex-1 px-4 py-3 font-mono text-sm border border-slate-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
          <button
            onClick={runTest}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Execute Test
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Mode A: Vulnerable */}
          <div className="bg-red-50 rounded-xl border border-red-200 overflow-hidden shadow-sm">
            <div className="bg-red-100 px-4 py-3 border-b border-red-200 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="font-bold text-red-900">Mode A: Vulnerable Implementation</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-red-800 mb-4">
                This demonstrates what happens when untrusted user input is rendered directly into the DOM using unsafe methods (e.g., <code>dangerouslySetInnerHTML</code>) without backend sanitization.
              </p>
              
              <div className="bg-white p-4 rounded border border-red-200 min-h-[100px]">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Rendered Output:</h4>
                {/* VULNERABLE RENDER: Intentionally executing the script/HTML */}
                <div dangerouslySetInnerHTML={{ __html: result.vulnerable_output }} />
              </div>

              <div className="mt-4 bg-slate-900 p-3 rounded">
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Raw Backend Response:</h4>
                <code className="text-xs text-green-400 break-all">{result.vulnerable_output}</code>
              </div>
            </div>
          </div>

          {/* Mode B: Protected */}
          <div className="bg-green-50 rounded-xl border border-green-200 overflow-hidden shadow-sm">
            <div className="bg-green-100 px-4 py-3 border-b border-green-200 flex items-center">
              <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-bold text-green-900">Mode B: Protected Implementation</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-green-800 mb-4">
                This demonstrates our defense in depth. The backend sanitizes the input using <code>bleach</code>, and React safely encodes the output by default, neutralizing the payload.
              </p>
              
              <div className="bg-white p-4 rounded border border-green-200 min-h-[100px]">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Rendered Output:</h4>
                {/* SECURE RENDER: React automatically encodes strings */}
                <div>{result.protected_output}</div>
              </div>

              <div className="mt-4 bg-slate-900 p-3 rounded">
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Raw Backend Response:</h4>
                <code className="text-xs text-green-400 break-all">
                  {result.protected_output || '(Empty string - tag completely stripped)'}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityLab;
