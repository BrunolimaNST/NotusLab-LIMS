import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dados brutos enriquecidos fornecidos
const dadosExamesBrutos = [
  { codigo: 'HEM01', nome: 'Hemograma Completo', categoria: 'Hematologia', material: 'Sangue Total (EDTA)', tubo_coleta: 'Tubo Roxo', jejum: 'Não obrigatório', preco: 20.00 },
  { codigo: 'HEM02', nome: 'Velocidade de Hemossedimentação (VHS)', categoria: 'Hematologia', material: 'Sangue Total (Citratado)', tubo_coleta: 'Tubo Roxo ou Preto', jejum: 'Não obrigatório', preco: 15.00 },
  { codigo: 'HEM03', nome: 'Coagulograma Completo', categoria: 'Hematologia', material: 'Plasma (Citrato)', tubo_coleta: 'Tubo Azul', jejum: 'Não obrigatório', preco: 35.00 },
  { codigo: 'HEM04', nome: 'Tipagem Sanguínea (ABO/Rh)', categoria: 'Hematologia', material: 'Sangue Total', tubo_coleta: 'Tubo Roxo', jejum: 'Não obrigatório', preco: 25.00 },
  { codigo: 'BIO01', nome: 'Glicemia de Jejum', categoria: 'Bioquímica', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '8 horas', preco: 15.00 },
  { codigo: 'BIO02', nome: 'Hemoglobina Glicada (HbA1c)', categoria: 'Bioquímica', material: 'Sangue Total (EDTA)', tubo_coleta: 'Tubo Roxo', jejum: 'Não obrigatório', preco: 40.00 },
  { codigo: 'BIO03', nome: 'Colesterol Total e Frações', categoria: 'Bioquímica', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '12 horas (Recomendável)', preco: 35.00 },
  { codigo: 'BIO04', nome: 'Triglicerídeos', categoria: 'Bioquímica', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '12 horas (Recomendável)', preco: 20.00 },
  { codigo: 'BIO05', nome: 'Ácido Úrico', categoria: 'Bioquímica', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '8 horas', preco: 18.00 },
  { codigo: 'BIO06', nome: 'Ureia', categoria: 'Bioquímica', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '8 horas', preco: 15.00 },
  { codigo: 'BIO07', nome: 'Creatinina', categoria: 'Bioquímica', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '8 horas', preco: 15.00 },
  { codigo: 'BIO08', nome: 'TGO / AST', categoria: 'Bioquímica', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '4 horas', preco: 18.00 },
  { codigo: 'BIO09', nome: 'TGP / ALT', categoria: 'Bioquímica', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '4 horas', preco: 18.00 },
  { codigo: 'HOR01', nome: 'TSH (Hormônio Tireoestimulante)', categoria: 'Hormônios', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '4 horas', preco: 45.00 },
  { codigo: 'HOR02', nome: 'T4 Livre', categoria: 'Hormônios', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '4 horas', preco: 45.00 },
  { codigo: 'HOR03', nome: 'Testosterona Total', categoria: 'Hormônios', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '4 horas', preco: 55.00 },
  { codigo: 'HOR04', nome: 'Vitamina D (25-OH)', categoria: 'Hormônios', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '4 horas', preco: 75.00 },
  { codigo: 'HOR05', nome: 'Vitamina B12', categoria: 'Hormônios', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '4 horas', preco: 45.00 },
  { codigo: 'IMU01', nome: 'PCR (Proteína C Reativa)', categoria: 'Imunologia', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: 'Não obrigatório', preco: 30.00 },
  { codigo: 'IMU02', nome: 'VDRL (Teste para Sífilis)', categoria: 'Imunologia', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: 'Não obrigatório', preco: 20.00 },
  { codigo: 'IMU03', nome: 'Anti-HIV 1 e 2', categoria: 'Imunologia', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: 'Não obrigatório', preco: 45.00 },
  { codigo: 'IMU04', nome: 'Toxoplasmose (IgG e IgM)', categoria: 'Imunologia', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: 'Não obrigatório', preco: 65.00 },
  { codigo: 'IMU05', nome: 'HBsAg (Hepatite B)', categoria: 'Imunologia', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: 'Não obrigatório', preco: 45.00 },
  { codigo: 'URI01', nome: 'Exame de Urina Tipo 1 (EAS)', categoria: 'Urinálise', material: 'Urina Jato Médio', tubo_coleta: 'Frasco Estéril', jejum: 'Não se aplica', preco: 18.00 },
  { codigo: 'URI02', nome: 'Urocultura com Antibiograma', categoria: 'Microbiologia', material: 'Urina Jato Médio', tubo_coleta: 'Frasco Estéril', jejum: 'Não se aplica', preco: 55.00 },
  { codigo: 'PAR01', nome: 'Parasitológico de Fezes (EPF)', categoria: 'Parasitologia', material: 'Fezes', tubo_coleta: 'Frasco Coletor', jejum: 'Não se aplica', preco: 15.00 },
  { codigo: 'PAR02', nome: 'Pesquisa de Sangue Oculto', categoria: 'Parasitologia', material: 'Fezes', tubo_coleta: 'Frasco Coletor', jejum: 'Não se aplica', preco: 30.00 },
  { codigo: 'MAR01', nome: 'PSA Total e Livre', categoria: 'Imunologia', material: 'Soro', tubo_coleta: 'Tubo Amarelo', jejum: '4 horas', preco: 70.00 },
  { codigo: 'MOL01', nome: 'Teste de Paternidade (DNA)', categoria: 'Genética', material: 'Sangue Total (EDTA)', tubo_coleta: 'Tubo Roxo', jejum: 'Não obrigatório', preco: 450.00 },
  { codigo: 'MOL02', nome: 'Sexagem Fetal', categoria: 'Genética', material: 'Sangue Total (EDTA)', tubo_coleta: 'Tubo Roxo', jejum: 'Não obrigatório', preco: 250.00 },
  { codigo: 'MOL03', nome: 'Painel Respiratório PCR', categoria: 'Biologia Molecular', material: 'Swab Nasofaríngeo', tubo_coleta: 'Tubo com Meio Viral', jejum: 'Não se aplica', preco: 280.00 },
  { codigo: 'TOX01', nome: 'Toxicológico Larga Janela (CNH)', categoria: 'Toxicologia', material: 'Cabelo/Pelos', tubo_coleta: 'Envelope de Coleta', jejum: 'Não se aplica', preco: 180.00 },
  { codigo: 'TOX02', nome: 'Dosagem de Lítio', categoria: 'Toxicologia', material: 'Soro', tubo_coleta: 'Tubo Vermelho (Sem Gel)', jejum: '12 horas após última dose', preco: 40.00 },
  { codigo: 'TOX03', nome: 'Drogas de Abuso (Triagem)', categoria: 'Toxicologia', material: 'Urina', tubo_coleta: 'Frasco Estéril', jejum: 'Não se aplica', preco: 120.00 }
];

