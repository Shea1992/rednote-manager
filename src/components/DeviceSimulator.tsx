import React, { useState, useEffect, useRef } from "react";
import { Device, Command, CommentMessage } from "../types";
import { 
  Smartphone, Wifi, Battery, ChevronLeft, Send, MessageSquare, 
  Heart, Bookmark, Bell, Compass, PlusSquare, User, Eye, Terminal, Play, AlertCircle 
} from "lucide-react";
import { customFetch as fetch } from "../mockApi";

interface DeviceSimulatorProps {
  activeDevice: Device | null;
  onRefreshDevices: () => void;
  addSystemLog: (text: string) => void;
  onCommentReported: () => void;
}

interface MockPost {
  id: string;
  title: string;
  cover: string;
  likes: number;
  bookmarks: number;
  commentsCount: number;
}

const MOCK_POSTS_BY_DEVICE: Record<string, MockPost[]> = {
  phone_01: [
    {
      id: "post_makeup_01",
      title: "干皮真爱粉底液推荐！持妆一整天不卡粉",
      cover: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300",
      likes: 1208,
      bookmarks: 843,
      commentsCount: 24,
    },
    {
      id: "post_makeup_02",
      title: "新手5分钟日常淡妆保姆级教程，建议收藏 💄",
      cover: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300",
      likes: 3429,
      bookmarks: 2901,
      commentsCount: 89,
    }
  ],
  phone_02: [
    {
      id: "post_food_01",
      title: "排队3小时也要吃的正宗川味火锅！辣到过瘾 🍲",
      cover: "https://images.unsplash.com/photo-1554679665-f5537f187268?w=300",
      likes: 852,
      bookmarks: 432,
      commentsCount: 12,
    },
    {
      id: "post_food_02",
      title: "复古工业风咖啡馆，周末拍照打卡圣地 ☕️",
      cover: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300",
      likes: 1540,
      bookmarks: 1109,
      commentsCount: 45,
    }
  ],
  phone_03: [
    {
      id: "post_digital_01",
      title: "测评最新折叠屏手机，到底是不是智商税？📱",
      cover: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
      likes: 421,
      bookmarks: 120,
      commentsCount: 8,
    }
  ]
};

const SUGGESTED_COMMENTS = [
  { text: "博主博主，这个色号适合黄一白肤色吗？", category: "色号" },
  { text: "地址在哪里呀？人均消费大约多少钱？", category: "地址" },
  { text: "大干皮冬天用会起皮卡粉吗？求真实反馈", category: "产品" },
  { text: "博主接商单吗？期待商务合作！", category: "合作" }
];

