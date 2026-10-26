-- AlterTable
ALTER TABLE "ocorrencias_amostras" ADD COLUMN     "custoDesperdicio" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "reagentes_estoque" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "lote" TEXT NOT NULL,
    "dataValidade" TIMESTAMP(3) NOT NULL,
    "quantidadeAtual" DECIMAL(10,2) NOT NULL,
    "quantidadeMinima" DECIMAL(10,2) NOT NULL,
    "custoUnitario" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reagentes_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumos_reagentes" (
    "id" TEXT NOT NULL,
    "exameId" TEXT NOT NULL,
    "reagenteEstoqueId" TEXT NOT NULL,
    "quantidadeConsumida" DECIMAL(10,2) NOT NULL,
    "itemAtendimentoId" TEXT,
    "dataConsumo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumos_reagentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_qualidade" (
    "id" TEXT NOT NULL,
    "tituloPop" TEXT NOT NULL,
    "descricaoFalha" TEXT NOT NULL,
    "acaoCorretiva" TEXT NOT NULL,
    "dataRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsavelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_qualidade_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "consumos_reagentes" ADD CONSTRAINT "consumos_reagentes_exameId_fkey" FOREIGN KEY ("exameId") REFERENCES "exames"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumos_reagentes" ADD CONSTRAINT "consumos_reagentes_reagenteEstoqueId_fkey" FOREIGN KEY ("reagenteEstoqueId") REFERENCES "reagentes_estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumos_reagentes" ADD CONSTRAINT "consumos_reagentes_itemAtendimentoId_fkey" FOREIGN KEY ("itemAtendimentoId") REFERENCES "itens_atendimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
