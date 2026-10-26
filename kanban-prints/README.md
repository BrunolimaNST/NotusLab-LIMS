# NotusLab LIMS — Registro de Gestão Ágil (kanban-prints/)

Esta pasta armazena as capturas de tela (prints) que comprovam a evolução do quadro Kanban utilizado pela dupla durante o ciclo de desenvolvimento de software da disciplina.

## Ferramenta Utilizada
- **Plataforma:** GitHub Projects (ou Trello / Jira / Notion)
- **Metodologia:** Kanban com limite de WIP (Work In Progress) e Sprints de entrega contínua.

## Estrutura Recomendada de Capturas

Para obter nota máxima na avaliação do Prof. Willen Leolatto Carneiro, salve os prints nesta pasta nomeando-os de acordo com a evolução temporal:

1. `01-planejamento-backlog.png`: Visualização inicial das User Stories e Épicos levantados no Backlog.
2. `02-sprint-1-infra-backend.png`: Desenvolvimento da infraestrutura Docker, PostgreSQL 16, Prisma ORM e rotas base Express com Nodemon.
3. `03-sprint-2-regras-negocio.png`: Implementação do Motor Pré-Analítico (CLSI H3-A6), Recoleta e Módulo de Qualidade/Custos.
4. `04-sprint-3-frontend-integracao.png`: Construção das telas React SPA, integração com a API REST e validação ponta a ponta.
5. `05-quadro-final-concluido.png`: Quadro com todas as tarefas movidas para a coluna **Done / Concluído**.

## Colunas Padrão do Quadro
- **Backlog:** Itens e requisitos priorizados do sistema.
- **To Do (A Fazer):** Tarefas selecionadas para o ciclo atual de desenvolvimento.
- **In Progress (Em Andamento):** Tarefas sob codificação ativa pela dupla.
- **Review / QA (Revisão):** Testes manuais, auditoria de código e conferência com os requisitos do professor.
- **Done (Concluído):** Funcionalidades entregues, com commits semânticos e integradas à branch principal.
