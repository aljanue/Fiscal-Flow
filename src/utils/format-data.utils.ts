export function formatAmount(amount: string | number): string {
  if (!amount) return '0';
  
  // 1. Convertir a string
  let cleaned = amount.toString();
  
  // 2. Reemplazar coma por punto (Corrección para España/Latam)
  cleaned = cleaned.replace(',', '.');
  
  // 3. (Opcional) Validación extra: Si no es número, lanzamos error o devolvemos '0'
  if (isNaN(Number(cleaned))) {
    throw new Error(`El importe '${amount}' no es un número válido.`);
  }

  return cleaned;
}