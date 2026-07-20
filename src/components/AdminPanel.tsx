import React, { useState, useEffect } from "react";
import { Device, CommentMessage, Settings, SystemLog, KeywordRule } from "../types";
import { 
  Settings as SettingsIcon, Layers, MessageSquareCode, ShieldAlert, Cpu, 
  Trash2, Plus, Save, RefreshCw, Search, CheckCircle, Clock, XCircle, 
  BrainCircuit, UserCheck, HelpCircle, ArrowRightLeft, Database
} from "lucide-react";
import ArchitectureInfo from "./ArchitectureInfo";
import { customFetch as fetch } from "../mockApi";

interface AdminPanelProps {
  devices: Device[];
  comments: CommentMessage[];
  settings: Settings;
  systemLogs: SystemLog[];
  onRefreshAll: () => void;
  onUpdateDeviceMode: (deviceId: string, mode: Device['activeMode']) => void;
  onManualReply: (commentId: string, replyText: string) => void;
  onSaveSettings: (settings: Partial<Settings>) => void;
  onAddKeywordRule: (keyword: string, reply: string) => void;
  onDeleteKeywordRule: (ruleId: string) => void;
}

export default function AdminPanel({
  devices,
  comments,
  settings,
  systemLogs,
  onRefreshAll,
  onUpdateDeviceMode,
  onManualReply,
  onSaveSettings,
  onAddKeywordRule,
  onDeleteKeywordRule
}: AdminPanelProps) {
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'comments' | 'strategies' | 'logs'>('dashboard');

  // Filtering comments state
  const [commentSearch, setCommentSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");

  // Pagination for comments table
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 6;

  // New Keyword rule input
  const [newKeyword, setNewKeyword] = useState("");
  const [newReply, setNewReply] = useState("");

  // Editing Settings state
  const [editActiveHoursStart, setEditActiveHoursStart] = useState(settings.activeHoursStart);
  const [editActiveHoursEnd, setEditActiveHoursEnd] = useState(settings.activeHoursEnd);
  const [editKB, setEditKB] = useState(settings.knowledgeBase);
  const [editPrompt, setEditPrompt] = useState(settings.aiPrompt);
  const [editIsActive, setEditIsActive] = useState(settings.isMonitoringActive);

  // Sync settings inputs when loaded/changed
  useEffect(() => {
    setEditActiveHoursStart(settings.activeHoursStart);
    setEditActiveHoursEnd(settings.activeHoursEnd);
    setEditKB(settings.knowledgeBase);
    setEditPrompt(settings.aiPrompt);
    setEditIsActive(settings.isMonitoringActive);
  }, [settings]);

  // AI sandbox test state
  const [sandboxPrompt, setSandboxPrompt] = useState("");
  const [sandboxResult, setSandboxResult] = useState("");
  const [isSandboxLoading, setIsSandboxLoading] = useState(false);

  // Manual reply box text state
  const [manualReplyTexts, setManualReplyTexts] = useState<Record<string, string>>({});

  // Filter Comments
  const filteredComments = comments.filter(c => {
    const matchesSearch = c.content.toLowerCase().includes(commentSearch.toLowerCase()) || 
                          c.commenterName.toLowerCase().includes(commentSearch.toLowerCase()) ||
                          c.postTitle.toLowerCase().includes(commentSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : c.status === statusFilter;
    const matchesDevice = deviceFilter === "all" ? true : c.terminalId === deviceFilter;
    return matchesSearch && matchesStatus && matchesDevice;
  });

  // Paginated Comments
  const totalComments = filteredComments.length;
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(totalComments / commentsPerPage) || 1;

  // Handle saving general settings
  const handleSaveAllSettings = () => {
    onSaveSettings({
      activeHoursStart: editActiveHoursStart,
      activeHoursEnd: editActiveHoursEnd,
      knowledgeBase: editKB,
      aiPrompt: editPrompt,
      isMonitoringActive: editIsActive
    });
  };

  // Handle adding new keyword rule
  const handleAddNewKeywordRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newReply.trim()) return;
    onAddKeywordRule(newKeyword, newReply);
    setNewKeyword("");
    setNewReply("");
  };

  // Test prompt against server-side Gemini endpoint
  const handleTestAI = async () => {
    if (!sandboxPrompt.trim()) return;
    setIsSandboxLoading(true);
    setSandboxResult("");
    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: sandboxPrompt })
      });
      const data = await res.json();
      if (res.ok) {
        setSandboxResult(data.text);
      } else {
        setSandboxResult(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setSandboxResult(`Failed: ${err.message || String(err)}`);
    } finally {
      setIsSandboxLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[600px]" id="admin-panel">
      
      {/* Admin Panel Header tabs */}
      <div className="bg-slate-900 text-slate-300 px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-800 gap-4" id="admin-tabs-bar">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="font-extrabold text-white text-base tracking-tight">多账号矩阵网页管理后台</h2>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-slate-950 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto gap-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'hover:text-white text-slate-400'}`}
          >
            运营大屏
          </button>
          <button 
            onClick={() => setActiveTab('comments')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer relative ${activeTab === 'comments' ? 'bg-indigo-600 text-white shadow' : 'hover:text-white text-slate-400'}`}
          >
            评论监控流
            {comments.filter(c => c.status === 'pending').length > 0 && (
              <span className="absolute -top-1.5 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] flex items-center justify-center rounded-full animate-bounce">
                {comments.filter(c => c.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('strategies')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'strategies' ? 'bg-indigo-600 text-white shadow' : 'hover:text-white text-slate-400'}`}
          >
            策略与知识库
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow' : 'hover:text-white text-slate-400'}`}
          >
            日志与通信架构
          </button>
        </div>

        {/* Global manual refresh button */}
        <button 
          onClick={onRefreshAll} 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
          手动同步
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto" id="admin-main-content">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6" id="dashboard-tab">
            {/* Stats Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
              <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 hover:shadow-sm transition">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">连接终端数</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-slate-900">{devices.length}</span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center">
                    ({devices.filter(d => d.status === 'online').length} 在线)
                  </span>
                </div>
              </div>

              <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 hover:shadow-sm transition">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">自动监控状态</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className={`text-sm font-black uppercase ${settings.isMonitoringActive ? 'text-green-600' : 'text-slate-500'}`}>
                    {settings.isMonitoringActive ? '● 正在监控中' : '○ 已暂停'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">({settings.activeHoursStart}-{settings.activeHoursEnd})</span>
                </div>
              </div>

              <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 hover:shadow-sm transition">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">已拦截评论数</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-slate-900">{comments.length}</span>
                  <span className="text-xs text-slate-400 font-mono">条</span>
                </div>
              </div>

              <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50 hover:shadow-sm transition">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">回复成功率</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-indigo-600">
                    {comments.length > 0 ? Math.round((comments.filter(c => c.status === 'replied').length / comments.length) * 100) : 100}%
                  </span>
                  <span className="text-xs text-slate-400">已处理</span>
                </div>
              </div>
            </div>

            {/* Matrix Devices Status Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm" id="devices-status-card">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Cpu className="w-4.5 h-4.5 text-indigo-500" />
                  矩阵终端状态一览
                </h3>
                <span className="text-xs text-slate-500 font-medium">定时每 3s 长轮询监听下发指令</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30 text-slate-400 font-semibold">
                      <th className="p-4">设备名称 / 串号</th>
                      <th className="p-4">登录小红书账号</th>
                      <th className="p-4">在线状态</th>
                      <th className="p-4">当前自动回复模式</th>
                      <th className="p-4 text-center">累计数据</th>
                      <th className="p-4">设备心跳</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {devices.map(device => (
                      <tr key={device.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-semibold text-slate-900">{device.name}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <img src={device.accountAvatar} alt="avatar" className="w-6 h-6 rounded-full object-cover border" referrerPolicy="no-referrer" />
                            <span className="font-medium text-slate-800">{device.accountName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {device.status === 'online' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              在线
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              离线
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <select 
                            value={device.activeMode} 
                            onChange={(e) => onUpdateDeviceMode(device.id, e.target.value as Device['activeMode'])}
                            className="bg-slate-100 border border-slate-200 hover:border-indigo-400 text-slate-800 text-xs px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold transition cursor-pointer"
                          >
                            <option value="preset">预设关键词匹配</option>
                            <option value="ai">AI智能客服 (知识库)</option>
                            <option value="manual">仅人工审核下发</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-slate-400">粉丝</span> <span className="font-bold text-slate-800">{device.fansCount}</span>
                          <span className="text-slate-200 mx-1.5">|</span>
                          <span className="text-slate-400">笔记</span> <span className="font-bold text-slate-800">{device.notesCount}</span>
                        </td>
                        <td className="p-4 text-[10px] font-mono text-slate-500">
                          {device.status === 'online' ? '刚刚' : `${Math.round((Date.now() - device.lastHeartbeat) / 1000)}秒前`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMMENTS MONITOR STREAM */}
        {activeTab === 'comments' && (
          <div className="space-y-5" id="comments-tab">
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row items-center gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200" id="comments-filters">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={commentSearch}
                  onChange={(e) => { setCommentSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="搜索评论内容、文章标题、小红书账号..."
                  className="w-full text-xs bg-white border border-slate-200 pl-9 pr-4 py-2 rounded-xl outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 shrink-0 w-full md:w-auto">
                <span className="text-slate-500 text-xs font-semibold shrink-0">状态:</span>
                <select 
                  value={statusFilter} 
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-medium cursor-pointer"
                >
                  <option value="all">全部评论</option>
                  <option value="pending">等待处理</option>
                  <option value="ai_generating">AI编写中</option>
                  <option value="replying">待终端执行</option>
                  <option value="replied">已自动回复</option>
                  <option value="failed">执行失败</option>
                </select>
              </div>

              {/* Device Filter */}
              <div className="flex items-center gap-1.5 shrink-0 w-full md:w-auto">
                <span className="text-slate-500 text-xs font-semibold shrink-0">来源终端:</span>
                <select 
                  value={deviceFilter} 
                  onChange={(e) => { setDeviceFilter(e.target.value); setCurrentPage(1); }}
                  className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-medium cursor-pointer"
                >
                  <option value="all">全部终端</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>{d.name.split(" - ")[0]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reported Comments Stream Grid */}
            <div className="space-y-3.5" id="comments-cards-list">
              {currentComments.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-2xl py-12 text-center bg-slate-50/50">
                  <p className="text-slate-400 font-semibold mb-1">暂无符合条件的拦截评论消息</p>
                  <p className="text-xs text-slate-400">请到左侧手机模拟器中，点击“生成模拟评论”触发上报事件。</p>
                </div>
              ) : (
                currentComments.map((comment) => (
                  <div key={comment.id} className="border border-slate-200 rounded-2xl p-5 bg-white hover:border-slate-300 shadow-sm hover:shadow transition-all space-y-3.5">
                    
                    {/* Card Upper: Metadata and User */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-150 rounded">
                          {comment.terminalName.split(" - ")[0]}
                        </span>
                        <span className="text-slate-300 text-xs">|</span>
                        <span className="text-slate-500 text-[11px] font-medium max-w-[200px] truncate">
                          账号：{comment.accountName}
                        </span>
                        <span className="text-slate-300 text-xs">|</span>
                        <span className="text-slate-500 text-[11px] font-medium max-w-[200px] truncate">
                          文章：{comment.postTitle}
                        </span>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(comment.time).toLocaleString()}
                        </span>
                        
                        {comment.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            <Clock className="w-3 h-3 animate-pulse" /> 待处理
                          </span>
                        )}
                        {comment.status === 'ai_generating' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                            <BrainCircuit className="w-3 h-3 animate-pulse" /> AI编写中
                          </span>
                        )}
                        {comment.status === 'replying' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            <ArrowRightLeft className="w-3 h-3 animate-bounce" /> 待终端拉取回复
                          </span>
                        )}
                        {comment.status === 'replied' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3" /> 回复成功
                          </span>
                        )}
                        {comment.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            <XCircle className="w-3 h-3" /> 执行失败
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Middle: Comment Content */}
                    <div className="flex items-start gap-3.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      <img src={comment.commenterAvatar} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0 border" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-xs">@{comment.commenterName}</h4>
                        <p className="text-slate-700 text-xs mt-1 leading-relaxed font-medium">“{comment.content}”</p>
                      </div>
                    </div>

                    {/* Card Lower: Reply Status / Manual Input box */}
                    <div className="pt-1.5" id="comment-card-lower">
                      {(comment.status === 'replied' || comment.status === 'replying') && comment.replyText ? (
                        <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 space-y-1">
                          <p className="text-[10px] font-bold text-emerald-800 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5" /> 
                            {comment.status === 'replied' ? '已成功自动回复内容：' : '已自动生成并下发回复指令中：'}
                          </p>
                          <p className="text-xs text-slate-700 leading-relaxed pl-5 font-mono">{comment.replyText}</p>
                          {comment.replyTime && (
                            <p className="text-[9px] text-slate-400 pl-5 pt-0.5">自动执行耗时约 3.5s</p>
                          )}
                        </div>
                      ) : comment.status === 'failed' ? (
                        <div className="space-y-3.5">
                          <div className="bg-red-50/50 border border-red-100 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-red-800 flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" /> 终端回复操作执行失败：
                            </p>
                            <p className="text-xs text-slate-600 pl-5 font-mono mt-0.5">{comment.errorMsg || "未知通信错误"}</p>
                          </div>
                          
                          {/* Manual retry */}
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="重新输入回复内容..."
                              value={manualReplyTexts[comment.id] || ""}
                              onChange={(e) => setManualReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                              className="flex-1 text-xs border border-slate-200 outline-none focus:border-indigo-500 rounded-xl px-3 py-2"
                            />
                            <button
                              onClick={() => {
                                onManualReply(comment.id, manualReplyTexts[comment.id]);
                                setManualReplyTexts(prev => ({ ...prev, [comment.id]: "" }));
                              }}
                              disabled={!manualReplyTexts[comment.id]?.trim()}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-40"
                            >
                              重新下发
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Manual Reply Input Box (For Pending/Unmatched Rules) */
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="输入人工客服回复内容，将实时派发至对应手机自动发送..."
                            value={manualReplyTexts[comment.id] || ""}
                            onChange={(e) => setManualReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                            className="flex-1 text-xs border border-slate-200 outline-none focus:border-indigo-500 rounded-xl px-3.5 py-2"
                          />
                          <button
                            onClick={() => {
                              onManualReply(comment.id, manualReplyTexts[comment.id]);
                              setManualReplyTexts(prev => ({ ...prev, [comment.id]: "" }));
                            }}
                            disabled={!manualReplyTexts[comment.id]?.trim()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-40 shrink-0"
                          >
                            下发回复指令
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4" id="comments-pagination">
                <span className="text-xs text-slate-500">
                  当前显示第 {indexOfFirstComment + 1} - {Math.min(indexOfLastComment, totalComments)} 条，共 {totalComments} 条
                </span>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 transition cursor-pointer disabled:opacity-40"
                  >
                    上一页
                  </button>
                  <span className="px-3">第 {currentPage} 页 / 共 {totalPages} 页</span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 transition cursor-pointer disabled:opacity-40"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STRATEGIES, KEYWORD RULES & AI KNOWLEDGE BASE */}
        {activeTab === 'strategies' && (
          <div className="space-y-6" id="strategies-tab">
            
            {/* Split row: Monitoring configuration + Keyword Rules */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="strategies-split-row">
              {/* Left Column: Monitoring times */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm bg-white">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <SettingsIcon className="w-4.5 h-4.5 text-slate-500" />
                  全局监控运营配置
                </h3>

                <div className="space-y-3.5">
                  {/* Toggle Active Monitoring */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">自动拦截监控服务</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">控制全部手机终端脚本开始/停止拦截通知消息</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editIsActive}
                        onChange={(e) => setEditIsActive(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Active Hours input */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">监控起始时间</label>
                      <input 
                        type="time" 
                        value={editActiveHoursStart}
                        onChange={(e) => setEditActiveHoursStart(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">监控截止时间</label>
                      <input 
                        type="time" 
                        value={editActiveHoursEnd}
                        onChange={(e) => setEditActiveHoursEnd(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 flex items-center gap-1 pl-1">
                    <HelpCircle className="w-3.5 h-3.5" /> 
                    在监控时间外的拦截消息，系统只做数据上报，不会执行任何自动回复。
                  </p>

                  <button 
                    onClick={handleSaveAllSettings}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> 保存全局策略
                  </button>
                </div>
              </div>

              {/* Right Column: Keyword matching rules */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm bg-white flex flex-col h-[320px]">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 shrink-0">
                  <MessageSquareCode className="w-4.5 h-4.5 text-slate-500" />
                  预设关键词匹配规则
                </h3>

                {/* Rules List Container */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1.5 space-y-2">
                  {settings.keywordRules.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      暂无任何关键词匹配回复规则，请在下方添加
                    </div>
                  ) : (
                    settings.keywordRules.map(rule => (
                      <div key={rule.id} className="flex items-start justify-between py-2 gap-4">
                        <div className="min-w-0">
                          <span className="inline-block font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded text-[10px]">
                            {rule.keyword}
                          </span>
                          <p className="text-[11px] text-slate-600 mt-1 font-medium font-mono leading-normal">
                            “{rule.reply}”
                          </p>
                        </div>
                        <button 
                          onClick={() => onDeleteKeywordRule(rule.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Rule Form */}
                <form onSubmit={handleAddNewKeywordRule} className="border-t border-slate-100 pt-3 flex items-center gap-2 shrink-0">
                  <input 
                    type="text" 
                    placeholder="命中词,如:地址" 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="w-28 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500"
                  />
                  <input 
                    type="text" 
                    placeholder="自动回复此文本内容..." 
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500"
                  />
                  <button 
                    type="submit" 
                    className="p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom Row: AI Brain Knowledge Base & Prompt Settings */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm bg-white" id="ai-knowledge-base-settings">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <BrainCircuit className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
                AI 智能客服大脑：基于知识库回复配置
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Knowledge Base inputs */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" /> 
                      客服知识库说明书 (业务核心素材)
                    </label>
                    <textarea 
                      value={editKB}
                      onChange={(e) => setEditKB(e.target.value)}
                      rows={8}
                      placeholder="在这里填写企业、产品、探店、或者客服的详细参考说明书内容。AI将会严格读取该内容生成针对性的标准答案，拒绝胡说八道..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                      AI 行为与人设设定 System Prompt
                    </label>
                    <textarea 
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      rows={3}
                      placeholder="设定AI说话风格、长度限制及语气特征..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <button 
                    onClick={handleSaveAllSettings}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> 保存知识库与AI人设
                  </button>
                </div>

                {/* AI Sandbox tester panel */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-3">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    AI 客服沙盒测试调试区
                  </h4>
                  
                  <div className="flex-1 flex flex-col gap-3">
                    <div>
                      <p className="text-[10px] text-slate-400 mb-1">输入测试性评论，直接检查 AI 客服结合上面知识库的回复成效：</p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="例如: 极光持妆粉底液多少钱？怎么卖的？"
                          value={sandboxPrompt}
                          onChange={(e) => setSandboxPrompt(e.target.value)}
                          className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
                        />
                        <button 
                          onClick={handleTestAI}
                          disabled={isSandboxLoading || !sandboxPrompt.trim()}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-40 shrink-0"
                        >
                          {isSandboxLoading ? "AI回答中..." : "测试生成"}
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col min-h-[140px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">AI 实际生成效果：</span>
                      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 overflow-y-auto leading-relaxed shadow-inner">
                        {sandboxResult ? (
                          <p>{sandboxResult}</p>
                        ) : (
                          <span className="text-slate-400 italic">在上方输入用户提问，点击“测试生成”以检查AI理解能力。如果您的 API 密钥设置成功，系统将调用真实的 Gemini 模型进行语义生成；否则将采用规则进行高仿真模拟。</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM COMMUNICATION LOGS & SCHEMA */}
        {activeTab === 'logs' && (
          <div className="space-y-6" id="logs-tab">
            <ArchitectureInfo />

            {/* Back-end Communication logs view */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 shadow-lg flex flex-col h-[320px]" id="backend-logs-card">
              <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-300 font-mono">网页管理后台（云服务器）网络包通信总线监控</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-mono bg-slate-950/50 border border-slate-800 px-2 py-0.5 rounded">实时监听中...</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[10.5px] text-slate-300 space-y-2 select-text">
                {systemLogs.length === 0 ? (
                  <div className="text-slate-500 italic py-8 text-center">暂无系统通信日志</div>
                ) : (
                  systemLogs.map(log => {
                    let typeBadge = "";
                    let typeColor = "text-slate-300";
                    switch(log.type) {
                      case "report":
                        typeBadge = "[XHS_REPORT]";
                        typeColor = "text-amber-400";
                        break;
                      case "reply":
                        typeBadge = "[CMD_DISPATCH]";
                        typeColor = "text-indigo-400";
                        break;
                      case "heartbeat":
                        typeBadge = "[SYS_ALIVE]";
                        typeColor = "text-emerald-400";
                        break;
                      case "ai":
                        typeBadge = "[GEMINI_AI]";
                        typeColor = "text-cyan-400";
                        break;
                      case "error":
                        typeBadge = "[ERR_ALERT]";
                        typeColor = "text-rose-400 font-bold";
                        break;
                      default:
                        typeBadge = "[SYS_INFO]";
                        typeColor = "text-slate-400";
                    }

                    return (
                      <div key={log.id} className="border-b border-slate-900/50 pb-2 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-[9.5px]">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span className={`${typeColor} font-bold`}>{typeBadge}</span>
                          <span className="text-slate-200 font-bold">{log.title}</span>
                        </div>
                        <p className="text-slate-400 pl-4">{log.description}</p>
                        {log.payload && (
                          <pre className="text-[9px] text-slate-500 bg-slate-900/30 p-2 rounded mt-1 overflow-x-auto whitespace-pre-wrap max-h-32">
                            {log.payload}
                          </pre>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
