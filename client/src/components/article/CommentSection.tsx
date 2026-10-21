'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, ChevronDown, ChevronRight } from 'lucide-react';
import { Comment, User, getAvatarUrl, formatRelativeDate } from '@/types';

export function CommentItem({ comment }: { comment: Comment }) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="flex gap-3">
      <Link href={`/user/${comment.author.username}`} className="shrink-0">
        <img
          src={getAvatarUrl(comment.author)}
          alt={comment.author.name}
          className="h-9 w-9 rounded-full object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Link
              href={`/user/${comment.author.username}`}
              className="text-xs font-bold text-slate-900 hover:text-slate-600"
            >
              {comment.author.name}
            </Link>

            <span className="text-[10px] text-slate-400">
              {formatRelativeDate(comment.createdAt)}
            </span>
          </div>

          <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-6 text-slate-600">
            {comment.content}
          </p>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-2 mt-2 border-l-2 border-slate-100 pl-3">
            <button
              type="button"
              onClick={() => setShowReplies((prev) => !prev)}
              className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900"
            >
              {showReplies ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              {comment.replies.length} deebii
            </button>

            {showReplies && (
              <div className="space-y-2">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-2.5">
                    <img
                      src={getAvatarUrl(reply.author)}
                      alt={reply.author.name}
                      className="h-7 w-7 shrink-0 rounded-full object-cover"
                    />

                    <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-900">
                          {reply.author.name}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {formatRelativeDate(reply.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export interface CommentSectionProps {
  comments: Comment[];
  user: User | null;
  commentText: string;
  setCommentText: (text: string) => void;
  isSubmittingComment: boolean;
  onComment: (e: React.FormEvent) => void;
}

export function CommentSection({
  comments,
  user,
  commentText,
  setCommentText,
  isSubmittingComment,
  onComment,
}: CommentSectionProps) {
  return (
    <section
      id="yaadawwan"
      className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:mt-5 sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
            Yaadawwan
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            {comments.length} yaada
          </p>
        </div>

        <MessageCircle className="h-5 w-5 text-slate-300" />
      </div>

      {/* Comment form */}
      {user ? (
        <form onSubmit={onComment} className="mt-5">
          <div className="flex items-start gap-3">
            <img
              src={getAvatarUrl(user)}
              alt={user.name}
              className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-10 sm:w-10"
            />

            <div className="min-w-0 flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Maal yaadda?"
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />

              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmittingComment ? 'Ergaa jira...' : 'Yaada ergi'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs text-slate-600">
            Yaada kennuuf duraan durse{' '}
            <Link
              href="/login"
              className="font-bold text-slate-900 underline underline-offset-2"
            >
              seenaa
            </Link>
            .
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">
            Yaadni hin jiru. Yaada kennuun kan jalqabaa ta&apos;aa!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </section>
  );
}

export default CommentSection;