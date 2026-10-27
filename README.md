# 🧪 NotusLab LIMS — Laboratory Information Management System

> **Projeto Final de Laboratório de Programação**  
> **Professor:** Willen Leolatto Carneiro  
> **Instituição de Ensino Superior:** Ciência da Computação 
> **Equipe (Trabalho em Dupla):**  
> - **Aluno 1:** Bruno da Silva Lima
> - **Aluno 2:** Cauan Costa  

---

## 📋 1. Apresentação do Projeto

O **NotusLab LIMS** é uma plataforma web completa de Gestão de Informações Laboratoriais (*Laboratory Information Management System*) desenvolvida para clínicas e laboratórios de análises clínicas (caso de estudo: *Cinese Análises Clínicas*).

O sistema resolve três dores críticas do fluxo operacional laboratorial, em rigorosa conformidade com a norma internacional **CLSI H3-A6** e as diretrizes regulatórias da **RDC 786/2023 da ANVISA**:

1. **Inteligência Pré-Analítica (Otimização de Tubos):** Algoritmo determinístico que analisa todos os exames solicitados no atendimento e agrupa exames compatíveis no menor número de tubos físicos de coleta necessários, determinando a sequência exata de flebotomia pela ordem de coleta internacional CLSI (Citrato Azul -> Soro Amarelo -> Heparina Verde -> EDTA Roxo -> Fluoreto Cinza) e unificando orientações de jejum ao paciente.
2. **Motor de Recoleta e Comunicação Humanizada:** Fluxo transacional atômico (ACID) para recusa técnica de amostras (hemólise, coagulação, volume insuficiente), gerando nova amostra rastreável e redigindo automaticamente a notificação humanizada para WhatsApp do paciente.
3. **Gestão de Qualidade e Custos de Desperdício Operacional:** Monitoramento de perdas financeiras por motivo de recusa, controle de estoque mínimo de reagentes críticos e registro de Procedimentos Operacionais Padrão (POPs) com ações corretivas.

---

## 🛠️ 2. Stack Tecnológica Obrigatória

| Componente | Tecnologia | Versão Homologada | Finalidade |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | Node.js | `>= 22.0.0 <= 24.x` | Ambiente de execução JavaScript server-side |
| **Framework Web** | Express.js | `^4.19.2` | Roteamento RESTful e pipeline de middlewares |
| **Live Reload** | Nodemon | `^3.1.x` | Monitoramento e reinicialização contínua em dev |
| **ORM** | Prisma ORM | `^5.22.0` | Modelagem, migrações versionadas e tipagem estrita |
| **Banco de Dados** | PostgreSQL | `16-alpine` | Banco relacional provisionado via container |
| **Infraestrutura** | Docker & Docker Compose | `compose v2+` | Provisionamento isolado do PostgreSQL com volume e healthcheck |
| **Frontend** | React SPA | `^18.3.1` | Interface moderna reativa baseada em componentes |
| **Build Tool** | Vite | `^5.4.x` | Bundler ultrarrápido para o frontend |
| **Estilização** | Tailwind CSS | `^3.4.x` | Design system responsivo e moderno |
| **Validação** | Zod | `^3.23.8` | Validação de esquemas e contratos fail-fast |

---

## 📁 3. Estrutura de Pastas do Repositório

O projeto segue estritamente a topologia de diretórios e arquivos solicitada pela disciplina:

```text
NotusLab LIMS/
├── docs/                     # Pasta para documentação suplementar e imagens
│   └── README.md
├── kanban-prints/            # Prints da evolução do quadro ágil (Kanban)
│   └── README.md
├── prisma/                   # Esquema de dados, migrations e seed do banco
│   ├── migrations/           # Histórico versionado de migrações
│   ├── schema.prisma         # Definição dos modelos relacionais
│   └── seed.ts               # Carga inicial de exames, tubos e dados mestres
├── src/                      # Código-fonte do Backend (Node.js + Express)
│   ├── errors/               # Hierarquia de tratamento centralizado de erros
│   ├── middlewares/          # Middlewares de validação, CORS e error handling
│   ├── routes/               # Declaração semântica de rotas RESTful (/api/v1/...)
│   ├── services/             # Regras de negócio de domínio (Pré-Analítico, Recoleta, Qualidade)
│   ├── app.ts                # Configuração da aplicação Express
│   ├── prisma.ts             # Instância singleton do PrismaClient
│   └── server.ts             # Bootstrapping HTTP e Graceful Shutdown
├── frontend/                 # Código-fonte do Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/       # Componentes visuais reutilizáveis
│   │   ├── pages/            # Telas da aplicação (Recepção, Coleta, Catálogo, Qualidade, Laudos)
│   │   └── services/         # Cliente HTTP (Axios) configurado
│   └── package.json
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore                # Regras de exclusão do Git (ignora node_modules, .env, dist)
├── docker-compose.yml        # Provisionamento do banco PostgreSQL 16
├── nodemon.json              # Configuração do Nodemon para TypeScript
├── arquitetura.md            # Explicação detalhada da arquitetura de software
├── DOCUMENTACAO_IA.md        # Tabela obrigatória de interação e engenharia com IA
├── package.json              # Dependências e scripts do Backend
├── tsconfig.json             # Configurações do compilador TypeScript
└── README.md                 # Apresentação do projeto e instruções de execução
```

