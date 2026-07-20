import { Device, CommentMessage, Settings, SystemLog, Command, KeywordRule } from "./types";

// --- INITIAL STATE ---
const DEFAULT_DEVICES: Device[] = [
  {
    id: "phone_01",
    name: "终端01 - iPhone 14 Pro",
    accountName: "美妆测评达人 💄",
    accountAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    status: "online",
    lastHeartbeat: Date.now(),
    fansCount: 12840,
    notesCount: 42,
    activeMode: "ai",
  },
  {
    id: "phone_02",
    name: "终端02 - Xiaomi 13 Ultra",
    accountName: "魔都探店美食家 🍔",
    accountAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    status: "online",
    lastHeartbeat: Date.now() - 15000,
    fansCount: 48320,
    notesCount: 156,
    activeMode: "preset",
  },
  {
    id: "phone_03",
    name: "终端03 - Huawei Mate 60 Pro",
    accountName: "数码极客评测 💻",
    accountAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    status: "offline",
    lastHeartbeat: Date.now() - 400000,
    fansCount: 5600,
    notesCount: 18,
    activeMode: "manual",
  }
];

const DEFAULT_COMMENTS: CommentMessage[] = [
  {
    id: "c_001",
    terminalId: "phone_01",
    terminalName: "终端01 - iPhone 14 Pro",
    accountName: "美妆测评达人 💄",
    postTitle: "干皮真爱粉底液推荐！持妆一整天不卡粉",
    postCover: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150",
    commenterName: "小红薯_9482",
    commenterAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    content: "博主博主，这款粉底液大干皮冬季用着会起皮吗？求回复！",
    time: Date.now() - 3600000 * 2,
    status: "replied",
    replyText: "亲亲，这款专门添加了玻尿酸保湿成分，我们冬季干皮实测只要做好妆前保湿，是完全不会起皮的哦！非常推荐试试~",
    replyTime: Date.now() - 3600000 * 2 + 180000,
  },
  {
    id: "c_002",
    terminalId: "phone_02",
    terminalName: "终端02 - Xiaomi 13 Ultra",
    accountName: "魔都探店美食家 🍔",
    postTitle: "排队3小时也要吃的正宗川味火锅！辣到过瘾",
    postCover: "https://images.unsplash.com/photo-1554679665-f5537f187268?w=150",
    commenterName: "吃货小张",
    commenterAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100",
    content: "地址在哪里呀？人均消费多少钱？",
    time: Date.now() - 3600000 * 1,
    status: "replied",
    replyText: "地址在南京东路88号3楼哦，人均大概130元左右，推荐点他们家的招牌鲜毛肚和麻辣牛肉！",
    replyTime: Date.now() - 3600000 * 1 + 120000,
  }
];

const DEFAULT_SETTINGS: Settings = {
  activeHoursStart: "08:00",
  activeHoursEnd: "23:00",
  keywordRules: [
    { id: "r_1", keyword: "地址", reply: "亲，我们的线下旗舰店地址在：上海市黄浦区南京东路299号。欢迎光临体验！" },
    { id: "r_2", keyword: "多少钱", reply: "亲，这款目前限时尝鲜价仅需89元哦，点击主页橱窗或私信即可获取专属优惠券领券购买~" },
    { id: "r_3", keyword: "色号", reply: "黄一白肤色亲亲，强烈建议首选101瓷白色，上脸非常自然提亮，不会假白哦~" },
    { id: "r_4", keyword: "合作", reply: "商务合作及媒介对接请私信主页或者发送邮件至 matrix_cooperate@163.com，我们会尽快联系您！" }
  ],
  knowledgeBase: "【小红书多矩阵运营系统产品说明书】\n\n1. 关于我们：这是一个专为小红书矩阵运营设计的自动化提效工具，通过模拟器或真实安卓终端配合桌面脚本，实现极速消息监控与半自动/自动回复。\n2. 旗舰粉底液产品信息：名称为「极光水感持妆粉底液」。主打持妆、水润、不暗沉。适合混干皮、干皮使用。敏感肌可用。含有50%玻尿酸精华。\n3. 川味火锅探店信息：店名叫「红九格九宫格火锅」，地址在上海市黄浦区南京东路88号3楼。人均120-150元。招牌：九宫格红油、鲜切嫩牛肉、冷盘鸭血。双十一期间在大众点评上有7.5折抵用券。\n4. 数码评测：本博主主要评测智能手机、平板及智能穿戴，所有评测均为真实客观体验。商务合作请私信。",
  aiPrompt: "你是一个热情专业的小红书矩阵账号代运营客服助手。请基于提供的【知识库】内容，用充满亲和力、多用语气词（如：宝子、亲亲、哦、啦）、符合小红书风格（适当穿插Emoji）的简短文字来回复用户的评论。回答要简洁直接，字数控制在60字以内，不要多余的寒暄，直接切入问题核心解答。",
  isMonitoringActive: true,
};