export default function DeviceSimulator({ 
  activeDevice, 
  onRefreshDevices,
  addSystemLog,
  onCommentReported
}: DeviceSimulatorProps) {
  
  if (!activeDevice) {
    return (
      <div className="flex flex-col items-center justify-center h-[650px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-400 p-6">
        <Smartphone className="w-16 h-16 stroke-1 mb-4" />
        <p className="font-medium text-slate-600 mb-1">未选中手机终端</p>
        <p className="text-xs text-center max-w-[240px]">请在右侧“网页管理后台”中，选择一个在线手机终端以查看模拟器运行情况。</p>
      </div>
    );
  }

  // Simulator Screen State: 'feed' | 'post-detail'
  const [screen, setScreen] = useState<'feed' | 'detail'>('feed');
  const [selectedPost, setSelectedPost] = useState<MockPost | null>(null);
  
  // Local list of comments on the active post
  const [localComments, setLocalComments] = useState<any[]>([]);
  
  // User custom comment input
  const [userCommentText, setUserCommentText] = useState("");
  
  // Notification Banner State
  const [notification, setNotification] = useState<{ commenter: string; text: string } | null>(null);
  
  // Terminal Logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  // Simulated auto-replying states
  const [isReplyingAnimation, setIsReplyingAnimation] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [animatingCommentId, setAnimatingCommentId] = useState<string | null>(null);
  const [showTypingOverlay, setShowTypingOverlay] = useState(false);

  // Auto Scroll Logs to bottom
  const logsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  // Helper to add log to local terminal console
  const addTerminalLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev, `[${timeStr}] ${msg}`]);
  };

  // Reset simulator view when active device changes
  useEffect(() => {
    setScreen('feed');
    setSelectedPost(null);
    setLocalComments([]);
    setNotification(null);
    setTerminalLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 终端后台监控程序启动成功`,
      `[${new Date().toLocaleTimeString()}] 🔗 成功建立 HTTP Polling 长连接`,
      `[${new Date().toLocaleTimeString()}] 🔍 小红书 APP 运行中，开始监听通知栏评论消息...`,
      `[${new Date().toLocaleTimeString()}] 👤 当前登录小红书账号: @${activeDevice.accountName}`
    ]);
  }, [activeDevice.id]);

  // Load comments when entering a post detail
  useEffect(() => {
    if (selectedPost) {
      // Fetch current comments from backend for this terminal to populate initial list
      fetch(`/api/comments?terminalId=${activeDevice.id}`)
        .then(res => res.json())
        .then(data => {
          // Filter comments that belong to this post (or mock them if empty)
          const filtered = data.comments.filter((c: any) => c.postTitle === selectedPost.title);
          setLocalComments(filtered);
        })
        .catch(err => {
          console.error("Failed to load comments", err);
        });
    }
  }, [selectedPost, activeDevice.id]);

  // Command Polling Hook (Simulates the phone's background script polling `/api/devices/:id/commands`)
  useEffect(() => {
    if (activeDevice.status === 'offline') return;

    const interval = setInterval(() => {
      fetch(`/api/devices/${activeDevice.id}/commands`)
        .then(res => res.json())
        .then((commands: Command[]) => {
          if (commands && commands.length > 0) {
            // Found a command! Execute simulated reply
            const cmd = commands[0];
            executeSimulatedReply(cmd);
          }
        })
        .catch(err => console.error("Polling error:", err));
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [activeDevice.id, activeDevice.status, localComments, screen, selectedPost]);

  // Execute Simulated Auto-typing & Click Reply on the Phone
  const executeSimulatedReply = async (cmd: Command) => {
    if (isReplyingAnimation) return; // avoid conflict

    setIsReplyingAnimation(true);
    setAnimatingCommentId(cmd.commentId);
    
    addTerminalLog(`📥 [后台指令] 收到来自管理后台的回复下发指令！评论ID: ${cmd.commentId}`);
    addTerminalLog(`⌨️ [模拟操作] 正在唤醒小红书输入法，准备在APP中自动模拟打字...`);

    // Let's scroll or navigate to detail if not there (for visual experience, or just show typing on screen)
    setShowTypingOverlay(true);

    // Simulate character-by-character typing
    const replyText = cmd.replyText;
    let currentTyped = "";
    for (let i = 0; i < replyText.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 80)); // 80ms per character
      currentTyped += replyText[i];
      setTypingText(currentTyped);
    }

    await new Promise(resolve => setTimeout(resolve, 500)); // wait before clicking send
    addTerminalLog(`👆 [模拟操作] 成功定位并自动点击“发送”按钮，耗时：${replyText.length * 80 + 500}ms`);

    // Submit complete status to backend
    try {
      const res = await fetch("/api/devices/command-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: cmd.commentId,
          success: true
        })
      });
      
      if (res.ok) {
        addTerminalLog(`✅ [通信成功] 已成功向后台上报回复执行结果：SUCCESS`);
        // Refresh local UI comments
        if (selectedPost) {
          const updatedLocalComments = localComments.map(c => {
            if (c.id === cmd.commentId) {
              return { ...c, status: "replied" as const, replyText: replyText, replyTime: Date.now() };
            }
            return c;
          });
          setLocalComments(updatedLocalComments);
        }
        
        onCommentReported(); // notify parent to reload management grid
      }
    } catch (err) {
      addTerminalLog(`❌ [通信失败] 无法向后台上报执行状态`);
    } finally {
      setIsReplyingAnimation(false);
      setAnimatingCommentId(null);
      setTypingText("");
      setShowTypingOverlay(false);
    }
  };

  // Action: Trigger mock user comment
  const handleUserComment = async (textToSubmit: string) => {
    if (!textToSubmit.trim() || !selectedPost) return;

    const mockCommentId = `mock_c_${Math.random().toString(36).substr(2, 9)}`;
    const commenterName = `小红薯_${Math.floor(1000 + Math.random() * 9000)}`;
    const commenterAvatar = `https://images.unsplash.com/photo-${[
      "1534528741775-53994a69daeb",
      "1507003211169-0a1dd7228f2d",
      "1500648767791-00dcc994a43e",
      "1494790108377-be9c29b29330",
      "1522075469751-3a6694fb2f61"
    ][Math.floor(Math.random() * 5)]}?w=100`;

    // 1. Add to local screen state immediately so the app shows it
    const newCommentObj = {
      id: mockCommentId,
      commenterName,
      commenterAvatar,
      content: textToSubmit,
      time: Date.now(),
      status: 'pending',
      postTitle: selectedPost.title,
    };
    
    setLocalComments(prev => [newCommentObj, ...prev]);
    setUserCommentText("");

    // 2. Simulate phone notification banner top of the phone screen
    setNotification({
      commenter: commenterName,
      text: textToSubmit
    });
    setTimeout(() => setNotification(null), 4000); // banner disappears in 4s

    addTerminalLog(`🔔 [通知事件] 检测到手机顶部系统通知：${commenterName} 评论了您: "${textToSubmit}"`);
    addTerminalLog(`📡 [拦截成功] 监控程序拦截了该评论要素，准备通过HTTP通道上报至网页管理后台...`);

    // 3. Send real POST to backend API to trigger auto-reply evaluation
    try {
      const res = await fetch("/api/devices/report-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          terminalId: activeDevice.id,
          commentId: mockCommentId,
          commenterName,
          commenterAvatar,
          content: textToSubmit,
          postTitle: selectedPost.title,
          postCover: selectedPost.cover
        })
      });

      if (res.ok) {
        addTerminalLog(`🚀 [上报成功] 已成功向后台发送 POST /api/devices/report-comment 接口包`);
        onCommentReported(); // notify parent to reload table
      } else {
        addTerminalLog(`❌ [上报失败] 后端接口响应异常 ${res.status}`);
      }
    } catch (err: any) {
      addTerminalLog(`❌ [物理断连] 上报接口失败：${err.message || String(err)}`);
    }
  };

  const activePosts = MOCK_POSTS_BY_DEVICE[activeDevice.id] || [];

  return (
    <div className="flex flex-col gap-5 w-full lg:max-w-[420px]" id="device-simulator-panel">
      {/* Phone Header Indicator */}
      <div className="flex items-center justify-between px-2 py-1 bg-slate-100 border border-slate-200 rounded-xl" id="simulator-status-bar">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold">{activeDevice.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {activeDevice.status === "online" ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              连接正常
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-700">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              连接断开
            </span>
          )}
        </div>
      </div>

      {/* Simulated Smartphone Container */}
      <div 
        className="relative mx-auto w-full max-w-[340px] aspect-[9/19] rounded-[40px] bg-slate-900 border-[12px] border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        style={{ height: "610px" }}
        id="phone-frame"
      >
        {/* Notch / Camera Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-40 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-950 rounded-full mb-1"></div>
          <div className="w-2.5 h-2.5 bg-slate-900 border border-slate-800 rounded-full absolute right-6 bottom-1"></div>
        </div>

        {/* Top Status Bar Inside Screen */}
        <div className="h-9 px-6 pt-2.5 flex justify-between items-center bg-slate-950 text-white text-[11px] font-medium select-none z-30">
          <span>08:45</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Phone Content Screen */}
        <div className="flex-1 bg-white relative flex flex-col text-slate-800 overflow-hidden" id="phone-screen">
          
          {/* 1. Push Notification Dropdown Alert */}
          {notification && (
            <div 
              className="absolute top-3 left-3 right-3 bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl border border-slate-700/50 z-50 flex items-start gap-2.5 transition-all duration-300 transform translate-y-0 opacity-100"
              id="push-notification-banner"
            >
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                小
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-400">小红书通知</span>
                  <span className="text-[10px] text-slate-400">刚刚</span>
                </div>
                <p className="text-[11px] font-bold text-slate-100 mt-0.5 truncate">{notification.commenter} 评论了你：</p>
                <p className="text-[10px] text-slate-300 truncate mt-0.5">“{notification.text}”</p>
              </div>
            </div>
          )}

          {/* 2. Auto-typing overlay simulation */}
          {showTypingOverlay && (
            <div className="absolute inset-0 bg-black/40 z-40 flex flex-col justify-end">
              <div 
                className="bg-slate-100 border-t border-slate-300 rounded-t-3xl p-4 space-y-3 transform translate-y-0 transition-transform duration-300"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Terminal className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span>自动化注入运行：模拟输入打字...</span>
                </div>
                <div className="bg-white border border-slate-300 rounded-xl p-3 h-20 text-xs font-mono text-slate-800 break-words shadow-inner">
                  {typingText}
                  <span className="w-1.5 h-3.5 bg-indigo-600 inline-block ml-0.5 animate-pulse"></span>
                </div>
                <div className="flex justify-end gap-2">
                  <span className="text-[10px] text-slate-500 italic flex items-center gap-1">
                    模拟真实轨迹点击中 [发送]
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Screen Views router */}
          {screen === 'feed' ? (
            /* FEED SCREEN */
            <div className="flex-1 flex flex-col overflow-y-auto" id="screen-feed">
              {/* Feed Header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <span className="text-rose-500 font-extrabold text-base tracking-tight">小红书</span>
                <div className="flex items-center gap-3 text-slate-600">
                  <Compass className="w-5 h-5" />
                  <Bell className="w-5 h-5" />
                </div>
              </div>

              {/* Account Mini Banner */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                <img 
                  src={activeDevice.accountAvatar} 
                  alt="avatar" 
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">@{activeDevice.accountName}</h4>
                  <p className="text-[10px] text-slate-500">粉丝 {activeDevice.fansCount.toLocaleString()} | 笔记 {activeDevice.notesCount}</p>
                </div>
              </div>

              {/* Feed Posts Grid */}
              <div className="p-3 grid grid-cols-2 gap-2.5">
                {activePosts.map(post => (
                  <div 
                    key={post.id} 
                    onClick={() => {
                      setSelectedPost(post);
                      setScreen('detail');
                    }}
                    className="border border-slate-100 rounded-xl bg-white shadow-sm overflow-hidden hover:opacity-90 transition cursor-pointer"
                  >
                    <img src={post.cover} alt="cover" className="w-full aspect-[4/5] object-cover" referrerPolicy="no-referrer" />
                    <div className="p-2 space-y-1">
                      <p className="font-bold text-slate-900 text-[11px] leading-snug line-clamp-2">{post.title}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {post.likes}</span>
                        <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {post.commentsCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* POST DETAIL & INTERACTIVE COMMENTS SCREEN */
            <div className="flex-1 flex flex-col overflow-y-auto" id="screen-detail">
              {/* Detail Header */}
              <div className="px-3 py-2 border-b border-slate-100 bg-white flex items-center gap-1.5 sticky top-0 z-10 shadow-sm shrink-0">
                <button onClick={() => setScreen('feed')} className="p-1 hover:bg-slate-100 rounded-full">
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <div className="flex items-center gap-2">
                  <img src={activeDevice.accountAvatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <span className="font-bold text-xs text-slate-800 truncate max-w-[140px]">{activeDevice.accountName}</span>
                </div>
              </div>

              {/* Post Info inside detail */}
              {selectedPost && (
                <div className="p-3 border-b border-slate-100 space-y-2.5 bg-slate-50 shrink-0">
                  <div className="flex gap-2.5">
                    <img src={selectedPost.cover} alt="cover" className="w-14 h-18 object-cover rounded-md border border-slate-200" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <h4 className="font-bold text-slate-900 text-xs leading-normal line-clamp-2">{selectedPost.title}</h4>
                      <p className="text-[10px] text-slate-500">发布于 2026-07-18</p>
                    </div>
                  </div>
                </div>
              )}

              {/* COMMENTS REGION */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white min-h-[160px]">
                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">笔记评论区 ({localComments.length})</h5>
                
                {localComments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="w-8 h-8 text-slate-300 stroke-1 mb-1.5" />
                    <p className="text-xs font-semibold text-slate-500">暂无评论</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">请在下方选择一句模拟评论发起上报测试</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {localComments.map((comment: any) => (
                      <div 
                        key={comment.id} 
                        className={`p-2.5 rounded-xl border transition-all duration-300 ${
                          animatingCommentId === comment.id 
                            ? "bg-amber-50 border-amber-300 shadow-md scale-[1.02]" 
                            : "bg-slate-50/50 border-slate-100"
                        }`}
                      >
                        {/* Commenter Row */}
                        <div className="flex items-start gap-2">
                          <img 
                            src={comment.commenterAvatar} 
                            alt="avatar" 
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-[10px] truncate">{comment.commenterName}</span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(comment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 mt-0.5 leading-normal">{comment.content}</p>
                          </div>
                        </div>

                        {/* Reply Subrow if replied */}
                        {comment.replyText && (
                          <div className="mt-2.5 pl-6 flex items-start gap-2 border-t border-slate-100/80 pt-2 bg-slate-50/80 p-2 rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-indigo-700 text-[9px]">账号作者回复</span>
                                <span className="text-[8px] text-slate-400">
                                  {comment.replyTime ? new Date(comment.replyTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "刚刚"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-700 mt-0.5 leading-normal italic">
                                “ {comment.replyText} ”
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Status tag */}
                        <div className="flex justify-end mt-1 text-[8px]">
                          {comment.status === 'pending' && (
                            <span className="text-slate-400 font-medium">监控成功，等待后台处理...</span>
                          )}
                          {comment.status === 'ai_generating' && (
                            <span className="text-blue-500 font-semibold animate-pulse">AI思考生成回复中...</span>
                          )}
                          {comment.status === 'replying' && (
                            <span className="text-amber-500 font-semibold animate-pulse">后台已下发！待手机端自动执行</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SIMULATION CONTROLLER DRAWER */}
              <div className="p-3 border-t border-slate-100 bg-slate-50 shrink-0 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">模拟用户评论测试区</span>
                  <span className="text-[9px] text-slate-400 bg-slate-200 px-1 py-0.5 rounded">点击生成</span>
                </div>

                {/* Preset Suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_COMMENTS.map((sc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUserComment(sc.text)}
                      disabled={activeDevice.status === 'offline' || isReplyingAnimation}
                      className="text-[10px] bg-white border border-slate-200 text-slate-700 hover:border-rose-500 hover:text-rose-600 px-2.5 py-1 rounded-full text-left font-medium transition cursor-pointer disabled:opacity-50 disabled:hover:text-slate-700"
                    >
                      {sc.category}: "{sc.text.substring(0, 8)}..."
                    </button>
                  ))}
                </div>

                {/* Custom comment input */}
                <div className="flex items-center gap-1.5 mt-1">
                  <input 
                    type="text" 
                    value={userCommentText}
                    onChange={(e) => setUserCommentText(e.target.value)}
                    disabled={activeDevice.status === 'offline' || isReplyingAnimation}
                    placeholder="输入自定义评论内容上报测试..."
                    className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-rose-500 disabled:opacity-50"
                  />
                  <button 
                    onClick={() => handleUserComment(userCommentText)}
                    disabled={!userCommentText.trim() || activeDevice.status === 'offline' || isReplyingAnimation}
                    className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition cursor-pointer disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom navigation bar of Simulated XHS */}
          <div className="h-12 border-t border-slate-100 bg-slate-50 flex items-center justify-around text-slate-400 shrink-0 select-none">
            <button onClick={() => setScreen('feed')} className={`flex flex-col items-center justify-center flex-1 py-1 ${screen === 'feed' ? 'text-rose-500' : 'hover:text-slate-600'}`}>
              <Compass className="w-4.5 h-4.5" />
              <span className="text-[8px] mt-0.5 font-bold">首页</span>
            </button>
            <button className="flex flex-col items-center justify-center flex-1 py-1 hover:text-slate-600">
              <PlusSquare className="w-4.5 h-4.5" />
              <span className="text-[8px] mt-0.5 font-bold">发布</span>
            </button>
            <button onClick={() => { if (selectedPost) setScreen('detail'); }} className={`flex flex-col items-center justify-center flex-1 py-1 ${screen === 'detail' ? 'text-rose-500' : 'hover:text-slate-600'}`}>
              <MessageSquare className="w-4.5 h-4.5" />
              <span className="text-[8px] mt-0.5 font-bold">消息</span>
            </button>
          </div>
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="h-6 bg-slate-950 flex items-center justify-center select-none z-30 shrink-0">
          <div className="w-28 h-1 bg-slate-800 rounded-full"></div>
        </div>
      </div>

      {/* Device Console Terminal Logs */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-lg flex flex-col h-[200px]" id="device-terminal-logs">
        <div className="bg-slate-900 px-3.5 py-2 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 font-mono">手机终端底层后台监控日志</span>
          </div>
          <button 
            onClick={() => setTerminalLogs([`[${new Date().toLocaleTimeString()}] 🧹 终端控制台日志已清空`])} 
            className="text-[10px] text-slate-500 hover:text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded font-mono"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] text-slate-300 space-y-1.5">
          {terminalLogs.map((log, index) => {
            let color = "text-slate-300";
            if (log.includes("🔔") || log.includes("通知")) color = "text-amber-300";
            if (log.includes("✅") || log.includes("成功")) color = "text-emerald-400";
            if (log.includes("📥") || log.includes("指令")) color = "text-blue-300";
            if (log.includes("❌") || log.includes("失败")) color = "text-rose-400";
            if (log.includes("⌨️") || log.includes("模拟")) color = "text-indigo-300";
            
            return (
              <div key={index} className={`${color} leading-relaxed break-words`}>
                {log}
              </div>
            );
          })}
          <div ref={logsEndRef}></div>
        </div>
      </div>
    </div>
  );
}
