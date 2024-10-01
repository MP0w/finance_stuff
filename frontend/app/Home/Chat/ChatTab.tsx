import React, { useState, useRef, useEffect } from "react";
import { useAIChat } from "../../websocketClient";
import TextareaAutosize from "react-textarea-autosize";
import DeleteIcon from "../../components/DeleteIcon";
import Loading from "@/app/components/Loading";
import { useTranslation } from "react-i18next";

interface ChatMessageProps {
  message: {
    role: string;
    content: string;
  };
  small?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, small }) => {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`${
          small === true ? "max-w-[90%]" : "max-w-[70%]"
        } px-4 py-2 pixel-corners ${
          message.role === "user"
            ? "bg-blue-400 text-white border"
            : message.role === "assistant"
            ? "bg-gray-200 border"
            : "bg-red-600 text-white border"
        }`}
      >
        {message.content.length === 0 && (
          <span className="flex items-center space-x-1 py-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></span>
            <span
              className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></span>
          </span>
        )}
        {message.content.length > 0 && (
          <div>
            {message.content.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatTab: React.FC = () => {
  const { messages, sendMessage, isConnecting, liveMessage, clear } =
    useAIChat();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      if (sendMessage(newMessage)) {
        setNewMessage("");
      }
    }
  };

  const allMessages = messages.concat(liveMessage ? [liveMessage] : []);

  return (
    <div className="">
      <div className="flex flex-col max-w-3xl mx-auto">
        <div className="overflow-y-auto pb-16">
          <div className="space-y-4">
            {allMessages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            <div className="flex justify-end">
              <button className="flex items-center space-x-2" onClick={clear}>
                <div>{t("chatTab.clearChat")}</div>
                <DeleteIcon />
              </button>
            </div>
            <div className="pb-8" ref={messagesEndRef} />
            {isConnecting && <Loading />}
          </div>
        </div>
        <div className="p-4 bg-gray-100 rounded-t-lg border border-gray-200 shadow-lg fixed bottom-0 left-0 right-0 max-w-3xl mx-auto">
          <div className="flex space-x-2">
            <TextareaAutosize
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t("chatTab.reply")}
              className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
              minRows={1}
              maxRows={5}
            />
            <button
              onClick={handleSendMessage}
              disabled={isConnecting}
              className="px-8 py-2 bg-blue-500 text-white pixel-corners-small hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {t("chatTab.send")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
