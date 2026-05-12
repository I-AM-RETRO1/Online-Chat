from flask import Flask, render_template, jsonify, Response, request
from json import JSONDecodeError
import threading
import queue
import json

app = Flask(__name__)

clients = []
clients_lock = threading.Lock()
file_lock = threading.Lock()

with open('templates/chat.json', 'w') as f:
    json.dump([], f)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/stream")
def stream():

    q = queue.Queue()
    with clients_lock:
        clients.append(q)

    def event_stream():
        try:
            with open("templates/chat.json", "r") as f:
                history = json.load(f)
                for old_msg in history:
                    yield f"data: {json.dumps(old_msg)}\n\n"
        except (FileNotFoundError, JSONDecodeError):
            pass

        try:
            yield 'data: {"status": "connected"}\n\n'
            while True:
                msg = q.get()
                yield f"data: {msg}\n\n"
        finally:
            with clients_lock:
                if q in clients:
                    clients.remove(q)

    return Response(event_stream(), mimetype="text/event-stream")


@app.route("/chat", methods=["POST"])
def chat_endpoint():
    data = request.json
    message_json = json.dumps(data)

    save_message(data)

    with clients_lock:
        for q in clients:
            q.put(message_json)

    return jsonify({"status": "sent"})


def save_message(new_msg):
    with file_lock:
        try:
            # 1. Read existing messages
            with open("templates/chat.json", "r") as f:
                chat_history = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            chat_history = []

        chat_history.append(new_msg)

        with open("templates/chat.json", "w") as f:
            json.dump(chat_history, f, indent=4)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", threaded=True)
