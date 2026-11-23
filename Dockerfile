FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY static ./static
COPY tools/restore_catalogue.py tools/mongo_support.py ./tools/
COPY data/catalogue.mongodb.zip ./data/

EXPOSE 8047
CMD ["python", "-m", "backend", "--host", "0.0.0.0"]
