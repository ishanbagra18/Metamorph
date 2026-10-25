"""
WebSocket Manager for Metamorph.
Streams live migration progress, compiler logs, and file diff updates to the frontend.
"""
from __future__ import annotations

import asyncio
import json
import logging
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("metamorph.ws")


class WebSocketManager:
    def __init__(self):
        # run_id -> set of active WebSockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, run_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(run_id, set()).add(websocket)
        logger.info(f"WebSocket client connected to run_id: {run_id}")

    def disconnect(self, run_id: str, websocket: WebSocket):
        if run_id in self.active_connections:
            self.active_connections[run_id].discard(websocket)
            if not self.active_connections[run_id]:
                del self.active_connections[run_id]
        logger.info(f"WebSocket client disconnected from run_id: {run_id}")

    async def broadcast(self, run_id: str, event_type: str, data: dict):
        """Sends a JSON event to all clients listening to a run_id."""
        if run_id not in self.active_connections:
            return

        message = json.dumps({"type": event_type, "data": data}, default=str)
        dead_sockets = set()

        for ws in self.active_connections[run_id]:
            try:
                await ws.send_text(message)
            except Exception:
                dead_sockets.add(ws)

        for dead in dead_sockets:
            self.disconnect(run_id, dead)


ws_manager = WebSocketManager()
