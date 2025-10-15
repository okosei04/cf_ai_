const chatEl = document.getElementById('chat');
const form = document.getElementById('composer');
const input = document.getElementById('message');
const modelInput = document.getElementById('model');
const micBtn = document.getElementById('mic');

const lastModel = localStorage.getItem('model');
if (lastModel) modelInput.value = lastModel;

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  const model = modelInput.value.trim();
  if (model) localStorage.setItem('model', model);

  addMessage('user', text);
  const thinking = document.createElement('div');
  thinking.className = 'msg assistant';
  thinking.textContent = 'Thinking…';
  chatEl.appendChild(thinking);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, model })
    });
    const data = await res.json();
    chatEl.removeChild(thinking);
    if (!res.ok) {
      addMessage('assistant', `Error: ${data.error || res.status}`);
    } else {
      addMessage('assistant', data.reply);
    }
  } catch (err) {
    chatEl.removeChild(thinking);
    addMessage('assistant', `Network error: ${err.message || err}`);
  }
});

// Basic voice input via Web Speech API (if available)
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new Recognition();
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  let isActive = false;

  rec.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    input.value = transcript;
    form.requestSubmit();
  };
  rec.onend = () => {
    isActive = false;
    micBtn.textContent = '🎤';
  };
  micBtn.addEventListener('click', () => {
    if (isActive) {
      rec.stop();
    } else {
      try { rec.start(); isActive = true; micBtn.textContent = '⏹'; } catch {}
    }
  });
} else {
  micBtn.disabled = true;
  micBtn.title = 'Voice input not supported in this browser';
}


