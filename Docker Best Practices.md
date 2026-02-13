````md
# Docker Best Practices

## Block 1: Base Image and Preparation

### Rule 1  
Minimal base image

Use Alpine, Slim, Distroless, or Scratch images.  
Smaller image size means fewer vulnerabilities and faster builds.

Alpine about 5MB  
Slim about 50MB  
Distroless and Scratch have no shell

Bad:
```dockerfile
FROM ubuntu:latest
````

Good:

```dockerfile
FROM scratch
```

Suitable for static binaries.

### Rule 2

Pin image versions and use correct tags

Never use `latest`.
Today `latest` may be one version, tomorrow another.
Pinned versions guarantee reproducible builds.

Bad:

```dockerfile
FROM python:latest
```

Good:

```dockerfile
FROM python:3.11.4-slim
```

### Rule 3

Use .dockerignore

Exclude unnecessary files from the build context.
This speeds up builds and prevents secrets from entering the image.

Example `.dockerignore`:

```text
.git
node_modules/
.env
logs/
```

## Block 2: Build Optimization

### Rule 4

Layer order and caching

If a layer changes, all following layers are rebuilt.
Place rarely changing steps first.
Place frequently changing code last.

Example:

```dockerfile
COPY package*.json ./
RUN npm ci
COPY . .
```

Dependencies are cached, source code changes often.

### Rule 5

Combine RUN commands and clean cache in the same layer

Each RUN instruction creates a new layer.
Deleted files still remain in previous layers.

Bad:

```dockerfile
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*
```

Good:

```dockerfile
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

### Rule 6

Prefer COPY over ADD

ADD can unpack archives and download URLs.
This makes builds less predictable.

Bad:

```dockerfile
ADD https://example.com/file.tar.gz /app/
```

Good:

```dockerfile
COPY local.txt /app/
```

Use curl or wget inside RUN if downloading is required.

### Rule 7

Multi stage builds

Use multi stage builds to reduce final image size.

Example:

```dockerfile
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN go build -o app

FROM alpine
WORKDIR /app
COPY --from=builder /app/app /app/app
CMD ["./app"]
```

First stage builds the binary.
Second stage contains only runtime artifacts.

### Rule 8

Use BuildKit

BuildKit speeds up builds and supports build secrets.

Enable manually if needed:

```bash
export DOCKER_BUILDKIT=1
docker build .
```

In modern Docker versions, BuildKit is enabled by default.

## Block 3: Security

### Rule 9

Do not run as root

Running as root inside a container is dangerous in case of container escape.

Example:

```dockerfile
RUN addgroup -S app && adduser -S app -G app
COPY --chown=app:app . .
USER app
```

Files are owned by the correct user immediately.

### Rule 10

Use build secrets instead of ARG or ENV

ARG and ENV values are stored in image history.

Bad:

```dockerfile
ARG GITHUB_TOKEN=ghp_xxx
```

Good:

```bash
docker build --secret id=token,src=./token.txt .
```

In Dockerfile:

```dockerfile
RUN --mount=type=secret,id=token \
    TOKEN=$(cat /run/secrets/token) && npm install
```

The secret is used and not persisted.

## Block 4: Stability

### Rule 11

PID 1 and graceful shutdown

Shell processes do not forward signals properly.
Kubernetes sends SIGTERM, which may be ignored.

Use exec or Tini.

Example entrypoint.sh:

```sh
exec node app.js
```

Or in Dockerfile:

```dockerfile
ENTRYPOINT ["/sbin/tini", "--"]
```

### Rule 12

Use HEALTHCHECK

Docker considers a container healthy if the process exists.
The process may be stuck.

Example:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/health || exit 1
```

Exit code 1 marks the container as unhealthy.

### Rule 13

Use Hadolint

Hadolint performs static analysis of Dockerfiles.
It detects latest tags, sudo usage, missing cache cleanup.

Local usage:

```bash
docker run --rm -i hadolint/hadolint < Dockerfile
```

Use the same approach in CI pipelines.

## End of document

```
```
