import { Paciente } from '../types';
import { maskCPF, formatCPFInput, formatPhoneInput } from '../utils/formatters';

export { maskCPF, formatCPFInput, formatPhoneInput };

const STORAGE_KEY = 'notuslab_pacientes_db';

export const PACIENTES_INICIAIS: Paciente[] = [
  {
    id: '1',
    nomeCompleto: 'ANA PAULA FERREIRA',
    nomeCivil: 'ANA PAULA FERREIRA',
    cpf: '123.456.789-00',
    rg: '44.123.456-7',
    orgaoEmissor: 'SSP/SP',
    nomeMae: 'MARIA DE LOURDES FERREIRA',
    nomePai: 'ANTONIO CARLOS FERREIRA',
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    numero: '1000',
    complemento: 'Apto 82',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    zonaRural: false,
    dataNascimento: '1992-05-18',
    sexoBiologico: 'FEMININO',
    telefoneWhatsapp: '+55 (11) 98765-4321',
    email: 'anapaula.ferreira@email.com',
    dataCadastro: 'Hoje, 10:14',
  },
  {
    id: '2',
    nomeCompleto: 'ROBERTO ALBUQUERQUE GUIMARÃES',
    nomeCivil: 'ROBERTO ALBUQUERQUE GUIMARÃES',
    cpf: '345.678.901-22',
    rg: '33.987.654-2',
    orgaoEmissor: 'SSP/SP',
    nomeMae: 'CLARICE ALBUQUERQUE GUIMARÃES',
    nomePai: 'JOÃO BATISTA GUIMARÃES',
    cep: '13480-970',
    logradouro: 'Rodovia SP-330',
    numero: 'Km 142',
    complemento: 'Sítio Primavera',
    bairro: 'Zona Rural',
    cidade: 'Limeira',
    estado: 'SP',
    zonaRural: true,
    dataNascimento: '1984-11-03',
    sexoBiologico: 'MASCULINO',
    telefoneWhatsapp: '+55 (11) 99988-7766',
    email: 'roberto.guimaraes@email.com',
    dataCadastro: 'Hoje, 09:30',
  },
  {
    id: '3',
    nomeCompleto: 'JULIANA SILVEIRA ROCHA',
    nomeCivil: 'JULIANA SILVEIRA ROCHA',
    nomeSocial: 'JULIE ROCHA',
    pronomes: 'Ela/Dela',
    cpf: '567.890.123-44',
    rg: '52.345.678-9',
    orgaoEmissor: 'SSP/SP',
    nomeMae: 'TEREZA SILVEIRA ROCHA',
    cep: '04001-001',
    logradouro: 'Rua Domingos de Morais',
    numero: '450',
    complemento: 'Bloco B, Sala 14',
    bairro: 'Vila Mariana',
    cidade: 'São Paulo',
    estado: 'SP',
    zonaRural: false,
    dataNascimento: '1998-02-14',
    sexoBiologico: 'FEMININO',
    telefoneWhatsapp: '+55 (11) 97711-2233',
    email: 'juliana.rocha@email.com',
    dataCadastro: 'Ontem, 16:45',
  },
  {
    id: '4',
    nomeCompleto: 'CARLOS EDUARDO MENDES',
    nomeCivil: 'CARLOS EDUARDO MENDES',
    cpf: '789.012.345-66',
    rg: '21.567.890-1',
    orgaoEmissor: 'SSP/RJ',
    nomeMae: 'HELENA MENDES',
    cep: '20040-002',
    logradouro: 'Avenida Rio Branco',
    numero: '156',
    bairro: 'Centro',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    zonaRural: false,
    dataNascimento: '1965-07-29',
    sexoBiologico: 'MASCULINO',
    telefoneWhatsapp: '+55 (11) 96655-4433',
    email: 'carlos.mendes@email.com',
    dataCadastro: '01/10/2026, 14:20',
  },
];

/**
 * Calcula a idade de forma precisa e humanizada (anos, meses ou dias)
 */
export function calcularIdade(dataNascStr: string): string {
  if (!dataNascStr) return '';
  const dataNasc = new Date(dataNascStr + 'T00:00:00');
  if (isNaN(dataNasc.getTime())) return '';

  const hoje = new Date();
  let anos = hoje.getFullYear() - dataNasc.getFullYear();
  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();
  const mesNasc = dataNasc.getMonth();
  const diaNasc = dataNasc.getDate();

  if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
    anos--;
  }

  if (anos < 1) {
    const meses = (hoje.getFullYear() - dataNasc.getFullYear()) * 12 + (mesAtual - mesNasc);
    if (meses <= 0) {
      const dias = Math.max(0, Math.floor((hoje.getTime() - dataNasc.getTime()) / (1000 * 60 * 60 * 24)));
      return dias <= 1 ? '1 dia' : `${dias} dias`;
    }
    return meses === 1 ? '1 mês' : `${meses} meses`;
  }

  return anos === 1 ? '1 ano' : `${anos} anos`;
}



/**
 * Obtém todos os pacientes salvos no storage local
 */
export function getPacientesStorage(): Paciente[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(PACIENTES_INICIAIS));
      return PACIENTES_INICIAIS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : PACIENTES_INICIAIS;
  } catch {
    return PACIENTES_INICIAIS;
  }
}

/**
 * Salva ou atualiza um paciente no storage
 */
export function savePacienteStorage(paciente: Paciente): Paciente[] {
  try {
    const lista = getPacientesStorage();
    const index = lista.findIndex((p) => p.id === paciente.id);
    let novaLista: Paciente[];

    if (index >= 0) {
      novaLista = [...lista];
      novaLista[index] = paciente;
    } else {
      novaLista = [paciente, ...lista];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
    window.dispatchEvent(new Event('notuslab_pacientes_updated'));
    return novaLista;
  } catch (err) {
    console.error('Falha ao persistir paciente:', err);
    return getPacientesStorage();
  }
}

/**
 * Remove um paciente do storage
 */
export function deletePacienteStorage(id: string): Paciente[] {
  try {
    const lista = getPacientesStorage();
    const novaLista = lista.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
    window.dispatchEvent(new Event('notuslab_pacientes_updated'));
    return novaLista;
  } catch {
    return getPacientesStorage();
  }
}
