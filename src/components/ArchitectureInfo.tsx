import React from "react";
import { BookOpen, RefreshCw, Send, ShieldAlert, Cpu } from "lucide-react";

export default function ArchitectureInfo() {
  return (
    <div className="space-y-6 text-sm text-slate-700 leading-relaxed" id="architecture-info-container">
      {/* Overview Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5" id="arch-overview">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          系统架构与多终端通信方案设计
        </h4>
        <p className="text-slate-600">
          为了在小红书不卡退、不封号的安全前提下，实现多账号矩阵自动监控和及时回复，本方案设计了一套
          <strong className="text-slate-900">“云端管理后台 + 移动端自动监控脚本 (XScript Hook)”</strong> 
          的分布式通信协作架构。手机终端运行真实的小红书App，通过无障碍服务（Accessibility Service）或网页端容器进行信息劫持，并与管理后台进行实时异步通信。
        </p>
      </div>

      {/* Grid of Communication Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="arch-protocols-grid">
        {/* Protocol 1: Heartbeat */}
        <div className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm" id="protocol-heartbeat">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded">POST</span>
            <span className="font-mono text-slate-800 font-medium">/api/devices/heartbeat</span>
          </div>
          <h5 className="font-medium text-slate-900 mb-1">1. 设备状态保活 (心跳)</h5>
          <p className="text-xs text-slate-500 mb-3">
            手机终端每隔 15~20 秒向后台发送一次保活请求，报告设备网络、剩余电量、当前登录的小红书账号及状态。若超过 40 秒未收到心跳，后台将其标记为离线。
          </p>
          <pre className="bg-slate-950 text-indigo-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`{
  "id": "phone_01",
  "battery": 88,
  "account": "美妆测评达人 💄",
  "status": "active"
}`}
          </pre>
        </div>

        {/* Protocol 2: Report Comment */}
        <div className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm" id="protocol-report">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">POST</span>
            <span className="font-mono text-slate-800 font-medium">/api/devices/report-comment</span>
          </div>
          <h5 className="font-medium text-slate-900 mb-1">2. 新评论拦截上报</h5>
          <p className="text-xs text-slate-500 mb-3">
            手机终端监控模块通过轮询通知中心或DOM结构，当检测到新评论通知时，提取评论要素并上报至网页管理后台。
          </p>
          <pre className="bg-slate-950 text-indigo-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`{
  "terminalId": "phone_01",
  "commentId": "xhs_c_1209348",
  "commenterName": "吃货小张",
  "content": "求衣服链接！多少钱？",
  "postTitle": "今日日常穿搭分享",
  "time": 1689849201000
}`}
          </pre>
        </div>

        {/* Protocol 3: Commands Polling */}
        <div className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm" id="protocol-poll">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">GET</span>
            <span className="font-mono text-slate-800 font-medium">/api/devices/:id/commands</span>
          </div>
          <h5 className="font-medium text-slate-900 mb-1">3. 回复命令拉取 (Polling/SSE)</h5>
          <p className="text-xs text-slate-500 mb-3">
            手机终端以 3~5 秒的频率轮询该接口，拉取网页管理后台下发的回复指令。回复指令包含需要回复的评论ID、回复的文本内容。
          </p>
          <pre className="bg-slate-950 text-indigo-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`[
  {
    "id": "cmd_948123",
    "commentId": "xhs_c_1209348",
    "type": "reply",
    "replyText": "宝子，链接已私信你啦，券后只需79元哦！"
  }
]`}
          </pre>
        </div>

        {/* Protocol 4: Command Complete */}
        <div className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm" id="protocol-complete">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded">POST</span>
            <span className="font-mono text-slate-800 font-medium">/api/devices/command-complete</span>
          </div>
          <h5 className="font-medium text-slate-900 mb-1">4. 模拟回复执行状态上报</h5>
          <p className="text-xs text-slate-500 mb-3">
            终端收到回复指令后，模拟自动点击、打字并发送。执行完成后，向后台报告执行结果，如遇到被限流或敏感词，上报失败原因。
          </p>
          <pre className="bg-slate-950 text-indigo-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`{
  "commentId": "xhs_c_1209348",
  "success": true,
  "errorMsg": "" // 若失败则填充错误信息
}`}
          </pre>
        </div>
      </div>

      {/* Safety & anti-block mechanisms */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5" id="safety-mechanisms">
        <h4 className="font-semibold text-amber-900 flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
          小红书防封号/防检测核心策略 (核心关注点)
        </h4>
        <ul className="list-disc list-inside space-y-2 text-slate-700 text-xs">
          <li>
            <strong className="text-slate-900">拟人化打字输入延迟：</strong> 终端收到指令输入回复内容时，不要一次性塞入文本，应模拟真实手打，每个字设置 100ms - 300ms 的随机时间间隔。
          </li>
          <li>
            <strong className="text-slate-900">操作轨迹随机化：</strong> 点击“回复”及“发送”按钮时，避免点击按钮的绝对物理正中心，应在按钮区域内生成一个随机坐标偏移量，以规避机器人脚本检测。
          </li>
          <li>
            <strong className="text-slate-900">回复频率限制：</strong> 每个小红书账号每小时回复限制在 30~50 条以内。如遇到高频流量，后台监控队列应自动进行排队和时间稀释，避免触发小红书系统保护。
          </li>
          <li>
            <strong className="text-slate-900">一机一IP一账号：</strong> 强烈建议手机终端连接真实物理手机（通过4G/5G流量），不要使用公共WiFi导致多台设备共用同一出口IP。
          </li>
        </ul>
      </div>
    </div>
  );
}
