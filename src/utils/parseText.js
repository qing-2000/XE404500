/**
 * 简易中文日程文本解析器
 * 支持句式举例：
 * - 明天下午三点开会
 * - 5月30日上午10点看牙医
 * - 后天中午12点午餐
 * - 2026-06-01 14:00 项目汇报
 * 返回 FullCalendar 事件对象或 null
 */
export function parseTextToEvent(text) {
  if (!text.trim()) return null;

  const now = new Date();
  let targetDate = null;
  let targetTime = '09:00'; 
  let title = text;

  const datePatterns = [
    { regex: /明天/, handler: () => new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) },
    { regex: /后天/, handler: () => new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2) },
    { regex: /今天/, handler: () => new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
    { regex: /(\d{1,2})月(\d{1,2})[日号]?/, handler: (m) => new Date(now.getFullYear(), parseInt(m[1]) - 1, parseInt(m[2])) },
    { regex: /(\d{4})-(\d{1,2})-(\d{1,2})/, handler: (m) => new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])) }
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern.regex);
    if (match) {
      targetDate = pattern.handler(match);
      title = title.replace(match[0], '').trim();
      break;
    }
  }

  // 如果没有匹配到日期，默认明天
  if (!targetDate) {
    targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  }

  const timePatterns = [
    { regex: /(早上|上午|中午|下午|晚上)?(\d{1,2})[点:：](\d{0,2})?/, handler: (m) => {
      let hour = parseInt(m[2]);
      const minute = m[3] ? parseInt(m[3]) : 0;
      const period = m[1];

      if (period === '下午' && hour < 12) hour += 12;
      else if (period === '中午' && hour < 12) hour += 12;
      else if (period === '晚上' && hour < 20) hour += 12;
      else if (period === '早上' || period === '上午') { /* 不变 */ }

      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }},
    { regex: /(\d{1,2}):(\d{2})/, handler: (m) => `${m[1].padStart(2, '0')}:${m[2]}` }
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
    extendedProps: {
      location: '',
      locationUrl: '',
      person: '',
      description: ''
    }
  };
}