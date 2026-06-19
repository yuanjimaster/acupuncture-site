(function() {
  var widget = document.createElement('div');
  widget.id = 'ai-widget';
  widget.innerHTML = '<button id="ai-toggle" aria-label="Open AI Assistant">' +
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
    '</button>' +
    '<div id="ai-panel" class="ai-hidden">' +
      '<div id="ai-header">' +
        '<div id="ai-tabs">' +
          '<button class="ai-tab ai-tab-active" data-tab="chat">Chat</button>' +
          '<button class="ai-tab" data-tab="search">Search</button>' +
        '</div>' +
        '<button id="ai-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div id="ai-chat-view">' +
        '<div id="ai-messages"><div class="ai-msg ai-bot">Hi! I\'m the AI assistant for Dr. Huo\'s clinic. Ask me about treatments, pricing, hours, or anything else!</div></div>' +
        '<div id="ai-input-wrap">' +
          '<input id="ai-input" type="text" placeholder="Ask a question..." maxlength="500" />' +
          '<button id="ai-send">Send</button>' +
        '</div>' +
      '</div>' +
      '<div id="ai-search-view" class="ai-hidden">' +
        '<div id="ai-search-wrap">' +
          '<input id="ai-search-input" type="text" placeholder="Search the site..." maxlength="200" />' +
          '<button id="ai-search-btn">Search</button>' +
        '</div>' +
        '<div id="ai-search-results"></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(widget);

  var style = document.createElement('style');
  style.textContent = '#ai-widget{position:fixed;bottom:20px;right:20px;z-index:9999;font-family:system-ui,-apple-system,sans-serif}' +
    '#ai-toggle{width:56px;height:56px;border-radius:50%;background:#8B0000;color:#fff;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;transition:transform .2s}' +
    '#ai-toggle:hover{transform:scale(1.1)}' +
    '#ai-panel{width:360px;max-width:calc(100vw - 40px);height:480px;max-height:calc(100vh - 100px);background:#fff;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.2);display:flex;flex-direction:column;overflow:hidden}' +
    '.ai-hidden{display:none!important}' +
    '#ai-header{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#8B0000;color:#fff}' +
    '#ai-tabs{display:flex;gap:4px}' +
    '.ai-tab{background:transparent;color:rgba(255,255,255,.7);border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500}' +
    '.ai-tab-active{background:rgba(255,255,255,.2);color:#fff}' +
    '#ai-close{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;padding:0 4px}' +
    '#ai-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}' +
    '.ai-msg{padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;max-width:85%;word-wrap:break-word}' +
    '.ai-bot{background:#f0f0f0;color:#333;align-self:flex-start;border-bottom-left-radius:4px}' +
    '.ai-user{background:#8B0000;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}' +
    '.ai-typing{color:#999;font-style:italic;font-size:13px;padding:4px 14px}' +
    '#ai-chat-view{flex:1;display:flex;flex-direction:column}' +
    '#ai-input-wrap{display:flex;padding:8px;border-top:1px solid #eee;gap:6px}' +
    '#ai-input{flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;outline:none}' +
    '#ai-input:focus{border-color:#8B0000}' +
    '#ai-send{background:#8B0000;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500}' +
    '#ai-send:disabled{opacity:.5;cursor:not-allowed}' +
    '#ai-search-view{flex:1;display:flex;flex-direction:column}' +
    '#ai-search-wrap{display:flex;padding:12px;gap:6px}' +
    '#ai-search-input{flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:8px;font-size:14px;outline:none}' +
    '#ai-search-input:focus{border-color:#8B0000}' +
    '#ai-search-btn{background:#8B0000;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px}' +
    '#ai-search-results{flex:1;overflow-y:auto;padding:0 12px 12px}' +
    '.ai-result{display:block;padding:10px;margin:6px 0;background:#f8f8f8;border-radius:8px;text-decoration:none;color:#333;border:1px solid #eee;transition:border-color .2s}' +
    '.ai-result:hover{border-color:#8B0000}' +
    '.ai-result-title{font-weight:600;color:#8B0000;font-size:14px}' +
    '.ai-result-url{font-size:12px;color:#888;margin-top:2px}' +
    '.ai-summary{padding:10px;margin:8px 0;background:#fff8f0;border-radius:8px;font-size:13px;line-height:1.5;color:#555;border-left:3px solid #8B0000}' +
    '@media(max-width:480px){#ai-panel{width:calc(100vw - 20px);height:calc(100vh - 80px);bottom:0;right:0;border-radius:12px 12px 0 0}#ai-widget{bottom:10px;right:10px}}';
  document.head.appendChild(style);

  var toggle = document.getElementById('ai-toggle');
  var panel = document.getElementById('ai-panel');
  var closeBtn = document.getElementById('ai-close');
  var input = document.getElementById('ai-input');
  var sendBtn = document.getElementById('ai-send');
  var messages = document.getElementById('ai-messages');
  var searchInput = document.getElementById('ai-search-input');
  var searchBtn = document.getElementById('ai-search-btn');
  var searchResults = document.getElementById('ai-search-results');
  var chatView = document.getElementById('ai-chat-view');
  var searchView = document.getElementById('ai-search-view');
  var tabs = document.querySelectorAll('.ai-tab');
  var history = [];

  toggle.addEventListener('click', function() {
    panel.classList.toggle('ai-hidden');
    toggle.classList.toggle('ai-hidden');
    if (!panel.classList.contains('ai-hidden')) input.focus();
  });

  closeBtn.addEventListener('click', function() {
    panel.classList.add('ai-hidden');
    toggle.classList.remove('ai-hidden');
  });

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('ai-tab-active'); });
      tab.classList.add('ai-tab-active');
      if (tab.dataset.tab === 'chat') {
        chatView.classList.remove('ai-hidden');
        searchView.classList.add('ai-hidden');
      } else {
        chatView.classList.add('ai-hidden');
        searchView.classList.remove('ai-hidden');
        searchInput.focus();
      }
    });
  });

  function addMessage(text, role) {
    var div = document.createElement('div');
    div.className = 'ai-msg ' + (role === 'user' ? 'ai-user' : 'ai-bot');
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function sendMessage() {
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    addMessage(text, 'user');
    history.push({ role: 'user', content: text });
    sendBtn.disabled = true;

    var typing = document.createElement('div');
    typing.className = 'ai-typing';
    typing.textContent = 'Thinking...';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: history.slice(-6) })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      typing.remove();
      var reply = data.reply || data.error || 'Sorry, I could not process that.';
      addMessage(reply, 'bot');
      history.push({ role: 'assistant', content: reply });
      sendBtn.disabled = false;
      input.focus();
    })
    .catch(function() {
      typing.remove();
      addMessage('Sorry, the AI assistant is temporarily unavailable. Please call (718) 445-0608 for assistance.', 'bot');
      sendBtn.disabled = false;
    });
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage();
  });

  function doSearch() {
    var query = searchInput.value.trim();
    if (!query) return;
    searchResults.innerHTML = '<div class="ai-typing">Searching...</div>';

    fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      searchResults.innerHTML = '';
      if (data.summary) {
        var sum = document.createElement('div');
        sum.className = 'ai-summary';
        sum.textContent = data.summary;
        searchResults.appendChild(sum);
      }
      if (data.results && data.results.length > 0) {
        data.results.forEach(function(r) {
          var a = document.createElement('a');
          a.className = 'ai-result';
          a.href = r.url;
          a.innerHTML = '<div class="ai-result-title">' + r.title + '</div><div class="ai-result-url">acupuncturistusa.com' + r.url + '</div>';
          searchResults.appendChild(a);
        });
      } else {
        searchResults.innerHTML = '<div class="ai-typing">No results found. Try different keywords.</div>';
      }
    })
    .catch(function() {
      searchResults.innerHTML = '<div class="ai-typing">Search unavailable. Please try again.</div>';
    });
  }

  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doSearch();
  });
})();
