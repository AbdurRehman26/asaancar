import React, { useState } from 'react';
import { Send, Copy, Download, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/utils';
import { useAuth } from '@/components/AuthContext';

interface PostmanTesterProps {
    isVisible: boolean;
}

interface ApiResponse {
    success?: boolean;
    message?: string;
    error?: string;
    status?: string;
    data?: Record<string, unknown>;
    validation_errors?: Record<string, string[]>;
}

function PostmanTesterContent() {
    const authContext = useAuth();
    const user = authContext?.user;

    const [apiType,] = useState<'pick_and_drop'>('pick_and_drop');
    const [jsonPayload, setJsonPayload] = useState<string>('{}');
    const [response, setResponse] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Only show for admin users
    if (!user?.roles?.includes('admin')) {
        return null;
    }

    const getTemplate = async () => {
        try {
            setLoading(true);
            setError(null);
            const endpoint = '/api/admin/postman/template/pick-and-drop';

            const res = await apiFetch(endpoint);
            if (!res.ok) throw new Error('Failed to load template');

            const data = await res.json();
            setJsonPayload(JSON.stringify(data.template, null, 2));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load template');
        } finally {
            setLoading(false);
        }
    };

    const executeRequest = async () => {
        try {
            setLoading(true);
            setError(null);
            setResponse(null);

            // Validate JSON

            const res = await apiFetch('/api/admin/postman/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_type: apiType,
                    payload: jsonPayload,
                }),
            });

            const data = await res.json();
            setResponse(data);

            if (!res.ok) {
                setError(data.error || 'Request failed');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const downloadResponse = () => {
        if (!response) return;
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(response, null, 2)));
        element.setAttribute('download', `response_${apiType}_${new Date().getTime()}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">API Testing (Postman)</h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Request Section */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Select API Type
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setResponse(null)}
                                className="flex-1 rounded px-4 py-2 font-semibold transition bg-[#7e246c] text-white"
                            >
                                Pick & Drop
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                JSON Payload
                            </label>
                            <button
                                onClick={getTemplate}
                                disabled={loading}
                                className="text-sm text-[#7e246c] hover:underline disabled:opacity-50"
                            >
                                Load Template
                            </button>
                        </div>
                        <textarea
                            value={jsonPayload}
                            onChange={(e) => setJsonPayload(e.target.value)}
                            className="h-80 w-full rounded border border-gray-300 bg-gray-50 p-3 font-mono text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                            placeholder='{"key": "value"}'
                            disabled={loading}
                        />
                    </div>

                    <button
                        onClick={executeRequest}
                        disabled={loading}
                        className="w-full rounded bg-[#7e246c] px-4 py-2 font-semibold text-white transition hover:bg-[#6b1f59] disabled:opacity-50"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Send size={16} />
                            {loading ? 'Executing...' : 'Execute Request'}
                        </div>
                    </button>
                </div>

                {/* Response Section */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Response
                        </label>
                        <div className="rounded border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
                            {error && (
                                <div className="border-b border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-900/20">
                                    <div className="flex gap-2">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                                    </div>
                                </div>
                            )}

                            {response && (
                                <div className="space-y-3 p-3">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                                                Status
                                            </span>
                                            {response.status && (
                                                <span
                                                    className={`rounded px-2 py-1 text-xs font-semibold ${
                                                        response.status === 'success'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {response.status.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {response.message || response.error || 'No message'}
                                        </p>
                                    </div>

                                    {response.data && (
                                        <div className="max-h-60 overflow-y-auto">
                                            <pre className="whitespace-pre-wrap break-words rounded bg-gray-900 p-3 font-mono text-xs text-green-400">
                                                {JSON.stringify(response.data, null, 2)}
                                            </pre>
                                        </div>
                                    )}

                                    {response.validation_errors && (
                                        <div className="max-h-60 overflow-y-auto">
                                            <p className="mb-2 text-xs font-semibold text-red-600 dark:text-red-400">
                                                Validation Errors:
                                            </p>
                                            <pre className="whitespace-pre-wrap break-words rounded bg-gray-900 p-3 font-mono text-xs text-red-400">
                                                {JSON.stringify(response.validation_errors, null, 2)}
                                            </pre>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                                            className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                <Copy size={12} />
                                                Copy
                                            </div>
                                        </button>
                                        <button
                                            onClick={downloadResponse}
                                            className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                <Download size={12} />
                                                Download
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!response && !error && (
                                <div className="flex h-80 items-center justify-center text-gray-400 dark:text-gray-500">
                                    <p>Response will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PostmanTester({ isVisible }: PostmanTesterProps) {
    if (!isVisible) {
        return null;
    }

    return <PostmanTesterContent />;
}
