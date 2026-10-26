"""
Metamorph Backend Entrypoint.
FastAPI Application serving REST endpoints and WebSocket live-stream for JS -> TS migrations.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router
from app.api.ws import ws_manager
from app.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("metamorph.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🦋 Starting Metamorph Migration Engine...")
    logger.info(f"LLM Provider: {settings.DEFAULT_LLM_PROVIDER} | Sandbox Mode: {settings.SANDBOX_MODE}")
    yield
    logger.info("🦋 Shutting down Metamorph Engine.")


app = FastAPI(
    title="Metamorph: Migration Agent (JS -> TS)",
    description="Autonomous, self-correcting agent that converts Node.js/Express JavaScript repos to TypeScript.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(api_router, prefix="/api")


@app.websocket("/ws/{run_id}")
async def websocket_endpoint(websocket: WebSocket, run_id: str):
    await ws_manager.connect(run_id, websocket)
    try:
        while True:
            # Keep-alive ping/pong
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(run_id, websocket)


from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("ws") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            pass
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    async def root():
        return {
            "name": "Metamorph Migration Engine",
            "version": "1.0.0",
            "status": "online",
            "docs_url": "/docs"
        }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
