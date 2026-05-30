function chineseToNumber(str) {
  const map = { '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
  if (!str) return 0;
  if (str in map) return map[str];          // 单个字 0-10
  if (str.startsWith('十')) {               // 十一 ~ 十九
    const unit = str[1];
    return 10 + (map[unit] || 0);
  }
  if (str.endsWith('十')) {                 // 二十、三十
    return (map[str[0]] || 0) * 10;
  }
  // 如 "二十三"
  const parts = str.split('十');
  if (parts.length === 2) {
    return (map[parts[0]] || 0) * 10 + (map[parts[1]] || 0);
  }
  return 0;
}

function getNumber(digitStr, chineseStr) {
  if (digitStr) return parseInt(digitStr, 10);
  if (chineseStr) return chineseToNumber(chineseStr);
  return 0;
}
export function parseTextToEvent(text) {
  if (!text.trim()) return null;

  const now = new Date();
  let targetDate = null;
  let targetTime = '09:00'; 
  let title = text;

  const datePatterns = [
    {
      regex: /明天/,
      handler: () => new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    },
    {
      regex: /后天/,
      handler: () => new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)
    },
    {
      regex: /今天/,
      handler: () => new Date(now.getFullYear(), now.getMonth(), now.getDate())
    },
    {
      regex: /(?:(\d{1,2})|([零一二三四五六七八九十]{1,3}))月\s*(?:(\d{1,2})|([零一二三四五六七八九十]{1,3}))[日号]?/,
      handler: (m) => {
        const month = getNumber(m[1], m[2]);
        const day = getNumber(m[3], m[4]);
        return new Date(now.getFullYear(), month - 1, day);
      }
    },
    {
      regex: /(\d{4})-(\d{1,2})-(\d{1,2})/,
      handler: (m) => new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]))
    }
  ];

  for (const pattern of datePatterns) {
    const match = title.match(pattern.regex);
    if (match) {
      targetDate = pattern.handler(match);
      title = title.replace(match[0], '').trim();
      break;
    }
  }

const timePatterns = [
    {
      regex: /(早上|上午|中午|下午|晚上)?\s*(?:(\d{1,2})|([零一二三四五六七八九十]{1,3}))点(?:(\d{1,2})分?)?/,
      handler: (m) => {
        let hour = getNumber(m[2], m[3]);
        const minute = m[4] ? parseInt(m[4]) : 0;
        const period = m[1];

        if (period === '下午' && hour < 12) hour += 12;
        else if (period === '中午' && hour < 12) hour += 12;
        else if (period === '晚上' && hour < 20) hour += 12;

        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
    },
    {
      regex: /(\d{1,2}):(\d{2})/,
      handler: (m) => `${m[1].padStart(2, '0')}:${m[2]}`
    }
  ];

  for (const pattern of timePatterns) {
    const match = title.match(pattern.regex);
    if (match) {
      targetTime = pattern.handler(match);
      title = title.replace(match[0], '').trim();
      break;
    }
  }

  title = title.replace(/^(去|要|在|到|进行|参加)/, '').trim();
  if (!title) title = '未命名事件';

  const dateStr = targetDate.toISOString().slice(0, 10);
  const start = `${dateStr}T${targetTime}:00`;

  return {
    title,
    start,
    allDay: false,
    priority:"medium",
    extendedProps: {
      location: '',
      locationUrl: '',
      person: '',
      description: ''
    }
  };
}