-- CreateEnum
CREATE TYPE "SexoBiologico" AS ENUM ('MASCULINO', 'FEMININO', 'INDETERMINADO');

-- CreateEnum
CREATE TYPE "StatusAtendimento" AS ENUM ('REGISTRADO', 'AGUARDANDO_COLETA', 'EM_PROCESSAMENTO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusAmostra" AS ENUM ('PENDENTE_COLETA', 'COLETADA', 'EM_TRIAGEM', 'APROVADA_TRIAGEM', 'INVALIDADA_RECOLETA', 'EM_ANALISE_INTERNA', 'AGUARDANDO_ENVIO_APOIO', 'ENVIADA_APOIO', 'RESULTADO_RECEBIDO_APOIO', 'ANALISADA', 'LAUDADA_LIBERADA', 'ARQUIVADA_SOROTECA', 'DESCARTADA');

-- CreateEnum
CREATE TYPE "MotivoRejeicaoAmostra" AS ENUM ('HEMOLISE', 'COAGULACAO', 'VOLUME_INSUFICIENTE', 'LIPEMIA_ACENTUADA', 'TUBO_INADEQUADO', 'IDENTIFICACAO_ILEGIVEL', 'MATERIAL_EXTRAVIADO');

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "sexoBiologico" "SexoBiologico" NOT NULL,
    "telefoneWhatsapp" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tubos_coleta" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "corTampaHex" TEXT NOT NULL,
    "aditivoAnticoagulante" TEXT NOT NULL,
    "volumeMinimoMl" DECIMAL(4,2) NOT NULL,
    "ordemCLSI" INTEGER NOT NULL,
    "instrucoesHomogeneizacao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tubos_coleta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exames" (
    "id" TEXT NOT NULL,
    "mnemonico" TEXT NOT NULL,
    "codigoTUSS" TEXT,
    "nome" TEXT NOT NULL,
    "setorLaboratorial" TEXT NOT NULL,
    "tempoJejumHoras" INTEGER NOT NULL DEFAULT 0,
    "orientacoesPreparo" TEXT,
    "prazoDiasUteis" INTEGER NOT NULL DEFAULT 1,
    "precoBaseReais" DECIMAL(10,2) NOT NULL,
    "tuboColetaId" TEXT NOT NULL,
    "requerApoioExterno" BOOLEAN NOT NULL DEFAULT false,
    "laboratorioApoioId" TEXT,

    CONSTRAINT "exames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimentos" (
    "id" TEXT NOT NULL,
    "codigoProtocolo" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "medicoSolicitante" TEXT,
    "status" "StatusAtendimento" NOT NULL DEFAULT 'REGISTRADO',
    "dataHoraEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atendimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amostras" (
    "id" TEXT NOT NULL,
    "codigoBarras" TEXT NOT NULL,
    "atendimentoId" TEXT NOT NULL,
    "tuboColetaId" TEXT NOT NULL,
    "status" "StatusAmostra" NOT NULL DEFAULT 'PENDENTE_COLETA',
    "dataHoraColeta" TIMESTAMP(3),
    "isRecoleta" BOOLEAN NOT NULL DEFAULT false,
    "amostraOriginalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amostras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_atendimentos" (
    "id" TEXT NOT NULL,
    "atendimentoId" TEXT NOT NULL,
    "exameId" TEXT NOT NULL,
    "amostraId" TEXT NOT NULL,
    "precoCobrado" DECIMAL(10,2) NOT NULL,
    "resultado" TEXT,
    "laudoLiberado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "itens_atendimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocorrencias_amostras" (
    "id" TEXT NOT NULL,
    "amostraId" TEXT NOT NULL,
    "motivo" "MotivoRejeicaoAmostra" NOT NULL,
    "descricaoDetalhada" TEXT,
    "textoNotificacaoWhatsApp" TEXT NOT NULL,
    "dataHoraRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ocorrencias_amostras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laboratorios_apoio" (
    "id" TEXT NOT NULL,
    "codigoIdentificador" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "contatoResponsavel" TEXT,
    "telefoneSuporte" TEXT NOT NULL,
    "emailOperacional" TEXT NOT NULL,
    "slaPadraoDiasUteis" INTEGER NOT NULL DEFAULT 3,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "laboratorios_apoio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_cpf_key" ON "pacientes"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "tubos_coleta_codigo_key" ON "tubos_coleta"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "exames_mnemonico_key" ON "exames"("mnemonico");

-- CreateIndex
CREATE UNIQUE INDEX "atendimentos_codigoProtocolo_key" ON "atendimentos"("codigoProtocolo");

-- CreateIndex
CREATE UNIQUE INDEX "amostras_codigoBarras_key" ON "amostras"("codigoBarras");

-- CreateIndex
CREATE UNIQUE INDEX "laboratorios_apoio_codigoIdentificador_key" ON "laboratorios_apoio"("codigoIdentificador");

-- CreateIndex
CREATE UNIQUE INDEX "laboratorios_apoio_cnpj_key" ON "laboratorios_apoio"("cnpj");

-- AddForeignKey
ALTER TABLE "exames" ADD CONSTRAINT "exames_tuboColetaId_fkey" FOREIGN KEY ("tuboColetaId") REFERENCES "tubos_coleta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exames" ADD CONSTRAINT "exames_laboratorioApoioId_fkey" FOREIGN KEY ("laboratorioApoioId") REFERENCES "laboratorios_apoio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amostras" ADD CONSTRAINT "amostras_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "atendimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amostras" ADD CONSTRAINT "amostras_tuboColetaId_fkey" FOREIGN KEY ("tuboColetaId") REFERENCES "tubos_coleta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amostras" ADD CONSTRAINT "amostras_amostraOriginalId_fkey" FOREIGN KEY ("amostraOriginalId") REFERENCES "amostras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_atendimentos" ADD CONSTRAINT "itens_atendimentos_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "atendimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_atendimentos" ADD CONSTRAINT "itens_atendimentos_exameId_fkey" FOREIGN KEY ("exameId") REFERENCES "exames"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_atendimentos" ADD CONSTRAINT "itens_atendimentos_amostraId_fkey" FOREIGN KEY ("amostraId") REFERENCES "amostras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias_amostras" ADD CONSTRAINT "ocorrencias_amostras_amostraId_fkey" FOREIGN KEY ("amostraId") REFERENCES "amostras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
