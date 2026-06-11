"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { Codicon } from "@/shared/ui";

interface ChatMessage {
  type: "system" | "user" | "other";
  message?: string;
  content?: string;
  formattedLog?: string;
  senderId?: string;
  nickname?: string;
  createdAt?: string;
}

export function AgentPanel() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [token, setToken] = useState("");
  const [ticker, setTicker] = useState("005930.KS");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [joined, setJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const connectSocket = () => {
    if (!token.trim()) return alert("토큰을 입력해주세요.");
    if (!ticker.trim()) return alert("종목 코드를 입력해주세요.");

    const backendEndpoint =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:3000";

    const newSocket = io(backendEndpoint, {
      auth: {
        token,
      },
    });

    newSocket.on("connect", () => {
      console.log("Chat Socket Connected");
      newSocket.emit("join_room", { ticker });
    });

    newSocket.on("joined_room", (data) => {
      setJoined(true);
      setMessages((prev) => [
        ...prev,
        { type: "system", message: data.message },
      ]);
    });

    newSocket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, { ...data, type: "other" }]);
    });

    newSocket.on("chat_error", (data) => {
      alert(`에러: ${data.message}`);
    });

    newSocket.on("disconnect", () => {
      console.log("Chat Socket Disconnected");
      setJoined(false);
    });

    setSocket(newSocket);
  };

  const sendMessage = () => {
    if (!socket || !inputMessage.trim()) return;

    socket.emit("send_message", { ticker, message: inputMessage });
    setInputMessage("");
  };

  const handleDisconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setJoined(false);
    setMessages([]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-vscode-sidebar text-vscode-fg-sidebar px-4 py-3 min-w-0">
      {!joined ? (
        <div className="flex flex-col gap-3">
          <p className="text-[12px] text-vscode-fg-desc mb-2 leading-relaxed">
            토큰과 종목코드를 입력하여 실시간 채팅방에 참여합니다.
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold tracking-wide text-vscode-fg-desc uppercase">
              Access Token
            </label>
            <input
              type="text"
              className="bg-vscode-input text-vscode-fg-input p-1.5 border border-vscode-border-input text-[13px] outline-none focus:border-vscode-focus focus:outline-1 focus:-outline-offset-1 focus:outline-vscode-focus"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Bearer Token"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold tracking-wide text-vscode-fg-desc uppercase">
              Ticker
            </label>
            <input
              type="text"
              className="bg-vscode-input text-vscode-fg-input p-1.5 border border-vscode-border-input text-[13px] outline-none focus:border-vscode-focus focus:outline-1 focus:-outline-offset-1 focus:outline-vscode-focus"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="005930.KS"
            />
          </div>
          <button
            type="button"
            className="mt-2 bg-(--vscode-button-background) text-(--vscode-button-foreground) hover:bg-(--vscode-button-hoverBackground) py-1.5 px-3 rounded-[2px] text-[13px] transition-colors"
            onClick={connectSocket}
          >
            Connect & Join
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between shrink-0 mb-3 pb-2 border-b border-vscode-border-sidebar">
            <span className="text-[13px] font-bold text-vscode-fg-sidebar">
              #{ticker}
            </span>
            <button
              type="button"
              onClick={handleDisconnect}
              className="text-vscode-fg-icon hover:text-vscode-fg-sidebar text-[12px] flex items-center gap-1 cursor-pointer"
              aria-label="Disconnect"
            >
              <Codicon icon="codicon-debug-disconnect" size={14} />
              <span>Leave</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-3 pr-1 scrollbar-custom">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-[4px] text-[13px] leading-relaxed wrap-break-word ${
                  m.type === "system"
                    ? "bg-vscode-list-hover text-vscode-fg-desc text-center text-[12px] italic py-1.5"
                    : "bg-vscode-editor text-vscode-fg border border-vscode-border-sidebar"
                }`}
              >
                {m.type !== "system" && (
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-[#569cd6]">
                      {m.nickname || m.senderId || "Unknown"}
                    </span>
                    {m.createdAt && (
                      <span className="text-[10px] text-vscode-fg-desc">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                )}
                <div>{m.message || m.content || m.formattedLog}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-end gap-2 shrink-0">
            <textarea
              className="flex-1 bg-vscode-input text-vscode-fg-input p-2 border border-vscode-border-input text-[13px] outline-none focus:border-vscode-focus focus:outline-1 focus:-outline-offset-1 focus:outline-vscode-focus resize-none rounded-[2px] min-h-[36px] max-h-[120px]"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message..."
              rows={1}
            />
            <button
              type="button"
              className="bg-(--vscode-button-background) text-(--vscode-button-foreground) hover:bg-(--vscode-button-hoverBackground) h-[36px] px-3 flex items-center justify-center rounded-[2px] shrink-0"
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              aria-label="Send Message"
            >
              <Codicon icon="codicon-send" size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
