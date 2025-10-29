import React from 'react';
import { ScheduledPost, PostStatus } from '../types';
import { PencilIcon, PauseIcon, PlayIcon, TrashIcon, FacebookIcon } from './icons';

interface ScheduledPostItemProps {
  post: ScheduledPost;
  onDelete: (id: string) => void;
  onTogglePause: (id: string) => void;
  onEdit: (post: ScheduledPost) => void;
  onPublishNow: (id: string) => void;
}

const statusStyles = {
  [PostStatus.SCHEDULED]: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    text: 'Programado',
  },
  [PostStatus.PAUSED]: {
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    text: 'Pausado',
  },
  [PostStatus.PUBLISHED]: {
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    text: 'Publicado',
  },
};

export const ScheduledPostItem: React.FC<ScheduledPostItemProps> = ({ 
    post, 
    onDelete, 
    onTogglePause,
    onEdit,
    onPublishNow
}) => {
  const { badge, text } = statusStyles[post.status];
  const scheduledDate = new Date(post.scheduledAt);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-5 flex flex-col md:flex-row gap-5 transition-all hover:shadow-xl">
      {/* Content Preview */}
      <div className="flex-1">
        {post.imageSource && (
          <img src={post.imageSource} alt="Vista previa" className="w-full h-40 object-cover rounded-md mb-3" />
        )}
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Details & Actions */}
      <div className="md:w-64 flex flex-col justify-between gap-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{post.pageName}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge}`}>
              {text}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {scheduledDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {scheduledDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
           <button onClick={() => onPublishNow(post.id)} title="Publicar Ahora" disabled={post.status === PostStatus.PUBLISHED} className="flex items-center justify-center gap-2 p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors">
            <FacebookIcon className="w-4 h-4" />
            <span className="text-xs font-semibold">Ahora</span>
          </button>
          <button onClick={() => onTogglePause(post.id)} title={post.status === PostStatus.PAUSED ? 'Reanudar' : 'Pausar'} disabled={post.status === PostStatus.PUBLISHED} className="flex items-center justify-center gap-2 p-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors">
            {post.status === PostStatus.PAUSED ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
            <span className="text-xs font-semibold">{post.status === PostStatus.PAUSED ? 'Reanudar' : 'Pausar'}</span>
          </button>
          <button onClick={() => onEdit(post)} title="Editar" disabled={post.status === PostStatus.PUBLISHED} className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors">
            <PencilIcon className="w-4 h-4" />
             <span className="text-xs font-semibold">Editar</span>
          </button>
          <button onClick={() => onDelete(post.id)} title="Eliminar" className="flex items-center justify-center gap-2 p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors">
            <TrashIcon className="w-4 h-4" />
             <span className="text-xs font-semibold">Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
