const messageBoard = document.getElementById("message-board")
const rootElement = document.documentElement

const sendBox = document.getElementById("send-box")
const sendBtn = document.getElementById("send-btn")
const nameBox = document.getElementById("name")
const nameBtn = document.getElementById("name-submit")
const mask = document.getElementById("mask");
const profileMenu = document.getElementById("profileMenu")

const themeSelector = document.getElementById('theme-selector')

let statusEl = document.getElementById("status")
let chat = []
let currName = ""

const source = new EventSource("/stream")

source.onmessage = function (e) {
    const data = JSON.parse(e.data)

    if (data.status === "connected") {
        statusEl.textContent = "Live"
        return
    }

    chat.push(data)
    renderMessages()
}

async function sendMessage(text) {
    await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usr: currName, msg: text }),
    })
}

function renderMessages() {
    messageBoard.innerHTML = "";
    for (let i = chat.length - 1; i >= 0; i--) {
        messageBoard.innerHTML += `
            <div class="msgs">
                <div class="usr"><strong style="font-size: 20px !important;">${chat[i].usr}</strong></div>
                <div class="msg">${chat[i].msg}</div>
                <br><br>
            </div>
        `
    }
}

nameBtn.onclick = function () {
    currName = nameBox.value.trim()
    if (currName) nameBtn.textContent = "Name Set!"
}

sendBtn.onclick = function () {
    const text = sendBox.value.trim()

    if (currName === "") { alert("Please set your name first!"); return }
    else if (text === "") { alert("Please write something!"); return }

    sendMessage(text)
    sendBox.value = ""
}

sendBox.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && currName !== "") {
        sendBtn.click()
    }
})

const applyTheme = (theme) => {
    rootElement.setAttribute('data-theme', theme)
    localStorage.setItem('user-theme', theme)
    themeSelector.value = theme
}

themeSelector.addEventListener('change', (e) => {
    applyTheme(e.target.value)
})

const savedTheme = localStorage.getItem('user-theme')
if (savedTheme) {
    applyTheme(savedTheme)
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark')
}

function openNav() {
    profileMenu.style.width = "75%"
    profileMenu.style.height = "auto"
    mask.style.display = "block";
}

function closeNav() {
    profileMenu.style.width = "0%"
    mask.style.display = "none"
}

