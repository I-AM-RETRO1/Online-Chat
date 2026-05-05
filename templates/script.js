
const messageBoard = document.getElementById("message-board")

const sendBox = document.getElementById("send-box")
const sendBtn = document.getElementById("send-btn")

const nameBox = document.getElementById("name")
const nameBtn = document.getElementById("name-submit")

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
    for (let i = 0; i < chat.length; i++) {
        messageBoard.innerHTML += `
            <div class="msgs">
                <div class="usr">${chat[i].usr}</div>
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
    sendBox.value = "";
};


// const source = new EventSource("/stream")
// source.onopen = function () {
//     statusEl.textContent = "live"
// }

// source.onmessage = function (e) {
//     countEl.textContent = e.data
// }

// let btn = document.getElementById("btn")
// btn.onclick = function (e) {
//     fetch("/click", { method: "POST" })
// }