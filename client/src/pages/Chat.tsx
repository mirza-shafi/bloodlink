import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { chatApi } from '@/services/api';
import type { Chat as ChatType, Message } from '@/types';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, ChevronLeft, Circle } from 'lucide-react';

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadChats();
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    const res = await chatApi.getUserChats();
    if (res.success) setChats(res.data);
  };

  const loadMessages = async (chat: ChatType) => {
    setActiveChat(chat);
    const res = await chatApi.getChatMessages(chat.id);
    if (res.success) {
      setMessages(res.data);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    const res = await chatApi.sendMessage(activeChat.id, user?.id || 101, newMessage.trim());
    if (res.success) {
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isAuthenticated) return null;

  const getOtherParticipant = (chat: ChatType) => {
    return chat.participant1Id === (user?.id || 101)
      ? { name: chat.participant2Name, photo: chat.participant2Photo }
      : { name: chat.participant1Name, photo: chat.participant1Photo };
  };

  return (
    <Layout showFooter={false}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="grid lg:grid-cols-3 gap-0 h-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-white">
          {/* Chat List */}
          <div className={`lg:col-span-1 border-r border-gray-200 dark:border-zinc-800 ${activeChat ? 'hidden lg:block' : ''}`}>
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-[#1A1A1A] dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#D62828]" />
                Messages
              </h2>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
              {chats.length > 0 ? chats.map(chat => {
                const other = getOtherParticipant(chat);
                return (
                  <button
                    key={chat.id}
                    className={`w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors border-b border-gray-100 dark:border-zinc-800/60 ${
                      activeChat?.id === chat.id ? 'bg-red-50 dark:bg-red-950/20 border-l-2 border-l-[#D62828]' : ''
                    }`}
                    onClick={() => loadMessages(chat)}
                  >
                    <div className="relative">
                      <img src={other.photo || '/avatar-male.jpg'} alt={other.name}
                        className="w-12 h-12 rounded-full object-cover border border-zinc-100 dark:border-zinc-800" />
                      <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-[#1A1A1A] dark:text-white text-sm truncate">{other.name}</p>
                        {chat.lastMessageAt && (
                          <span className="text-xs text-[#555555] dark:text-zinc-400">
                            {new Date(chat.lastMessageAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#555555] dark:text-zinc-400 truncate">{chat.lastMessage || 'No messages yet'}</p>
                    </div>
                    {chat.unread && (
                      <Badge className="bg-[#D62828] text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center border-0">
                        !
                      </Badge>
                    )}
                  </button>
                );
              }) : (
                <div className="p-8 text-center text-[#555555] dark:text-zinc-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-zinc-700" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Start chatting with donors</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className={`lg:col-span-2 flex flex-col ${!activeChat ? 'hidden lg:flex' : ''}`}>
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3">
                  <button className="lg:hidden p-1 text-gray-500 dark:text-gray-400" onClick={() => setActiveChat(null)}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <img src={getOtherParticipant(activeChat).photo || '/avatar-male.jpg'}
                    alt={getOtherParticipant(activeChat).name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" />
                  <div>
                    <p className="font-medium text-[#1A1A1A] dark:text-white">{getOtherParticipant(activeChat).name}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Circle className="w-2 h-2 fill-green-500" />Online
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9F9F9] dark:bg-zinc-900/60">
                  {messages.map(msg => (
                    <div key={msg.id}
                      className={`flex ${msg.senderId === (user?.id || 101) ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 ${
                        msg.senderId === (user?.id || 101)
                          ? 'bg-[#D62828] text-white'
                          : 'bg-white dark:bg-zinc-800 text-[#1A1A1A] dark:text-white border border-zinc-200 dark:border-zinc-800'
                      }`}>
                        <p className="text-sm font-light leading-relaxed">{msg.content}</p>
                        <p className={`text-[10px] mt-1.5 flex items-center justify-between gap-2 ${
                          msg.senderId === (user?.id || 101) ? 'text-red-200' : 'text-[#555555] dark:text-zinc-400'
                        }`}>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.senderId === (user?.id || 101) && (
                            <span className="font-semibold">{msg.isRead ? 'Seen' : 'Sent'}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 rounded-none bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-gray-900 dark:text-white"
                    />
                    <Button onClick={sendMessage}
                      className="bg-[#D62828] hover:bg-[#9D0208] text-white rounded-none px-6 border-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#555555] dark:text-zinc-400">
                <MessageSquare className="w-16 h-16 mb-4 text-gray-200 dark:text-zinc-800" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a chat from the sidebar to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
