import uvicorn
from app import create_app
from app.config import settings

app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.FLASK_HOST,
        port=settings.FLASK_PORT,
        reload=settings.DEBUG,
    )