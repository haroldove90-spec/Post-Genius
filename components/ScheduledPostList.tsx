import React from 'react';
import { ScheduledPost } from '../types';
import { ScheduledPostItem } from './ScheduledPostItem';

interface ScheduledPostListProps {
  posts: ScheduledPost[];
  onDelete: (id: string) => void;
  onTogglePause: (id: string) => void;
  onEdit: (post: ScheduledPost) => void;
  onPublishNow: (id: string) => void;
}

export const ScheduledPostList: React.FC<ScheduledPostListProps> = ({
  posts,
  onDelete,
  onTogglePause,
  onEdit,
  onPublishNow,
}) => {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Publicaciones Programadas</h2>
      {posts.length === 0 ? (
        <div className="text-center py-12 px-6 bg-white dark:bg-slate-900 rounded-lg shadow-md">
          <p className="text-slate-500 dark:text-slate-400">No tienes publicaciones programadas. ¡Crea una para empezar!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <ScheduledPostItem
              key={post.id}
              post={post}
              onDelete={onDelete}
              onTogglePause={onTogglePause}
              onEdit={onEdit}
              onPublishNow={onPublishNow}
            />
          ))}
        </div>
      )}
    </div>
  );
};
