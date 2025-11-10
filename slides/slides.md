---
theme: default
title: Service Essentials Workshop
info: |
  ## Slides for Service Essentials Training
mdc: true
---

# Service Essentials Workshop
MindX Engineering

---

# Agenda

1. Ground rules
2. Pre-work
3. Target app overview
4. Hexagon architecture overview
5. DDD (Domain Driven Design)

---

# Ground rules

1. Participants do code, not just watch
2. No direct AI-generated codes, every changes made by human 
3. AI can be used to investigate bugs or issues, Q&A, brainstorm, generate samples code 
3. No process enforced or production codes expected

---

# Pre-work

1. Clone the repo and checkout to the zero version

```
git clone git@github.com:techteammindx/mindx-service-essentials.git
git checkout v0.0.0

```

2. Prepare NodeJS 22.x

```
# Install volta
curl https://get.volta.sh | bash

# Switch to Node 22.x
volta install node@22

# Install pnpm
volta install pnpm
```

3. Get infrastructure dependencies to work

```
docker compose up -d
```

4. Getting started with NestJS

```
npm i -g nestjs/cli
nest new . --package-manager pnpm
```
---

# Target app overview

<div class="flex items-center justify-center h-full">

![Target app overview](./images/app-overview.svg)

</div>

---
layout: image-left

image: images/hexagon-overview.svg

backgroundSize: contain

---

## Hexagon Architecture Overview

- **Infrastructure (Infra)**: Frameworks and Tools
  - Ins: REST API, GraphQL, GRPC Calls, Kafka Consumers ...
  - Outs: MongoDB, PostgresDB, GRPC Services, Kafka Producers ...

- **Application (App)**: Business Logic

- **Transport and Data Source**: Isolation layers between App and Infra
  - **Transport**:  Isolation of the incoming Transport protocol (Infra Ins)
  - **Data source**: Isolation of Data persistence or Event publishing (Infra Outs)

---
layout: image-left

image: images/hexagon-with-ddd.svg

backgroundSize: contain

---

## DDD Architecture Overview

- **Goal**: Centralization of business rules
- **Approach**:
  1. Tie data and business rules together in domain objects, AND
  2. Use them as the smallest units of domain transactions

