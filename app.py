from flask import Flask, render_template, jsonify, Response, request
import threading
import queue
import json

app = Flask(__name__)

click_count = 0
count_lock = threading.Lock()

clients = []
clients_lock = threading.Lock()

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
                yield "data: {\"status\": \"connected\"}\n\n"
                while True:
                    msg = q.get()
                    yield f"data: {msg}\n\n"
            finally:
                with clients_lock:
                    if q in clients:
                        clients.remove(q)
        
    
    return Response(event_stream(), mimetype="text/event-stream")


@app.route("/chat", methods = ["POST"])
def chat_endpoint():
    data = request.json
    message_json = json.dumps(data)

    with clients_lock:
        for q in clients:
            q.put(message_json)

    return jsonify({"status": "sent"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", threaded=True)