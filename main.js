const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let messages = [
  {
    role: "system",
    content: `당신은 요리 재료 추천 전문가 AI입니다. 다음 순서를 따라 사용자의 취향에 맞는 요리 재료를 추천합니다:
    1) 오늘 하고 싶은 요리를 물어본 후,
    2) 좋아하는 고기가 있나요?,
    3) 싫어하는 고기가 있나요?,
    4) 좋아하는 채소가 있나요?,
    5) 싫어하는 채소가 있나요?,
    6) 알러지가 있는 재료가 있나요? 라고 순서대로 묻습니다.
    마지막으로 그 정보를 바탕으로 적절한 재료를 추천하고 요리 이모지를 사용하여 따뜻하게 응답하세요.`
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
  message.innerHTML = content;
  chatbox.appendChild(message);
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