async function main() {
  console.log('========================================================================');
  console.log('🌱 NotusLab LIMS - Executando Seed de Exames & Regras Pré-Analíticas...');
  console.log('========================================================================\n');

  // 1. Limpeza / Truncate prévia da tabela de exames conforme solicitado
  console.log('🧹 Realizando limpeza (clean) na tabela de exames e dependências...');
  await prisma.consumoReagente.deleteMany();
  await prisma.itemAtendimento.deleteMany();
  await prisma.exame.deleteMany();
  console.log('✅ Tabela de exames limpa com sucesso!\n');

  // 2. Garantir a existência dos Tubos de Coleta para associação correta
  console.log('🧪 Garantindo cadastro dos tubos e recipientes de coleta...');

  const definicaoTubos = [
    {
      chave: 'Tubo Roxo',
      codigo: 'EDTA_ROXO',
      descricao: 'Tubo Tampa Roxa - K2/K3 EDTA 4ml',
      corTampaHex: '#8E44AD',
      aditivoAnticoagulante: 'EDTA K3',
      volumeMinimoMl: 2.0,
      ordemCLSI: 4,
      instrucoesHomogeneizacao: 'Inverter suavemente de 8 a 10 vezes imediatamente após a coleta.'
    },
    {
      chave: 'Tubo Roxo ou Preto',
      codigo: 'EDTA_VHS_ROXO_PRETO',
      descricao: 'Tubo Tampa Roxa ou Preto - EDTA / Citrato VHS',
      corTampaHex: '#2C3E50',
      aditivoAnticoagulante: 'EDTA / Citrato 3.8%',
      volumeMinimoMl: 2.0,
      ordemCLSI: 4,
      instrucoesHomogeneizacao: 'Inverter suavemente de 8 a 10 vezes.'
    },
    {
      chave: 'Tubo Azul',
      codigo: 'CITRATO_AZUL',
      descricao: 'Tubo Tampa Azul Claro - Citrato de Sódio 3.2% 3.6ml',
      corTampaHex: '#3498DB',
      aditivoAnticoagulante: 'Citrato de Sódio 3.2%',
      volumeMinimoMl: 2.7,
      ordemCLSI: 1,
      instrucoesHomogeneizacao: 'Inverter suavemente de 3 a 4 vezes. Respeitar proporção 9:1.'
    },
    {
      chave: 'Tubo Amarelo',
      codigo: 'SORO_GEL_AMARELO',
      descricao: 'Tubo Tampa Amarela - Gel Separador e Ativador 5ml',
      corTampaHex: '#F1C40F',
      aditivoAnticoagulante: 'Gel Separador e Ativador de Coágulo',
      volumeMinimoMl: 3.5,
      ordemCLSI: 2,
      instrucoesHomogeneizacao: 'Inverter suavemente 5 vezes. Aguardar 30 min antes de centrifugar.'
    },
    {
      chave: 'Tubo Vermelho (Sem Gel)',
      codigo: 'TUBO_VERMELHO_SECO',
      descricao: 'Tubo Tampa Vermelha - Tubo Seco sem Gel Separador 4ml',
      corTampaHex: '#E74C3C',
      aditivoAnticoagulante: 'Ativador de Coágulo (Silica)',
      volumeMinimoMl: 3.0,
      ordemCLSI: 2,
      instrucoesHomogeneizacao: 'Inverter 5 vezes. Indicado para dosagem de fármacos e metais.'
    },
    {
      chave: 'Frasco Estéril',
      codigo: 'FRASCO_ESTERIL',
      descricao: 'Frasco Coletor Universal Estéril com Tampa de Rosca 80ml',
      corTampaHex: '#16A085',
      aditivoAnticoagulante: 'Sem aditivo químico',
      volumeMinimoMl: 10.0,
      ordemCLSI: 6,
      instrucoesHomogeneizacao: 'Assegurar vedação e refrigeração imediata se necessário.'
    },
    {
      chave: 'Frasco Coletor',
      codigo: 'FRASCO_COLETOR',
      descricao: 'Frasco Coletor Universal com Pá para Fezes',
      corTampaHex: '#7F8C8D',
      aditivoAnticoagulante: 'Sem aditivo ou líquido conservante',
      volumeMinimoMl: 5.0,
      ordemCLSI: 6,
      instrucoesHomogeneizacao: 'Colher porção representativa em diferentes pontos da amostra.'
    },
    {
      chave: 'Tubo com Meio Viral',
      codigo: 'TUBO_VIRAL',
      descricao: 'Tubo c/ Meio de Transporte Viral (VTM) e Swab Flocado',
      corTampaHex: '#E67E22',
      aditivoAnticoagulante: 'Solução Conservante Viral / Salina Estéril',
      volumeMinimoMl: 3.0,
      ordemCLSI: 6,
      instrucoesHomogeneizacao: 'Quebrar a haste do swab dentro do tubo e fechar firmemente.'
    },
    {
      chave: 'Envelope de Coleta',
      codigo: 'ENVELOPE_COLETA',
      descricao: 'Kit / Envelope Lacrado para Amostra Queratinizada (Cabelo/Pelos)',
      corTampaHex: '#34495E',
      aditivoAnticoagulante: 'Envelope com lacre de custódia',
      volumeMinimoMl: 1.0,
      ordemCLSI: 6,
      instrucoesHomogeneizacao: 'Garantir preenchimento da cadeia de custódia e selagem.'
    }
  ];

  const mapaTubos: Record<string, string> = {};

  for (const def of definicaoTubos) {
    const tubo = await prisma.tuboColeta.upsert({
      where: { codigo: def.codigo },
      update: {
        descricao: def.descricao,
        corTampaHex: def.corTampaHex,
        aditivoAnticoagulante: def.aditivoAnticoagulante,
        volumeMinimoMl: def.volumeMinimoMl,
        ordemCLSI: def.ordemCLSI,
        instrucoesHomogeneizacao: def.instrucoesHomogeneizacao,
        ativo: true
      },
      create: {
        codigo: def.codigo,
        descricao: def.descricao,
        corTampaHex: def.corTampaHex,
        aditivoAnticoagulante: def.aditivoAnticoagulante,
        volumeMinimoMl: def.volumeMinimoMl,
        ordemCLSI: def.ordemCLSI,
        instrucoesHomogeneizacao: def.instrucoesHomogeneizacao,
        ativo: true
      }
    });
    mapaTubos[def.chave] = tubo.id;
  }
  console.log(`✅ ${Object.keys(mapaTubos).length} tipos de recipientes/tubos vinculados com sucesso!\n`);

  // 3. Adaptação exata das chaves para as colunas do modelo Exame
  console.log('📋 Adaptando dados e inserindo catálogo completo de exames via createMany...');

  const catalogoExames = dadosExamesBrutos.map((item) => {
    // Tratamento e extração do tempo de jejum em horas
    let horasJejum = 0;
    if (item.jejum.includes('12')) {
      horasJejum = 12;
    } else if (item.jejum.includes('8')) {
      horasJejum = 8;
    } else if (item.jejum.includes('4')) {
      horasJejum = 4;
    }

    // Mapeamento correto do recipiente/tubo
    const tuboId = mapaTubos[item.tubo_coleta] || mapaTubos['Tubo Roxo'];

    // Determina se necessita de apoio externo (Genética, Toxicológico, Biologia Molecular)
    const apoioExterno = ['Genética', 'Toxicologia', 'Biologia Molecular'].includes(item.categoria);

    return {
      // Chaves diretas solicitadas
      codigo: item.codigo,
      nome: item.nome,
      categoria: item.categoria,
      material: item.material,
      preco: item.preco,

      // Colunas correspondentes do modelo relacional NotusLab LIMS
      mnemonico: item.codigo,
      setorLaboratorial: item.categoria,
      tempoJejumHoras: horasJejum,
      orientacoesPreparo: `Jejum: ${item.jejum}. Material biológico: ${item.material}. Recipiente: ${item.tubo_coleta}.`,
      prazoDiasUteis: apoioExterno ? 3 : 1,
      precoBaseReais: item.preco,
      tuboColetaId: tuboId,
      requerApoioExterno: apoioExterno
    };
  });

  const resultado = await prisma.exame.createMany({
    data: catalogoExames,
    skipDuplicates: true
  });

  console.log(`\n========================================================================`);
  console.log(`🎉 Sucesso: ${resultado.count} exames cadastrados com preços, jejuns e tubos reais!`);
  console.log(`========================================================================\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
