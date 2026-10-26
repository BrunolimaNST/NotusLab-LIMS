# NotusLab LIMS — Documentação Suplementar e Diagramas (docs/)

Esta pasta é reservada para artefatos documentais adicionais, diagramas de modelo entidade-relacionamento (DER), manuais e evidências de validação do sistema.

## Conteúdo Disponível

1. **Modelagem de Banco de Dados:**
   - O esquema de dados é mapeado via Prisma ORM em `prisma/schema.prisma` e versionado em `prisma/migrations/`.
   - Banco de dados provisionado via Docker Compose com PostgreSQL 16.

2. **Fluxos Operacionais e Regulatórios:**
   - Padronização internacional de tubos e sequência de flebotomia: **CLSI H3-A6**.
   - Conformidade sanitária e rastreabilidade diagnóstica: **RDC 786/2023 da ANVISA**.

3. **Arquitetura do Sistema:**
   - Consulte o documento completo na raiz: [`arquitetura.md`](../arquitetura.md).
