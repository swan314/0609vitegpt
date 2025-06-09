// main.js
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let messages = [
  {
    role: "system",
    content: `당신은 요리 재료 추천 및 요리법 제안 전문가 AI입니다. 다음 순서를 따라 사용자의 취향에 맞는 요리 재료와 레시피를 추천합니다:
    1) 오늘 하고 싶은 요리를 물어본 후,
    2) 좋아하는 재료(고기, 채소, 과일, 빵 등)가 있나요?,
    3) 싫어하는 재료(고기, 채소, 과일, 빵 등)가 있나요?,
    4) 알러지가 있는 재료가 있나요?,
    5) 더 추가할 사항이 있나요? 라고 순서대로 묻습니다.
    마지막으로, 사용자의 선호를 반영하여 적절한 재료 목록을 한 줄로 나열된 형태로 제시하고,
    이어서 순서가 매겨진 단계별 요리 레시피를 각 줄마다 줄바꿈하여 명확하게 출력해주세요.
    레시피 단계마다 요리 관련 이모지를 포함해주세요.
    레시피 마지막에는 요리 결과 사진이 포함된 큰 이미지를 출력해주세요. (예: ![요리 이미지](이미지 URL))`
  }
];

window.addEventListener("DOMContentLoaded", () => {
  const welcomeMessage = "안녕하세요! 오늘 어떤 요리를 하고 싶으신가요? 🍛";
  messages.push({ role: "assistant", content: welcomeMessage });
  appendMessage(welcomeMessage, "assistant");
});

function appendMessage(content, sender) {
  const message = document.createElement("div");
  message.className = `message ${sender}`;

  // 이미지 포함 여부 확인 및 분리 렌더링
  const parts = content.split(/(!\[.*?\]\(.*?\))/g);
  parts.forEach(part => {
    if (part.startsWith('![')) {
      const match = part.match(/!\[.*?\]\((.*?)\)/);
      if (match) {
        const img = document.createElement("img");
        img.src = match[1];
        img.alt = "요리 이미지";
        img.style.maxWidth = "100%";
        img.style.marginTop = "12px";
        img.style.borderRadius = "16px";
        chatbox.appendChild(img);
      }
    } else {
      const div = document.createElement("div");
      div.innerHTML = part.replace(/\n/g, '<br>');
      div.className = `message ${sender}`;
      chatbox.appendChild(div);
    }
  });

  chatbox.scrollTop = chatbox.scrollHeight;
}

async function fetchGPTResponse(prompt) {
  messages.push({ role: "user", content: prompt });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const reply = data.choices[0].message.content;
  messages.push({ role: "assistant", content: reply });
  return reply;
}

sendBtn.addEventListener("click", async () => {
  const prompt = userInput.value.trim();
  if (!prompt) return;
  appendMessage(prompt, "user");
  userInput.value = "";
  const reply = await fetchGPTResponse(prompt);
  appendMessage(reply, "assistant");
});

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});
