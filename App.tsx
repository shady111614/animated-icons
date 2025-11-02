import React, { useState, useCallback } from 'react';
import { proposeAnimations, generateAnimatedIcon } from './services/geminiService';

// --- Icon Components ---

const SuggestIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-5 w-5"><path d="M12 3L9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z"/></svg>
);

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
);

const Loader: React.FC<{text: string}> = ({text}) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-75 z-10 rounded-lg text-center">
        <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-300">{text}</p>
    </div>
);

// --- Main App Component ---

export default function App() {
    const [iconPrompt, setIconPrompt] = useState<string>('');
    const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);
    
    const isLoading = loadingMessage !== null;

    const handleProposeAnimations = async () => {
        if (!iconPrompt.trim()) {
            setError("الرجاء كتابة وصف للأيقونة أولاً.");
            return;
        }
        setLoadingMessage("جاري البحث عن حركات ملهمة...");
        setError(null);
        setGeneratedSvg(null);
        setSuggestions([]);

        try {
            const result = await proposeAnimations(iconPrompt);
            setSuggestions(result);
            if (result.length === 0) {
                 setError("لم نتمكن من إيجاد اقتراحات. حاول وصف الأيقونة بشكل مختلف.");
            }
        } catch (err) {
            setError("حدث خطأ أثناء اقتراح الحركات. الرجاء المحاولة مرة أخرى.");
        } finally {
            setLoadingMessage(null);
        }
    };

    const handleGenerateAnimatedIcon = async (animationPrompt: string) => {
        setLoadingMessage("جاري تصميم وتحريك الأيقونة...");
        setError(null);
        setGeneratedSvg(null);
        setSuggestions([]);

        try {
            const result = await generateAnimatedIcon(iconPrompt, animationPrompt);
            setGeneratedSvg(result);
        } catch (err) {
            setError("حدث خطأ أثناء إنشاء الأيقونة المتحركة. الرجاء المحاولة مرة أخرى.");
        } finally {
            setLoadingMessage(null);
        }
    };
    
    const handleCopy = useCallback(() => {
        if (generatedSvg) {
            navigator.clipboard.writeText(generatedSvg).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            });
        }
    }, [generatedSvg]);

    const handleDownload = useCallback(() => {
        if (generatedSvg) {
            const blob = new Blob([generatedSvg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'animated_icon.svg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }, [generatedSvg]);
    
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                    صانع الأيقونات المتحركة
                </h1>
                <p className="text-gray-400 mt-2 text-lg">
                    فكر في الحركة أولاً، ثم شاهد الذكاء الاصطناعي يبدع!
                </p>
            </header>

            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl w-full mx-auto">
                {/* --- Settings Panel --- */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 flex flex-col gap-6">
                    <div>
                        <label htmlFor="icon-prompt" className="font-medium text-gray-300 mb-2 block text-lg">1. صف الأيقونة التي تتخيلها</label>
                        <textarea
                            id="icon-prompt"
                            rows={3}
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow placeholder-gray-500"
                            placeholder="مثال: صاروخ فضائي ينطلق، شعار على شكل قلب، رمز سحابة تمطر..."
                            value={iconPrompt}
                            onChange={(e) => setIconPrompt(e.target.value)}
                            disabled={isLoading || suggestions.length > 0}
                        />
                        <button
                            onClick={handleProposeAnimations}
                            disabled={isLoading || !iconPrompt.trim() || suggestions.length > 0}
                            className="w-full flex items-center justify-center mt-3 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            اقترح حركات
                            <SuggestIcon />
                        </button>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                         <h3 className="font-medium text-gray-300 mb-3 block text-lg">2. اختر الحركة المفضلة</h3>
                         <div className="min-h-[80px] flex flex-col justify-center">
                            {suggestions.length > 0 && !isLoading && (
                                <div className="flex flex-wrap gap-2 animate-fade-in">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleGenerateAnimatedIcon(suggestion)}
                                            disabled={isLoading}
                                            className="text-sm bg-gray-700 text-gray-300 px-4 py-2 rounded-full hover:bg-purple-600 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-800 disabled:text-gray-500 transform hover:scale-110"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {suggestions.length === 0 && !isLoading && (
                                <p className="text-gray-500 text-center">اكتب وصفًا واضغط على "اقترح حركات" للبدء.</p>
                            )}
                         </div>
                    </div>
                    {error && <div className="text-red-400 bg-red-900/30 p-3 rounded-lg text-sm mt-2">{error}</div>}
                </div>

                {/* --- Result Panel --- */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 flex flex-col">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
                        <h2 className="text-2xl font-semibold text-gray-200">النتيجة</h2>
                        {generatedSvg && (
                            <div className="flex items-center gap-2">
                                <button onClick={handleCopy} className="relative bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-lg transition-colors text-sm flex items-center gap-2">
                                    <CopyIcon />
                                    {copySuccess && <span className="absolute -top-8 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded">تم النسخ!</span>}
                                </button>
                                <button onClick={handleDownload} className="bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-lg transition-colors text-sm flex items-center gap-2">
                                    <DownloadIcon />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex-grow bg-grid-pattern bg-center rounded-lg flex items-center justify-center relative min-h-[300px]">
                        {isLoading && <Loader text={loadingMessage || 'جاري العمل...'}/>}
                        {generatedSvg ? (
                            <div
                                className="w-48 h-48 svg-container"
                                dangerouslySetInnerHTML={{ __html: generatedSvg }}
                            />
                        ) : (
                            !isLoading && <div className="text-center text-gray-500">
                                <p>النتيجة ستظهر هنا.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
