// URLs映射
const URL_TEMPLATES = {
  artwork: 'https://www.pixiv.net/artworks/{id}',
  user: 'https://www.pixiv.net/users/{id}',
  manga: 'https://www.pixiv.net/artworks/{id}',
  keyword: 'https://www.pixiv.net/tags/{keyword}/artworks?s_mode=s_tag'
};

// 全局变量存储解析后的URL列表
let parsedUrls = [];
let historyRecords = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  const modeSelect = document.getElementById('mode');
  const idsTextarea = document.getElementById('ids');
  const parseBtn = document.getElementById('parseBtn');
  const urlList = document.getElementById('urlList');
  const urlCount = document.getElementById('urlCount');
  const urlListContainer = document.getElementById('urlListContainer');
  const statusDiv = document.getElementById('status');
  const historyList = document.getElementById('historyList');
  const historyContainer = document.getElementById('historyContainer');

  // 页面加载时恢复历史记录
  loadHistory();

  // 解析ID按钮点击事件
  parseBtn.addEventListener('click', function() {
    const mode = modeSelect.value;
    const idsText = idsTextarea.value.trim();

    // 检查输入是否为空
    if (!idsText) {
      showStatus('请输入ID或关键词', 'error');
      return;
    }

    // 从文本中提取ID
    const ids = extractIds(idsText);

    if (ids.length === 0) {
      showStatus('未找到有效的ID或关键词', 'error');
      return;
    }

    // 生成URL列表
    parsedUrls = generateUrls(mode, ids);

    // 显示URL列表
    displayUrls(parsedUrls);

    // 更新URL计数
    urlCount.textContent = parsedUrls.length;

    // 显示URL列表容器
    urlListContainer.style.display = 'block';

    // 保存到历史记录
    saveToHistory(mode, idsText, parsedUrls);

    // 显示成功信息
    showStatus(`成功解析出${parsedUrls.length}个网址`, 'success');
  });

  // 从文本中提取ID的函数
  function extractIds(text) {
    // 使用正则表达式匹配所有可能的ID模式
    // 匹配连续的数字（至少6位，最多12位，适应Pixiv的ID长度）
    const idRegex = /\b\d{6,12}\b/g;
    const matches = text.match(idRegex);

    // 如果找到了匹配项，去重并返回
    if (matches) {
      // 使用Set去重，然后转换回数组
      return [...new Set(matches)];
    }

    // 如果没有找到数字ID，按换行符分割并清理文本
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => {
        // 过滤掉纯数字行（已由正则处理）或其他无效内容
        return !/^\d+$/.test(line) || line.length < 6 || line.length > 12;
      });
  }

  // 根据模式和ID生成URL列表
  function generateUrls(mode, ids) {
    const template = URL_TEMPLATES[mode];

    return ids.map(id => {
      // 确保ID没有前后空格
      const cleanId = id.toString().trim();

      // 替换模板中的占位符
      if (mode === 'keyword') {
        return {
          id: cleanId,
          url: template.replace('{keyword}', encodeURIComponent(cleanId))
        };
      } else {
        return {
          id: cleanId,
          url: template.replace('{id}', cleanId)
        };
      }
    });
  }

  // 显示URL列表
  function displayUrls(urls) {
    // 清空现有列表
    urlList.innerHTML = '';

    // 添加每个URL到列表中
    urls.forEach((item, index) => {
      const urlItem = document.createElement('div');
      urlItem.className = 'url-item';
      urlItem.innerHTML = `
        <div class="url-index">${index + 1}.</div>
        <div class="url-text">${item.url}</div>
      `;

      // 添加点击事件，单独打开该URL
      urlItem.addEventListener('click', function() {
        openUrl(item.url);
        showStatus(`正在打开网页...`, 'success');
      });

      urlList.appendChild(urlItem);
    });
  }

  // 显示历史记录
  function displayHistory() {
    // 清空现有列表
    historyList.innerHTML = '';

    // 如果没有历史记录，隐藏历史容器
    if (historyRecords.length === 0) {
      historyContainer.style.display = 'none';
      return;
    }

    // 显示历史容器
    historyContainer.style.display = 'block';

    // 添加每个历史记录到列表中
    historyRecords.forEach((record, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <div class="history-index">${index + 1}.</div>
        <div class="history-content">
          <div class="history-mode">模式: ${getModeLabel(record.mode)}</div>
          <div class="history-text">内容: ${record.text}</div>
          <div class="history-count">网址数量: ${record.urls.length}</div>
        </div>
        <div class="history-actions">
          <button class="history-open-btn" data-index="${index}">打开</button>
        </div>
      `;

      historyList.appendChild(historyItem);
    });

    // 为历史记录的打开按钮添加事件监听器
    document.querySelectorAll('.history-open-btn').forEach(button => {
      button.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        const record = historyRecords[index];

        // 显示该记录的URL列表
        parsedUrls = record.urls;
        displayUrls(parsedUrls);
        urlCount.textContent = parsedUrls.length;
        urlListContainer.style.display = 'block';

        showStatus(`已加载历史记录: ${record.urls.length}个网址`, 'success');
      });
    });
  }

  // 获取模式标签
  function getModeLabel(mode) {
    const labels = {
      'artwork': '作品ID',
      'user': '画师ID',
      'manga': '漫画ID',
      'keyword': '关键词'
    };
    return labels[mode] || mode;
  }

  // 保存到历史记录
  function saveToHistory(mode, text, urls) {
    // 创建历史记录对象
    const record = {
      mode: mode,
      text: text,
      urls: urls,
      timestamp: new Date().getTime()
    };

    // 添加到历史记录数组开头
    historyRecords.unshift(record);

    // 限制历史记录数量为10条
    if (historyRecords.length > 10) {
      historyRecords = historyRecords.slice(0, 10);
    }

    // 保存到chrome.storage.session
    if (chrome && chrome.storage) {
      chrome.storage.session.set({ 'pixivNavigatorHistory': historyRecords });
    }

    // 更新历史记录显示
    displayHistory();
  }

  // 加载历史记录
  function loadHistory() {
    if (chrome && chrome.storage) {
      chrome.storage.session.get(['pixivNavigatorHistory'], function(result) {
        if (result.pixivNavigatorHistory) {
          historyRecords = result.pixivNavigatorHistory;
          displayHistory();
        }
      });
    }
  }

  // 打开单个URL
  function openUrl(url) {
    // 使用chrome.tabs API来创建新标签页
    if (chrome && chrome.tabs) {
      chrome.tabs.create({ url: url });
    } else {
      // 如果chrome.tabs不可用，回退到window.open
      window.open(url, '_blank');
    }
  }

  // 显示状态信息
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;

    // 3秒后清除状态信息
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = '';
    }, 3000);
  }
});