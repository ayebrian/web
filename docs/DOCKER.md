# Docker

To prevent any new attach-vector, we don't require the use of Docker accounts
in the workflow and Docker Desktop (which also has gray licensing and is not
technically free). Here are some notes to get started if you are unfamiliar with
it.

## Install

Use Linux or MacOS. For linux just install docker, docker-compose, docker-buildx
with your favourite package manager. For MacOS also install colima which is
targeted at launching docker inside a VM and is designed to be as frictionless
as possible.

## Service (MacOS)

Start colima service:

```
colima start
```

This will spin up a lightweight virtual machine for Linux. Docker **only** works
on Linux and that's why it's needed. Docker Desktop also does that.

## Build

```bash
docker buildx build . -t friendly-web --platform linux/amd64
```

This one is faster than `docker build` and the latter one is deprecated.

- `linux/amd64` is the current server architecture

## Compose

After image was built and registered locally, it can be used with
[compose.yaml](compose.yaml). 

```
PORT=3000 docker compose up -d friendly-web 
```
