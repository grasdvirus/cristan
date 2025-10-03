"use client";

import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type Comment = {
  id: number;
  author: string;
  text: string;
};

export default function VideoInteraction() {
  const [likes, setLikes] = useState(42);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, author: 'Alex', text: 'Super vidéo, merci pour le partage !' },
    { id: 2, author: 'Marie', text: 'Très instructif.' },
  ]);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([
        ...comments,
        { id: Date.now(), author: 'Vous', text: newComment.trim() },
      ]);
      setNewComment('');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-6 mb-6">
        <Button
          onClick={handleLike}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Heart className={cn('w-5 h-5', isLiked ? 'fill-red-500 text-red-500' : '')} />
          <span>{likes}</span>
        </Button>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length} Commentaires</span>
        </div>
      </div>

      <Separator className="my-4" />
      
      <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{comment.author}</p>
              <p className="text-sm text-muted-foreground">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleCommentSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Ajouter un commentaire..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="bg-background neumorphic-card-inset-light dark:neumorphic-card-inset-dark focus-visible:ring-offset-0 focus-visible:ring-1"
        />
        <Button type="submit" className="btn-neumorphic-light dark:btn-neumorphic-dark">
          Envoyer
        </Button>
      </form>
    </div>
  );
}
