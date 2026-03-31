'use client';

import React, { useState, useEffect } from 'react';
import { Comment } from '@/lib/types';
import { fetchCommentsByIds, timeAgo } from '@/lib/api';
import styles from './CommentThread.module.css';

interface CommentThreadProps {
  storyId: number;
  commentIds: number[];
  initialCount?: number;
}

function parseCommentHTML(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/<pre><code>/g, '<pre><code>')
    .replace(/<\/code><\/pre>/g, '</code></pre>')
    .replace(/<a href="([^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
}

function renderCommentContent(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = parseCommentHTML(text);
  
  while (remaining.length > 0) {
    const codeMatch = remaining.match(/<pre><code>[\s\S]*?<\/code><\/pre>/);
    const linkMatch = remaining.match(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/);
    
    if (codeMatch) {
      const idx = remaining.indexOf(codeMatch[0]);
      if (idx > 0) {
        const textContent = remaining.slice(0, idx);
        parts.push(createTextNode(textContent));
      }
      parts.push(<pre key={parts.length}><code dangerouslySetInnerHTML={{ __html: codeMatch[0].replace(/<\/?pre><code>/g, '') }} /></pre>);
      remaining = remaining.slice(idx + codeMatch[0].length);
    } else if (linkMatch) {
      const idx = remaining.indexOf(linkMatch[0]);
      if (idx > 0) {
        const textContent = remaining.slice(0, idx);
        parts.push(createTextNode(textContent));
      }
      parts.push(<a key={parts.length} href={linkMatch[1]} target="_blank" rel="noopener noreferrer">{linkMatch[2]}</a>);
      remaining = remaining.slice(idx + linkMatch[0].length);
    } else {
      parts.push(createTextNode(remaining));
      break;
    }
  }
  
  return parts;
}

function createTextNode(text: string): string {
  return text;
}

interface SingleCommentProps {
  comment: Comment;
  isTop?: boolean;
  depth?: number;
}

function SingleComment({ comment, isTop, depth = 0 }: SingleCommentProps) {
  const [showReplies, setShowReplies] = useState(depth < 2);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  useEffect(() => {
    if (showReplies && comment.kids && comment.kids.length > 0 && replies.length === 0) {
      setLoadingReplies(true);
      fetchCommentsByIds(comment.kids.slice(0, 5), comment.parentStory)
        .then(setReplies)
        .finally(() => setLoadingReplies(false));
    }
  }, [showReplies, comment.kids, comment.parentStory, replies.length]);

  return (
    <div className={`${styles.comment} ${isTop ? styles.top : ''}`}>
      <div className={styles.commentMeta}>
        <span className={styles.author}>{comment.by}</span>
        <span>{timeAgo(comment.time)}</span>
        {comment.score !== undefined && (
          <span className={styles.score}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {comment.score}
          </span>
        )}
      </div>
      
      <div className={styles.commentContent}>
        {renderCommentContent(comment.text)}
      </div>

      {comment.kids && comment.kids.length > 0 && (
        <>
          {!showReplies ? (
            <button 
              className={styles.toggleReplies}
              onClick={() => setShowReplies(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6" />
              </svg>
              {comment.kids.length} {comment.kids.length === 1 ? 'reply' : 'replies'}
            </button>
          ) : (
            <div className={styles.replies}>
              {loadingReplies ? (
                <div className={styles.comment}>
                  <div className={styles.loadingLine} />
                  <div className={styles.loadingLine} />
                </div>
              ) : (
                replies.map((reply) => (
                  <SingleComment 
                    key={reply.id} 
                    comment={reply} 
                    depth={depth + 1}
                  />
                ))
              )}
              {comment.kids.length > 5 && (
                <button className={styles.toggleReplies}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                  View {comment.kids.length - 5} more {comment.kids.length - 5 === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CommentThread({ storyId, commentIds, initialCount }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCount, setShowCount] = useState(10);

  useEffect(() => {
    setLoading(true);
    fetchCommentsByIds(commentIds, storyId)
      .then((fetchedComments) => {
        const sorted = [...fetchedComments].sort((a, b) => (b.score || 0) - (a.score || 0));
        setComments(sorted);
      })
      .finally(() => setLoading(false));
  }, [storyId, commentIds]);

  const visibleComments = comments.slice(0, showCount);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Top Comments
          <span className={styles.count}>
            ({comments.length || initialCount || 0})
          </span>
        </h3>
      </div>

      {loading ? (
        <div className={styles.loading}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.loadingComment}>
              <div className={styles.loadingLine} style={{ width: '30%' }} />
              <div className={styles.loadingLine} />
              <div className={styles.loadingLine} style={{ width: '70%' }} />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className={styles.empty}>
          <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>No comments yet. Be the first to discuss!</p>
        </div>
      ) : (
        <div className={styles.commentList}>
          {visibleComments.map((comment, index) => (
            <SingleComment 
              key={comment.id} 
              comment={comment}
              isTop={index < 3}
            />
          ))}
          
          {comments.length > showCount && (
            <button 
              className={styles.loadMore}
              onClick={() => setShowCount((c) => c + 10)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
              </svg>
              Load more comments ({comments.length - showCount} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