const DEFAULT_LOGS: SystemLog[] = [
  {
    id: "log_001",
    timestamp: Date.now() - 60000,
    type: "info",
    title: "本地纯Web沙盒系统已就绪",
    description: "当前系统运行在纯前端(Client-Side)沙盒模式中，所有的API请求通过拦截器在浏览器内进行高性能仿真，无需依赖任何后端Node.js服务！操作极其顺畅，开箱即用。",
  },
  {
    id: "log_002",
    timestamp: Date.now() - 30000,
    type: "heartbeat",
    title: "终端上线",
    description: "手机终端 phone_01 (iPhone 14 Pro) 已建立连接并完成设备校验。",
  },
  {
    id: "log_003",
    timestamp: Date.now() - 15000,
    type: "heartbeat",
    title: "终端上线",
    description: "手机终端 phone_02 (Xiaomi 13 Ultra) 已建立连接并完成设备校验。",
  }
];

// --- LOCAL STORAGE ENGINE ---
function getStorage<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
}

function setStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Global mutable cache
let cache = {
  devices: getStorage<Device[]>("xhs_devices", DEFAULT_DEVICES),
  comments: getStorage<CommentMessage[]>("xhs_comments", DEFAULT_COMMENTS),
  settings: getStorage<Settings>("xhs_settings", DEFAULT_SETTINGS),
  systemLogs: getStorage<SystemLog[]>("xhs_system_logs", DEFAULT_LOGS),
  pendingCommands: getStorage<Command[]>("xhs_pending_commands", [])
};

function saveAllCache() {
  setStorage("xhs_devices", cache.devices);
  setStorage("xhs_comments", cache.comments);
  setStorage("xhs_settings", cache.settings);
  setStorage("xhs_system_logs", cache.systemLogs);
  setStorage("xhs_pending_commands", cache.pendingCommands);
}

