export const formatDate = (timestamp: number) => {
  const now = new Date();
  const messageDate = new Date(timestamp);

  const diff = now.getTime() - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return messageDate.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][messageDate.getDay()];
  } else {
    return messageDate.toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      year: now.getFullYear() !== messageDate.getFullYear() ? 'numeric' : undefined,
    });
  }
};
