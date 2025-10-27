import React, { useState } from 'react';

const Chat: React.FC = () => {
    const [messages, setMessages] = useState([
        { id: 1, user: 'SolPlay Bot', text: 'Welcome to the chat! This is a placeholder component.' },
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages([...messages, { id: Date.now(), user: 'You', text: input }]);
            setInput('');
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-brand-gray rounded-lg shadow-lg flex flex-col z-50">
            <header className="bg-brand-dark p-3 rounded-t-lg text-center font-bold text-white border-b border-gray-700">
                Game Chat
            </header>
            <div className="flex-grow p-2 overflow-y-auto">
                {messages.map(msg => (
                    <div key={msg.id} className="mb-2">
                        <span className={`font-bold ${msg.user === 'You' ? 'text-blue-light' : 'text-pink-light'}`}>{msg.user}:</span>
                        <span className="text-gray-300 ml-2">{msg.text}</span>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSend} className="p-2 border-t border-gray-700">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-brand-dark text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue"
                />
            </form>
        </div>
    );
};

export default Chat;
