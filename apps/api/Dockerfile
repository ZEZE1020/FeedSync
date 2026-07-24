FROM python:3.13-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libstdc++ && pip install --no-cache-dir uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-cache
COPY app ./app

FROM python:3.13-alpine AS runtime
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PATH="/app/.venv/bin:$PATH"
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/app /app/app
RUN apk add --no-cache libstdc++ \
  && addgroup -S -g 10001 feedsync \
  && adduser -S -D -u 10001 -G feedsync feedsync \
  && mkdir -p /app/data \
  && chown -R feedsync:feedsync /app
ENV PORT=8080
EXPOSE 8080
USER feedsync
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