---

## 🚀 4. Como Rodar o Projeto Localmente

### 4.1 Pré-requisitos
- **Node.js:** Versão mínima 22.x e máxima 24.x (`node -v`). *(Recomendado uso de nvm / fnm caso possua versão anterior)*.
- **Docker & Docker Compose:** Instalados e em execução (`docker compose version`).
- **Git:** Para clonagem e versionamento semântico.

---

### 4.2 Passo a Passo de Execução

#### 1. Clonar o repositório e entrar na pasta:
```bash
git clone https://github.com/SEU-USUARIO/notuslab-lims.git
cd "NotusLab LIMS"
```

#### 2. Configurar as variáveis de ambiente:
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
*(No Windows PowerShell: `Copy-Item .env.example .env`)*

#### 3. Provisionar o Banco de Dados PostgreSQL 16 via Docker Compose:
Suba o container do banco de dados em segundo plano:
```bash
docker compose up -d
```
Para conferir o status saudável do container:
```bash
docker compose ps
```

#### 4. Instalar as dependências do Backend:
Na raiz do projeto:
```bash
npm install
```

#### 5. Executar as Migrações e a Carga de Dados (Seed):
Gere o Prisma Client, crie as tabelas no PostgreSQL e popule os dados com os exames e tubos padronizados:
```bash
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

#### 6. Iniciar o Backend com Nodemon:
Inicie o servidor Express com recarga automática:
```bash
npm run dev
```
O servidor estará rodando em: **`http://localhost:3333`**  
Verificação de saúde (Health Check): **`http://localhost:3333/api/v1/health`**

---

#### 7. Instalar e Iniciar o Frontend (React + Vite):
Abra um novo terminal e navegue até a pasta `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
A interface web estará disponível em: **`http://localhost:5173`**

---

## 📡 5. Principais Endpoints da API REST

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Healthcheck e status do serviço |
| `GET` | `/api/v1/exams` | Catálogo completo de exames, mnemônicos e tubos |
| `GET` | `/api/v1/tubes` | Catálogo mestre de tubos ordenados por CLSI |
| `POST` | `/api/v1/pre-analytical/calculate-tubes` | Agrupamento inteligente de tubos e ordem de flebotomia |
| `POST` | `/api/v1/samples/:id/recollection` | Registro de recusa técnica e disparo de recoleta atômica |
| `GET` | `/api/v1/quality/costs` | Relatório consolidado de perdas financeiras por mês/ano |
| `GET` | `/api/v1/quality/reagents` | Estoque de reagentes com indicador de nível crítico |
| `POST` | `/api/v1/quality/records` | Registro de POPs de qualidade e ações corretivas |

---

## 🏷️ 6. Convenção de Commits Semânticos (Semantic Commits)

O repositório adota rigorosamente a convenção do **Conventional Commits**:

- `feat:` Nova funcionalidade no sistema (ex: `feat: implementa motor pre-analitico com ordenacao clsi`)
- `fix:` Correção de bug ou falha de tipagem (ex: `fix: corrige validacao de null safety no servico de tubos`)
- `docs:` Alterações em documentação (ex: `docs: adiciona tabela obrigatoria de engenharia em DOCUMENTACAO_IA.md`)
- `style:` Ajustes visuais ou formatação sem alteração de lógica (ex: `style: ajusta paleta tailwind no dashboard de qualidade`)
- `refactor:` Refatoração de código sem alteração de comportamento (ex: `refactor: modulariza rotas de qualidade`)
- `chore:` Tarefas de configuração, docker ou dependências (ex: `chore: configura nodemon e docker-compose com postgres 16`)

---

## 📊 7. Gestão Ágil e Quadro Kanban

O desenvolvimento do NotusLab LIMS foi gerenciado através de fluxo Kanban, estruturado nas seguintes etapas:
- **Backlog:** Levantamento de requisitos e dores laboratoriais.
- **To Do:** Histórias de usuário priorizadas por sprint.
- **In Progress:** Implementação técnica em andamento.
- **Review / QA:** Testes integrados e conferência dos requisitos acadêmicos.
- **Done:** Funcionalidade entregue, testada e commitada semanticamente.

As capturas de tela comprovando a evolução contínua do quadro estão arquivadas na pasta [`kanban-prints/`](./kanban-prints/).
