import React, { useState } from 'react';
import style from './chat.module.css';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className={style.inputContainer}>
      <form className={style.inputWrapper} onSubmit={handleSubmit}>
        <input
          type="text"
          className={style.input}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className={style.sendButton}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
