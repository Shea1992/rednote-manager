import React, { useState, useEffect } from "react";
import { Device, CommentMessage, Settings, SystemLog } from "./types";
import DeviceSimulator from "./components/DeviceSimulator";
import AdminPanel from "./components/AdminPanel";
import { Smartphone, Laptop, Sparkles, Server, CheckCircle2, ShieldCheck, Cpu } from "lucide-react";
import { customFetch as fetch } from "./mockApi";

export default function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [comments, setComments] = useState<CommentMessage[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("phone_01");

  // Sync data from backend APIs
  const refreshAllData = async () => {
    try {
      const [devicesRes, commentsRes, settingsRes, logsRes] = await Promise.all([
        fetch("/api/devices"),
        fetch("/api/comments?limit=100"),
        fetch("/api/settings"),
        fetch("/api/logs")
      ]);

      if (devicesRes.ok) {
        const devs = await devicesRes.json();
        setDevices(devs);
      }
      if (commentsRes.ok) {
        const comms = await commentsRes.json();
        setComments(comms.comments);
      }
      if (settingsRes.ok) {
        const setts = await settingsRes.json();
        setSettings(setts);
      }
      if (logsRes.ok) {
        const logs = await logsRes.json();
        setSystemLogs(logs);
      }
    } catch (err) {
      console.error("Error refreshing dashboard data:", err);
    }
  };

  // On Mount: Initial Load + Poll Interval
  useEffect(() => {
    refreshAllData();

    // Regular polling every 3 seconds to keep UI state in sync
    const interval = setInterval(() => {
      refreshAllData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Action Dispatchers:
  
  // 1. Update Device Auto-Reply Mode
  const handleUpdateDeviceMode = async (deviceId: string, activeMode: Device['activeMode']) => {
    try {
      const res = await fetch("/api/devices/update-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deviceId, activeMode })
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (err) {
      console.error("Failed to update device mode:", err);
    }
  };

  // 2. Dispatch Manual Reply
  const handleManualReply = async (commentId: string, replyText: string) => {
    try {
      const res = await fetch("/api/comments/manual-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, replyText })
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (err) {
      console.error("Failed to send manual reply:", err);
    }
  };

  // 3. Save Settings Block
  const handleSaveSettings = async (updatedSettings: Partial<Settings>) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  // 4. Add Keyword Match Rule
  const handleAddKeywordRule = async (keyword: string, reply: string) => {
    try {
      const res = await fetch("/api/settings/keyword-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, reply })
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (err) {
      console.error("Failed to add keyword rule:", err);
    }
  };

  // 5. Delete Keyword Match Rule
  const handleDeleteKeywordRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/settings/keyword-rules/${ruleId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (err) {
      console.error("Failed to delete keyword rule:", err);
    }
  };

  const activeDevice = devices.find(d => d.id === selectedDeviceId) || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="app-root">
      
      {/* Global Top Banner/Navbar */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-6 sticky top-0 z-30 shadow-sm" id="main-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo and Core Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Cpu className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-slate-900 text-lg tracking-tight">小红书多矩阵极速自动化运营系统</h1>
                <span className="text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded">
                  PRO v1.2
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">多设备自动监控上报 + 后台智能策略下发回复 (Gemini AI & 知识库一体化联动方案)</p>
            </div>
          </div>

          {/* Quick System KPIs */}
          <div className="flex items-center gap-5 text-xs text-slate-500" id="header-indicators">
            <div className="flex items-center gap-1.5 font-medium">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>终端设备:</span>
              <strong className="text-slate-800">
                {devices.filter(d => d.status === 'online').length}/{devices.length} 在线
              </strong>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Laptop className="w-4 h-4 text-indigo-500" />
              <span>智能决策:</span>
              <strong className="text-slate-800">Gemini 3.5 Ready</strong>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>安全沙盒:</span>
              <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold text-[10px]">一机一IP仿真</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6" id="main-workspace">
        
        {/* Left Side: Device Simulator Frame */}
        <div className="w-full lg:w-[350px] xl:w-[380px] shrink-0 space-y-4" id="left-sidebar">
          
          {/* Simulated Device Selection Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">手机矩阵终端选择</h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">一机一号</span>
            </div>
            
            {/* Device select buttons */}
            <div className="grid grid-cols-3 gap-1.5">
              {devices.map(device => {
                const isActive = device.id === selectedDeviceId;
                return (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDeviceId(device.id)}
                    className={`px-2 py-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 relative ${
                      isActive 
                        ? "border-indigo-500 bg-indigo-50/50 text-indigo-700" 
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {/* Tiny notification dot */}
                    {comments.filter(c => c.terminalId === device.id && c.status === 'pending').length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                    )}
                    <span className="font-extrabold text-[10px]">{device.name.split(" - ")[0]}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Mobile Terminal Device Mockup */}
          <DeviceSimulator 
            activeDevice={activeDevice} 
            onRefreshDevices={refreshAllData}
            addSystemLog={(text) => console.log(text)}
            onCommentReported={refreshAllData}
          />
        </div>

        {/* Right Side: Back-end Web Admin Control Center */}
        <div className="flex-1 min-w-0 flex flex-col" id="right-workspace">
          {settings ? (
            <AdminPanel 
              devices={devices}
              comments={comments}
              settings={settings}
              systemLogs={systemLogs}
              onRefreshAll={refreshAllData}
              onUpdateDeviceMode={handleUpdateDeviceMode}
              onManualReply={handleManualReply}
              onSaveSettings={handleSaveSettings}
              onAddKeywordRule={handleAddKeywordRule}
              onDeleteKeywordRule={handleDeleteKeywordRule}
            />
          ) : (
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 text-center shadow-md">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-bold text-slate-700 text-sm">正在加载后台管理系统与数据库数据...</p>
              <p className="text-xs text-slate-400 mt-1">请确保本地 Express + Vite 容器服务运行正常。</p>
            </div>
          )}
        </div>

      </main>

      {/* Global Footer Credits */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400 font-medium shrink-0" id="main-footer">
        <p>小红书多矩阵极速自动化运营方案 · 电脑端后台 + 移动端拦截模块仿真模拟系统</p>
        <p className="text-[10px] text-slate-300 mt-1">本软件产品仅用于企业私域矩阵矩阵提效及技术交流，操作流程严格遵循小红书开发协议与用户规范。</p>
      </footer>
    </div>
  );
}
