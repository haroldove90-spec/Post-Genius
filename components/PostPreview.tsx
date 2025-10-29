import React, { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon, FacebookIcon } from './icons';

interface PostPreviewProps {
  content: string;
  onPublish: () => void;
  isPublishing: boolean;
  publishError: string | null;
  publishSuccess: boolean;
  publishMessage: string | null;
  canPublish: boolean;
  isScheduling: boolean;
  imageSource: string | null;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ 
  content,
  onPublish,
  isPublishing,
  publishError,
  publishSuccess,
  publishMessage,
  canPublish,
  isScheduling,
  imageSource,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!content || content.startsWith('El contenido generado')) return;
    navigator.clipboard.writeText(content);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);
  
  const hasGeneratedContent = content && !content.startsWith('El contenido generado');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 relative flex flex-col h-full">
      <div className="flex items-center mb-4">
        <img src="https://picsum.photos/id/1025/50/50" alt="Page Avatar" className="w-12 h-12 rounded-full mr-4" />
        <div>
          <p className="font-bold text-gray-800 dark:text-slate-200">Tu Fanpage</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">Justo ahora · <span title="Public">🌎</span></p>
        </div>
      </div>
      <p className="text-gray-700 dark:text-slate-300 whitespace-pre-wrap mb-4 flex-grow">{content}</p>
      
      {hasGeneratedContent && (
        <div className="aspect-w-16 aspect-h-9 mb-2">
          {imageSource ? (
              <img src={imageSource} alt="Vista previa de la publicación" className="w-full h-auto object-cover rounded-lg" />
          ) : (
            <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <p className="text-slate-500 dark:text-slate-400">Imagen de la publicación</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center text-gray-500 dark:text-slate-400 text-sm border-t border-b border-gray-200 dark:border-slate-700 py-2 my-2">
        <button className="flex-1 text-center hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-md">👍 Me gusta</button>
        <button className="flex-1 text-center hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-md">💬 Comentar</button>
        <button className="flex-1 text-center hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-md">↪️ Compartir</button>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCopy}
            disabled={!hasGeneratedContent || isCopied}
            className="w-full flex justify-center items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-600" /> : <CopyIcon className="w-5 h-5" />}
            Copiar Texto
          </button>
          <button
            onClick={onPublish}
            disabled={!canPublish || isPublishing}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {isPublishing ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FacebookIcon className="w-5 h-5"/>
            )}
            {isPublishing ? (isScheduling ? 'Programando...' : 'Publicando...') : (isScheduling ? 'Programar Publicación' : 'Publicar en Facebook')}
          </button>
        </div>
        {publishSuccess && publishMessage && <p className="text-green-600 dark:text-green-400 mt-3 text-sm text-center">{publishMessage}</p>}
        {publishError && <p className="text-red-500 dark:text-red-400 mt-3 text-sm text-center">{publishError}</p>}
      </div>
    </div>
  );
};
