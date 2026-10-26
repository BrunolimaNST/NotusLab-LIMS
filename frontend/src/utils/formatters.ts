/**
 * NotusLab LIMS - Utilitários Padronizados de Formatação e Máscaras
 * Arquivo: src/utils/formatters.ts
 */

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function cleanDigits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

/**
 * Mascara o CPF para exibição segura em conformidade com a LGPD
 * Exemplo: 123.456.789-00 -> ***.456.789-**
 */
export function maskCPF(cpf: string): string {
  const digits = cleanDigits(cpf);
  if (digits.length !== 11) {
    return '***.***.***-**';
  }
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

/**
 * Formata CPF durante a digitação no padrão 000.000.000-00
 */
export function formatCPFInput(value: string): string {
  return cleanDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Formata Telefone ou WhatsApp (+55 (11) 98765-4321 ou (11) 98765-4321)
 */
export function formatPhoneInput(value: string): string {
  const digits = cleanDigits(value).slice(0, 13);

  if (digits.length > 11 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4);
    const num = digits.slice(4);
    if (num.length > 5) {
      return `+55 (${ddd}) ${num.slice(0, 5)}-${num.slice(5, 9)}`;
    }
    return `+55 (${ddd}) ${num}`;
  }

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

/**
 * Formata CEP no padrão 00000-000
 */
export function formatCEPInput(value: string): string {
  return cleanDigits(value)
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, '$1-$2');
}

/**
 * Formata valores numéricos para a moeda brasileira (BRL)
 * Exemplo: 38.5 -> R$ 38,50
 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata data no padrão pt-BR (DD/MM/AAAA)
 */
export function formatDateBR(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return String(date);
  }
}

/**
 * Formata data e hora no padrão pt-BR (DD/MM/AAAA às HH:mm)
 */
export function formatDateTimeBR(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return String(date);
  }
}
