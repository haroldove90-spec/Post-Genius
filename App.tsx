import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PostTone, FacebookPage, ScheduledPost, PostStatus } from './types';
import { generatePostContent, generatePostImage } from './services/geminiService';
import { PostPreview } from './components/PostPreview';
import { ScheduledPostList } from './components/ScheduledPostList';
import { SparklesIcon, FacebookIcon, ExclamationTriangleIcon, SunIcon, MoonIcon, PhotoIcon, AdjustmentsHorizontalIcon } from './components/icons';

declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, fbAppId: string) => void;
  initialApiKey?: string;
  initialFbAppId?: string;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onSave, initialApiKey = '', initialFbAppId = '' }) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [fbAppId, setFbAppId] = useState(initialFbAppId);

  useEffect(() => {
    setApiKey(initialApiKey);
    setFbAppId(initialFbAppId);
  }, [initialApiKey, initialFbAppId, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKey, fbAppId);
  };

  const canSave = apiKey.trim() !== '' && fbAppId.trim() !== '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-md m-4 transform transition-all">
        <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Configuración</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none">&times;</button>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
          Ingresa tus claves para activar las funciones de IA y la conexión con Facebook.
        </p>
        <div className="space-y-6">
          <div>
            <label htmlFor="gemini-api-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Google Gemini API Key
            </label>
            <input
              type="password"
              id="gemini-api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ingresa tu API Key"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Obtén tu clave desde <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Google AI Studio</a>.
            </p>
          </div>
          <div>
            <label htmlFor="fb-app-id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Facebook App ID
            </label>
            <input
              type="text"
              id="fb-app-id"
              value={fbAppId}
              onChange={(e) => setFbAppId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ingresa tu App ID"
            />
             <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Encuentra tu App ID en el <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">panel de Facebook for Developers</a>.
            </p>
            <div className="mt-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Para que la conexión funcione, agrega la siguiente URL a la lista de "Dominios de host del SDK de JavaScript" en la configuración de tu app de Facebook:
              </p>
              <code className="block text-center mt-2 text-xs text-indigo-600 dark:text-indigo-400 bg-slate-200 dark:bg-slate-700 p-2 rounded font-mono">
                  {isOpen && window.location.origin}
              </code>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-md hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  // Config state
  const [apiKey, setApiKey] = useState<string>('');
  const [facebookAppId, setFacebookAppId] = useState<string>('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // State for content generation
  const [topic, setTopic] = useState<string>('');
  const [tone, setTone] = useState<PostTone>(PostTone.FRIENDLY);
  const [cta, setCta] = useState<string>('');
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for image handling
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Facebook integration
  const [isFbSdkLoaded, setIsFbSdkLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  
  // State for publishing
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string|null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  // State for scheduling
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // State for theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (localStorage.getItem('theme')) return localStorage.getItem('theme') as 'light' | 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // Load configuration and scheduled posts from localStorage on initial render
  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    const savedFbAppId = localStorage.getItem('facebookAppId');
    if (savedApiKey && savedFbAppId) {
      setApiKey(savedApiKey);
      setFacebookAppId(savedFbAppId);
    } else {
      setIsConfigModalOpen(true);
    }

    const storedPosts = localStorage.getItem('scheduledPosts');
    if (storedPosts) {
      setScheduledPosts(JSON.parse(storedPosts));
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setScheduleDate(`${yyyy}-${mm}-${dd}`);
    setScheduleTime('10:00');
  }, []);

  // Save scheduled posts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  // Initialize Facebook SDK when facebookAppId is set
  useEffect(() => {
    if (!facebookAppId) {
      setIsFbSdkLoaded(false);
      setIsLoggedIn(false);
      setPages([]);
      setUserName('');
      return;
    }

    window.fbAsyncInit = function() {
      window.FB.init({ appId: facebookAppId, cookie: true, xfbml: true, version: 'v18.0' });
      setIsFbSdkLoaded(true);
      window.FB.getLoginStatus((response: any) => {
        if (response.status === 'connected') {
          setIsLoggedIn(true);
          fetchUserDataAndPages();
        } else {
          setIsLoggedIn(false);
        }
      });
    };
    
    const scriptId = 'facebook-jssdk';
    if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://connect.facebook.net/es_LA/sdk.js";
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    } else if (window.FB) {
        window.fbAsyncInit();
    }
  }, [facebookAppId]);

  const handleSaveConfig = (newApiKey: string, newFbAppId: string) => {
      setApiKey(newApiKey);
      localStorage.setItem('geminiApiKey', newApiKey);
      if (newFbAppId !== facebookAppId) {
        setFacebookAppId(newFbAppId);
        localStorage.setItem('facebookAppId', newFbAppId);
      }
      setIsConfigModalOpen(false);
      setError(null);
  };
  
  const fetchUserDataAndPages = () => {
    window.FB.api('/me', { fields: 'name' }, (response: any) => {
      if (response && !response.error) setUserName(response.name);
    });
    window.FB.api('/me/accounts', (response: any) => {
      if (response && response.data) setPages(response.data);
    });
  };
  
  const handleLogin = () => {
    window.FB.login((response: any) => {
      if (response.authResponse) {
        setIsLoggedIn(true);
        fetchUserDataAndPages();
      }
    }, { scope: 'public_profile,pages_show_list,pages_manage_posts' });
  };
  
  const handlePageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPageId(e.target.value);
  };
  
  const clearForm = useCallback(() => {
    setTopic('');
    setTone(PostTone.FRIENDLY);
    setCta('');
    setGeneratedPost('');
    setImageSource(null);
    setIsScheduling(false);
    setEditingPostId(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      setError('Por favor, configura tu API Key de Gemini en los ajustes.');
      setIsConfigModalOpen(true);
      return;
    }
    if (!topic.trim()) {
      setError('Por favor, introduce un tema para la publicación.');
      return;
    }
    setError(null);
    setPublishSuccess(false);
    setPublishError(null);
    setPublishMessage(null);
    setIsLoading(true);
    setGeneratedPost('');
    setImageSource(null);
    try {
      const content = await generatePostContent(topic, tone, cta, apiKey);
      setGeneratedPost(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, tone, cta, apiKey]);

  const handleGenerateImage = async () => {
    if (!apiKey) {
      setError('Por favor, configura tu API Key de Gemini en los ajustes.');
      setIsConfigModalOpen(true);
      return;
    }
    setIsGeneratingImage(true);
    setError(null);
    try {
      const imageUrl = await generatePostImage(topic || generatedPost, apiKey);
      setImageSource(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado al generar la imagen.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageSource(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const performPublish = async (post: Omit<ScheduledPost, 'id' | 'status'>, immediate: boolean) => {
      const { pageToken, content, imageSource, scheduledAt } = post;
      const unixTimestamp = !immediate ? Math.floor(new Date(scheduledAt).getTime() / 1000) : undefined;

      if (imageSource) {
          const imageBlob = await (await fetch(imageSource)).blob();
          const formData = new FormData();
          formData.append('access_token', pageToken);
          formData.append('message', content);
          if (unixTimestamp) {
              formData.append('published', 'false');
              formData.append('scheduled_publish_time', unixTimestamp.toString());
          }
          formData.append('source', imageBlob);

          const response = await fetch(`https://graph.facebook.com/v19.0/${post.pageId}/photos`, { method: 'POST', body: formData });
          return await response.json();
      } else {
          return new Promise((resolve) => {
              const apiParams: any = { message: content, access_token: pageToken };
              if (unixTimestamp) {
                  apiParams.published = false;
                  apiParams.scheduled_publish_time = unixTimestamp;
              }
              window.FB.api(`/${post.pageId}/feed`, 'POST', apiParams, (response: any) => resolve(response));
          });
      }
  };
  
  const handlePublishImmediate = async () => {
    const selectedPage = pages.find(p => p.id === selectedPageId);
    if (!selectedPage || !generatedPost) {
      setPublishError("Selecciona una página y genera contenido.");
      return;
    }
    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(false);

    const postData: Omit<ScheduledPost, 'id' | 'status' | 'scheduledAt'> = {
        topic, tone, cta, content: generatedPost, imageSource,
        pageId: selectedPage.id, pageName: selectedPage.name, pageToken: selectedPage.access_token,
    };
    
    // FIX: Removed `id` and `status` properties from the object literal to match the type expected by `performPublish`.
    // The original object had excess properties which caused a TypeScript error.
    const result = await performPublish({ ...postData, scheduledAt: '' }, true);
    
    if (result.id || result.post_id) {
        setPublishSuccess(true);
        setPublishMessage('¡Publicado en Facebook con éxito!');
        clearForm();
        setTimeout(() => {
          setPublishSuccess(false);
          setPublishMessage(null);
        }, 4000);
    } else {
        setPublishError(result.error?.message || "Error al publicar.");
    }
    setIsPublishing(false);
  };


  const handleScheduleOrUpdate = async () => {
    const selectedPage = pages.find(p => p.id === selectedPageId);
    if (!selectedPage || !generatedPost) {
        setPublishError("Selecciona una página y genera contenido.");
        return;
    }
    const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
    if (isScheduling && scheduleDateTime < tenMinutesFromNow) {
        setPublishError("La hora de programación debe ser al menos 10 minutos en el futuro.");
        return;
    }
    
    setPublishError(null);
    setPublishSuccess(false);

    const postData: Omit<ScheduledPost, 'id'> = {
        topic, tone, cta, content: generatedPost, imageSource,
        pageId: selectedPage.id, pageName: selectedPage.name, pageToken: selectedPage.access_token,
        scheduledAt: scheduleDateTime.toISOString(),
        status: PostStatus.SCHEDULED,
    };
    
    if (editingPostId) {
        setScheduledPosts(posts => posts.map(p => p.id === editingPostId ? { ...postData, id: editingPostId, status: p.status === PostStatus.PUBLISHED ? PostStatus.PUBLISHED : PostStatus.SCHEDULED } : p));
        setPublishMessage('¡Publicación actualizada con éxito!');
    } else {
        setScheduledPosts(posts => [...posts, { ...postData, id: Date.now().toString() }]);
        setPublishMessage('¡Publicación programada con éxito!');
    }
    
    setPublishSuccess(true);
    clearForm();
    setTimeout(() => {
        setPublishSuccess(false);
        setPublishMessage(null);
    }, 4000);
  };

  const handlePublishNow = async (postId: string) => {
      const post = scheduledPosts.find(p => p.id === postId);
      if (!post) return;
      setIsPublishing(true);
      const result = await performPublish(post, true);
      setIsPublishing(false);
      if (result.id || result.post_id) {
          setScheduledPosts(posts => posts.map(p => p.id === postId ? { ...p, status: PostStatus.PUBLISHED } : p));
      } else {
          setPublishError(result.error?.message || "Error al publicar.");
      }
  };

  const handleDeletePost = (id: string) => setScheduledPosts(posts => posts.filter(p => p.id !== id));
  const handleTogglePause = (id: string) => {
      setScheduledPosts(posts => posts.map(p => {
          if (p.id === id && p.status !== PostStatus.PUBLISHED) {
              return { ...p, status: p.status === PostStatus.SCHEDULED ? PostStatus.PAUSED : PostStatus.SCHEDULED };
          }
          return p;
      }));
  };
  const handleStartEdit = (post: ScheduledPost) => {
      setEditingPostId(post.id);
      setTopic(post.topic);
      setTone(post.tone);
      setCta(post.cta);
      setGeneratedPost(post.content);
      setImageSource(post.imageSource);
      setSelectedPageId(post.pageId);
      setIsScheduling(true);
      const scheduleDate = new Date(post.scheduledAt);
      setScheduleDate(scheduleDate.toISOString().split('T')[0]);
      setScheduleTime(scheduleDate.toTimeString().substring(0, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // "Cron job" effect
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      scheduledPosts.forEach(async post => {
        if (post.status === PostStatus.SCHEDULED && new Date(post.scheduledAt) <= now) {
          const result = await performPublish(post, true);
          if(result.id || result.post_id) {
            setScheduledPosts(posts => posts.map(p => p.id === post.id ? { ...p, status: PostStatus.PUBLISHED } : p));
          } else {
            console.error("Auto-publish failed for post:", post.id, result.error);
          }
        }
      });
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [scheduledPosts]);

  const tones = Object.values(PostTone);
  const canPublish = !!generatedPost && !!selectedPageId && !isLoading;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveConfig}
        initialApiKey={apiKey}
        initialFbAppId={facebookAppId}
      />
      <header className="bg-white/80 dark:bg-slate-900/70 dark:border-b dark:border-slate-800 shadow-sm backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg"><SparklesIcon className="w-6 h-6 text-white" /></div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Post Genius</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={() => setIsConfigModalOpen(true)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none" aria-label="Settings">
                  <AdjustmentsHorizontalIcon className="w-6 h-6" />
                </button>
                <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none" aria-label="Toggle theme">
                    {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                </button>
                <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hidden sm:block">Powered by Gemini</a>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg flex flex-col gap-8">
            <div id="form-section">
              <h2 className="text-lg sm:text-xl font-semibold mb-1 text-slate-900 dark:text-white">{editingPostId ? 'Editando Publicación' : 'Paso 1: Crea tu publicación'}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{editingPostId ? 'Modifica los detalles y guarda los cambios.' : 'Describe tu idea y la IA creará una publicación para ti.'}</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ej: Lanzamiento de nuestra nueva colección..." className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:ring-indigo-500 bg-white dark:bg-gray-800 text-slate-900 dark:text-white" rows={4} disabled={isLoading}/>
                <select id="tone" value={tone} onChange={(e) => setTone(e.target.value as PostTone)} className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-gray-800" disabled={isLoading}>{tones.map((t) => (<option key={t} value={t}>{t}</option>))}</select>
                <input id="cta" type="text" value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Llamada a la acción (Opcional)" className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-gray-800" disabled={isLoading}/>
                <button type="submit" disabled={isLoading || isGeneratingImage || !!editingPostId} className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">{isLoading ? 'Generando...' : 'Generar/Regenerar Texto'}</button>
              </form>
            </div>

            {generatedPost && !isLoading && (
              <div id="image-section" className="border-t border-slate-200 dark:border-slate-800 pt-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={handleGenerateImage} disabled={isGeneratingImage || isPublishing} className="w-full flex justify-center items-center gap-2 bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-purple-300">
                      {isGeneratingImage ? 'Creando...' : 'Generar imagen con IA' }
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isGeneratingImage || isPublishing} className="w-full flex justify-center items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
                      <PhotoIcon className="w-5 h-5" /> Subir imagen
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 </div>
                 {imageSource && (<div className="mt-4 text-center"><button onClick={() => setImageSource(null)} className="text-sm text-red-500">Quitar imagen</button></div>)}
              </div>
            )}
            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

            <div id="facebook-section" className="border-t border-slate-200 dark:border-slate-800 pt-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-1 text-slate-900 dark:text-white">{editingPostId ? 'Guardar Cambios' : 'Paso 2: Conecta y Publica'}</h2>
                {!facebookAppId ? (
                   <div className="p-4 border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/20"><p className="text-sm"><strong>Acción requerida:</strong> <button onClick={() => setIsConfigModalOpen(true)} className="font-bold underline hover:text-amber-800 dark:hover:text-amber-200">Configura tu ID de Aplicación de Facebook</button> para continuar.</p></div>
                ) : (
                  <>
                    {!isFbSdkLoaded && <div className="text-center text-sm text-slate-500">Cargando conexión con Facebook...</div>}
                    {isFbSdkLoaded && !isLoggedIn && (
                      <>
                        <button onClick={handleLogin} className="w-full flex justify-center items-center gap-3 bg-blue-600 text-white font-bold py-3 px-4 rounded-md"><FacebookIcon />Conectar</button>
                        <div className="mt-4 p-3 text-xs text-center rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                            <strong>¿Problemas para conectar?</strong> Asegúrate que 
                            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 p-1 rounded mx-1">{window.location.origin}</code> 
                            está en los "Dominios de host del SDK de JavaScript" en la configuración de tu App de Facebook.
                        </div>
                      </>
                    )}
                    {isLoggedIn && (
                        <div className="space-y-4">
                            <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">Conectado como <strong>{userName}</strong>.</p>
                            {pages.length > 0 ? (
                                <div>
                                    <select id="page-select" value={selectedPageId} onChange={handlePageSelect} className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-gray-800">
                                        <option value="">-- Mis Fanpages --</option>
                                        {pages.map(page => (<option key={page.id} value={page.id}>{page.name}</option>))}
                                    </select>
                                    <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4">
                                        <div className="relative flex items-start">
                                            <div className="flex items-center h-5"><input id="scheduling-checkbox" type="checkbox" checked={isScheduling} onChange={(e) => setIsScheduling(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600" disabled={!!editingPostId} /></div>
                                            <div className="ml-3 text-sm"><label htmlFor="scheduling-checkbox" className="font-medium text-gray-900 dark:text-slate-100">Programar para más tarde</label></div>
                                        </div>
                                        {isScheduling && (
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-gray-800 [color-scheme:dark]"/>
                                                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-gray-800 [color-scheme:dark]"/>
                                            </div>
                                        )}
                                    </div>
                                    {editingPostId && (<button onClick={clearForm} className="w-full mt-4 text-center text-sm text-red-500">Cancelar Edición</button>)}
                                </div>
                            ) : (<p className="text-sm text-amber-700">No se encontraron Fanpages.</p>)}
                        </div>
                    )}
                  </>
                )}
            </div>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-slate-900 dark:text-white">Vista Previa</h2>
            <PostPreview 
              content={generatedPost || 'El contenido generado por la IA aparecerá aquí...'}
              onPublish={editingPostId ? handleScheduleOrUpdate : (isScheduling ? handleScheduleOrUpdate : handlePublishImmediate)}
              isPublishing={isPublishing}
              publishError={publishError}
              publishSuccess={publishSuccess}
              publishMessage={publishMessage}
              canPublish={canPublish}
              isScheduling={isScheduling || !!editingPostId}
              imageSource={imageSource}
            />
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2">
            <ScheduledPostList
                posts={scheduledPosts}
                onDelete={handleDeletePost}
                onTogglePause={handleTogglePause}
                onEdit={handleStartEdit}
                onPublishNow={handlePublishNow}
            />
        </div>
      </main>
    </div>
  );
};

export default App;