// Add system log helper
function addLog(type: SystemLog['type'], title: string, description: string, payload?: any) {
  const log: SystemLog = {
    id: `log_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    type,
    title,
    description,
    payload: payload ? JSON.stringify(payload, null, 2) : undefined,
  };
  cache.systemLogs.unshift(log);
  if (cache.systemLogs.length > 300) {
    cache.systemLogs.pop();
  }
  saveAllCache();
}

// Check active hours
function isWithinActiveHours(): boolean {
  const [startH, startM] = cache.settings.activeHoursStart.split(":").map(Number);
  const [endH, endM] = cache.settings.activeHoursEnd.split(":").map(Number);
  
  const now = new Date();
  const currentH = now.getHours();
  const currentM = now.getMinutes();
  
  const currentTimeInMinutes = currentH * 60 + currentM;
  const startTimeInMinutes = startH * 60 + startM;
  const endTimeInMinutes = endH * 60 + endM;
  
  if (startTimeInMinutes <= endTimeInMinutes) {
    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  } else {
    return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes;
  }
}

// Simple rule-based generation
function simulateAIReply(commentContent: string, commenter: string, postTitle: string): string {
  const commentLower = commentContent.toLowerCase();
  
  if (commentLower.includes("起皮") || commentLower.includes("卡粉") || commentLower.includes("粉底")) {
    return "宝子，我们的「极光水感持妆粉底液」主打干皮真爱！含有玻尿酸精华，只要做好日常妆前水乳，冬季用也水润爆表卡粉不复存在哦！✨";
  }
  if (commentLower.includes("地址") || commentLower.includes("在哪") || commentLower.includes("火锅")) {
    return "小吃货宝子！火锅店在南京东路88号3楼红九格哦，人均120左右。大众点评现在有7.5折神仙券，快去打卡冲冲冲！🍲";
  }
  if (commentLower.includes("色号") || commentLower.includes("白")) {
    return "亲亲宝子！黄一白可以直接闭眼入101瓷白色，特别通透提亮！肤色偏自然可以看102号色哦，秒变白皙伪素颜~🎀";
  }
  if (commentLower.includes("合作") || commentLower.includes("推广") || commentLower.includes("商务")) {
    return "宝子好呀！商务合作可以直接私信我，或者发我们的小邮箱 matrix_cooperate@163.com 笔芯，期待和您合作！📧";
  }
  
  return `回复 @${commenter} : 收到宝子的留言啦！已经把您反馈的问题记录下来，如果有更多关于《${postTitle}》的疑问可以直接私信我们或者继续留言哦，爱您~❤️`;
}

// Process Auto reply
function processAutoReply(comment: CommentMessage, device: Device) {
  if (!cache.settings.isMonitoringActive) {
    addLog("info", "自动回复跳过", `当前系统监控处于关闭状态，评论ID：${comment.id}`);
    return;
  }

  if (!isWithinActiveHours()) {
    addLog("info", "自动回复跳过", `非设定的监控回复时间段 (${cache.settings.activeHoursStart} - ${cache.settings.activeHoursEnd})，评论ID：${comment.id}`);
    comment.status = "pending";
    saveAllCache();
    return;
  }

  const mode = device.activeMode;
  addLog("info", "启动自动分析", `正在处理终端 [${device.name}] 的新评论，模式为：${mode.toUpperCase()}`);

  if (mode === "manual") {
    return;
  }

  let replyText = "";
  
  if (mode === "preset") {
    const matchedRule = cache.settings.keywordRules.find(rule => 
      comment.content.toLowerCase().includes(rule.keyword.toLowerCase())
    );
    if (matchedRule) {
      replyText = matchedRule.reply;
      addLog("ai", "命中关键词规则", `评论内容: "${comment.content}" 命中了关键词 [${matchedRule.keyword}]`);
    } else {
      addLog("info", "未命中关键词", `评论未匹配到任何预设关键词规则，等待人工回复。`);
      return;
    }
  } else if (mode === "ai") {
    comment.status = "ai_generating";
    addLog("ai", "调用前端仿真AI大脑", `开始为 "${comment.content}" 检索本地说明书并生成定制回复...`);
    replyText = simulateAIReply(comment.content, comment.commenterName, comment.postTitle);
  }

  if (replyText) {
    comment.replyText = replyText;
    comment.status = "replying";
    
    const command: Command = {
      id: `cmd_${Math.random().toString(36).substr(2, 9)}`,
      terminalId: device.id,
      commentId: comment.id,
      type: "reply",
      replyText: replyText,
      timestamp: Date.now()
    };
    cache.pendingCommands.push(command);
    saveAllCache();
    
    addLog("reply", "下发回复指令", `成功向终端 [${device.name}] 下发自动回复指令: "${replyText.substring(0, 30)}..."`);
  }
}

// --- MOCK FETCH INTERCEPTOR ---
const originalFetch = window.fetch;

export async function customFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === "string" ? input : (input instanceof URL ? input.toString() : (input as Request).url || "");
  
  // If it's not an API call, delegate to original fetch
  if (!urlStr.includes("/api/")) {
    return originalFetch.call(window, input, init);
  }

  const parsedUrl = new URL(urlStr, window.location.origin);
  const path = parsedUrl.pathname;
  const method = init?.method?.toUpperCase() || "GET";
  const body = init?.body ? JSON.parse(init.body as string) : null;

  // Simulate server lag (e.g. 100ms)
  await new Promise(resolve => setTimeout(resolve, 100));

  let responseData: any = null;
  let status = 200;

  try {
    // 1. GET /api/devices
    if (path === "/api/devices" && method === "GET") {
      const now = Date.now();
      cache.devices = cache.devices.map(d => ({
        ...d,
        status: (now - d.lastHeartbeat < 30000) ? "online" : "offline"
      }));
      responseData = cache.devices;
    }
    
    // 2. POST /api/devices/heartbeat
    else if (path === "/api/devices/heartbeat" && method === "POST") {
      const { id } = body;
      const device = cache.devices.find(d => d.id === id);
      if (device) {
        device.lastHeartbeat = Date.now();
        device.status = "online";
        responseData = { success: true, device };
        saveAllCache();
      } else {
        status = 404;
        responseData = { error: "Device not found" };
      }
    }

    // 3. POST /api/devices/update-mode
    else if (path === "/api/devices/update-mode" && method === "POST") {
      const { id, activeMode } = body;
      const device = cache.devices.find(d => d.id === id);
      if (device) {
        device.activeMode = activeMode;
        addLog("info", "配置变更", `终端 [${device.name}] 运营回复模式修改为: ${activeMode}`);
        responseData = { success: true, device };
        saveAllCache();
      } else {
        status = 404;
        responseData = { error: "Device not found" };
      }
    }

    // 4. POST /api/devices/report-comment
    else if (path === "/api/devices/report-comment" && method === "POST") {
      const { terminalId, commenterName, commenterAvatar, content, postTitle, postCover, commentId } = body;
      const device = cache.devices.find(d => d.id === terminalId);
      
      if (!device) {
        status = 404;
        responseData = { error: "Device not registered" };
      } else {
        const existing = cache.comments.find(c => c.id === commentId);
        if (existing) {
          responseData = { success: true, message: "Comment already reported", comment: existing };
        } else {
          const newComment: CommentMessage = {
            id: commentId || `c_${Math.random().toString(36).substr(2, 9)}`,
            terminalId,
            terminalName: device.name,
            accountName: device.accountName,
            postTitle: postTitle || "无题小红书笔记",
            postCover: postCover || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
            commenterName: commenterName || "匿名用户",
            commenterAvatar: commenterAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
            content,
            time: Date.now(),
            status: "pending"
          };

          cache.comments.unshift(newComment);
          addLog("report", "收到新评论上报", `来自终端 [${device.name}] 监控的账号: "${content.substring(0, 25)}"`);
          saveAllCache();

          // Auto Reply Trigger
          setTimeout(() => {
            processAutoReply(newComment, device);
          }, 300);

          responseData = { success: true, comment: newComment };
        }
      }
    }

    // 5. GET /api/devices/:id/commands
    else if (path.startsWith("/api/devices/") && path.endsWith("/commands") && method === "GET") {
      const parts = path.split("/");
      const id = parts[3]; // /api/devices/{id}/commands
      
      const device = cache.devices.find(d => d.id === id);
      if (device) {
        device.lastHeartbeat = Date.now();
        device.status = "online";
      }

      // Get and clear commands for this device
      const deviceCommands = cache.pendingCommands.filter(c => c.terminalId === id);
      cache.pendingCommands = cache.pendingCommands.filter(c => c.terminalId !== id);
      saveAllCache();

      responseData = deviceCommands;
    }

    // 6. POST /api/devices/command-complete
    else if (path === "/api/devices/command-complete" && method === "POST") {
      const { commentId, success, errorMsg } = body;
      const comment = cache.comments.find(c => c.id === commentId);
      if (comment) {
        if (success) {
          comment.status = "replied";
          comment.replyTime = Date.now();
          addLog("reply", "回复完成上报", `终端 [${comment.terminalName}] 已在小红书APP内成功模拟点击并发送回复。`);
        } else {
          comment.status = "failed";
          comment.errorMsg = errorMsg || "模拟输入点击失败";
          addLog("error", "回复指令执行失败", `终端 [${comment.terminalName}] 模拟点击失败: ${comment.errorMsg}`);
        }
        saveAllCache();
        responseData = { success: true, comment };
      } else {
        status = 404;
        responseData = { error: "Comment not found" };
      }
    }

    // 7. GET /api/comments
    else if (path === "/api/comments" && method === "GET") {
      const statusFilter = parsedUrl.searchParams.get("status");
      const terminalIdFilter = parsedUrl.searchParams.get("terminalId");
      const search = parsedUrl.searchParams.get("search");
      
      let filtered = [...cache.comments];

      if (statusFilter && statusFilter !== "all") {
        filtered = filtered.filter(c => c.status === statusFilter);
      }
      if (terminalIdFilter && terminalIdFilter !== "all") {
        filtered = filtered.filter(c => c.terminalId === terminalIdFilter);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(c => 
          c.content.toLowerCase().includes(s) || 
          c.commenterName.toLowerCase().includes(s) ||
          c.postTitle.toLowerCase().includes(s)
        );
      }

      responseData = {
        total: filtered.length,
        comments: filtered
      };
    }

    // 8. POST /api/comments/manual-reply
    else if (path === "/api/comments/manual-reply" && method === "POST") {
      const { commentId, replyText } = body;
      const comment = cache.comments.find(c => c.id === commentId);
      
      if (!comment) {
        status = 404;
        responseData = { error: "Comment not found" };
      } else {
        const device = cache.devices.find(d => d.id === comment.terminalId);
        if (!device) {
          status = 404;
          responseData = { error: "Device offline or unregistered" };
        } else {
          comment.status = "replying";
          comment.replyText = replyText;

          const command: Command = {
            id: `cmd_${Math.random().toString(36).substr(2, 9)}`,
            terminalId: device.id,
            commentId: comment.id,
            type: "reply",
            replyText: replyText,
            timestamp: Date.now()
          };
          cache.pendingCommands.push(command);
          addLog("reply", "人工下发回复", `客服通过后台向下发回复："${replyText.substring(0, 30)}..."，发送至终端 [${device.name}]`);
          saveAllCache();

          responseData = { success: true, comment };
        }
      }
    }

    // 9. GET /api/settings
    else if (path === "/api/settings" && method === "GET") {
      responseData = cache.settings;
    }

    // 10. POST /api/settings
    else if (path === "/api/settings" && method === "POST") {
      cache.settings = { ...cache.settings, ...body };
      addLog("info", "系统设置更新", "网页管理后台更新了全局监控策略与自动回复参数。");
      saveAllCache();
      responseData = { success: true, settings: cache.settings };
    }

    // 11. POST /api/settings/keyword-rules
    else if (path === "/api/settings/keyword-rules" && method === "POST") {
      const { keyword, reply } = body;
      const newRule: KeywordRule = {
        id: `r_${Math.random().toString(36).substr(2, 9)}`,
        keyword,
        reply
      };
      cache.settings.keywordRules.unshift(newRule);
      addLog("info", "规则添加", `新增关键词回复规则: [${keyword}]`);
      saveAllCache();
      responseData = { success: true, rule: newRule, rules: cache.settings.keywordRules };
    }

    // 12. DELETE /api/settings/keyword-rules/:id
    else if (path.startsWith("/api/settings/keyword-rules/") && method === "DELETE") {
      const parts = path.split("/");
      const id = parts[4];
      const rule = cache.settings.keywordRules.find(r => r.id === id);
      if (rule) {
        cache.settings.keywordRules = cache.settings.keywordRules.filter(r => r.id !== id);
        addLog("info", "规则删除", `删除了关键词规则: [${rule.keyword}]`);
        saveAllCache();
        responseData = { success: true, rules: cache.settings.keywordRules };
      } else {
        status = 404;
        responseData = { error: "Rule not found" };
      }
    }

    // 13. GET /api/logs
    else if (path === "/api/logs" && method === "GET") {
      responseData = cache.systemLogs;
    }

    // 14. POST /api/gemini/generate
    else if (path === "/api/gemini/generate" && method === "POST") {
      const { prompt } = body;
      addLog("ai", "Gemini一键解答", `用户在沙盒测试区提问："${prompt.substring(0, 30)}"`);
      
      const simulatedText = simulateAIReply(prompt, "小红薯_测试", "小红书测试笔记");
      responseData = { text: simulatedText + " (纯前端沙盒极速模式仿真)" };
    }

    // Fallback if not found
    else {
      status = 404;
      responseData = { error: "Not Found in Mock API Router" };
    }

  } catch (error: any) {
    status = 500;
    responseData = { error: error.message || String(error) };
  }

  // Return synthetic mock Response object
  return new Response(JSON.stringify(responseData), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

// Safely override window.fetch and globalThis.fetch
try {
  Object.defineProperty(window, "fetch", {
    value: customFetch,
    writable: true,
    configurable: true,
  });
} catch (err) {
  console.warn("Could not define customFetch on window.fetch, trying globalThis:", err);
  try {
    Object.defineProperty(globalThis, "fetch", {
      value: customFetch,
      writable: true,
      configurable: true,
    });
  } catch (err2) {
    console.error("Could not define customFetch on globalThis either:", err2);
  }
}

