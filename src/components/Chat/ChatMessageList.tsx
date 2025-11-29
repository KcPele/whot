import React, { useEffect, useRef } from 'react';
import style from './chat.module.css';
import { ChatMessage } from '../../types/game';

interface ChatMessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={style.chatContainer}>
      <div className={style.messageList}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${style.message} ${
              msg.senderId === currentUserId ? style.myMessage : style.opponentMessage
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessageList;
