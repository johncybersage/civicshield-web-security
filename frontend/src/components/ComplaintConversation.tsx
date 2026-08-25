import React, { useState, useEffect, useRef } from 'react';
import { Send, UserCircle, Shield, Loader2, Clock, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

interface Comment {
  id: number;
  content: string;
  user_id: number;
  created_at: string;
}

interface ComplaintConversationProps {
  complaintId: number;
  citizenId: number;
  comments: Comment[];
  status: string;
}

const ComplaintConversation: React.FC<ComplaintConversationProps> = ({ complaintId, citizenId, comments: initialComments, status }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await api.post(`/complaints/${complaintId}/comments`, {
        content: newMessage.trim()
      });
      setComments(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCitizen = user?.role === 'CITIZEN';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center shrink-0">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          Conversation & Updates
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-900/20 custom-scrollbar">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 space-y-2">
            <MessageSquare className="w-12 h-12 opacity-50 mb-2" />
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs text-center max-w-xs">Use this space to request additional information or provide progress updates.</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isMyMessage = comment.user_id === user?.id;
            const isFromCitizen = comment.user_id === citizenId;

            return (
              <div 
                key={comment.id} 
                className={`flex gap-4 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="shrink-0">
                  {isFromCitizen ? (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 shadow-sm">
                      <UserCircle className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 shadow-sm">
                      <Shield className="w-5 h-5" />
                    </div>
                  )}
                </div>
                
                <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isMyMessage ? 'You' : (isFromCitizen ? 'Citizen' : 'Officer')}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div 
                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isMyMessage 
                        ? 'bg-primary-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                    }`}
                  >
                    {comment.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={status === 'RESOLVED' ? "Complaint is resolved." : "Type a message..."}
            disabled={status === 'RESOLVED' || isSubmitting}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow dark:text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || status === 'RESOLVED' || isSubmitting}
            className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center w-11 h-11 shrink-0"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintConversation;
