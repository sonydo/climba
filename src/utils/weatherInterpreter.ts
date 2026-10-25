export interface WmoInterpretation {
  description: string;
  iconName: 'sun' | 'cloud-sun' | 'cloud' | 'cloud-fog' | 'cloud-drizzle' | 'cloud-rain' | 'cloud-snow' | 'cloud-lightning';
  bgGradient: string;
}

export function interpretWmoCode(code: number, isDay: boolean = true): WmoInterpretation {
  switch (code) {
    case 0:
      return {
        description: isDay ? 'Cielo despejado' : 'Noche despejada',
        iconName: 'sun',
        bgGradient: isDay
          ? 'from-blue-600 via-indigo-700 to-sky-900'
          : 'from-slate-900 via-indigo-950 to-black'
      };
    case 1:
    case 2:
      return {
        description: isDay ? 'Parcialmente nublado' : 'Intervalos nubosos',
        iconName: 'cloud-sun',
        bgGradient: isDay
          ? 'from-blue-500 via-sky-700 to-indigo-900'
          : 'from-slate-900 via-slate-950 to-indigo-950'
      };
    case 3:
      return {
        description: 'Nublado',
        iconName: 'cloud',
        bgGradient: 'from-slate-700 via-slate-800 to-zinc-900'
      };
    case 45:
    case 48:
      return {
        description: 'Niebla o neblina',
        iconName: 'cloud-fog',
        bgGradient: 'from-zinc-700 via-stone-800 to-neutral-900'
      };
    case 51:
    case 53:
    case 55:
      return {
        description: 'Llovizna suave',
        iconName: 'cloud-drizzle',
        bgGradient: 'from-slate-700 via-cyan-900 to-slate-900'
      };
    case 61:
    case 63:
    case 65:
      return {
        description: 'Lluvia constante',
        iconName: 'cloud-rain',
        bgGradient: 'from-blue-800 via-indigo-950 to-slate-950'
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        description: 'Nevada',
        iconName: 'cloud-snow',
        bgGradient: 'from-sky-700 via-slate-800 to-blue-950'
      };
    case 80:
    case 81:
    case 82:
      return {
        description: 'Chubascos intensos',
        iconName: 'cloud-rain',
        bgGradient: 'from-blue-900 via-slate-900 to-black'
      };
    case 85:
    case 86:
      return {
        description: 'Chubascos de nieve',
        iconName: 'cloud-snow',
        bgGradient: 'from-cyan-900 via-slate-900 to-slate-950'
      };
    case 95:
    case 96:
    case 99:
      return {
        description: 'Tormenta eléctrica',
        iconName: 'cloud-lightning',
        bgGradient: 'from-purple-900 via-indigo-950 to-slate-950'
      };
    default:
      return {
        description: 'Despejado',
        iconName: 'sun',
        bgGradient: 'from-blue-600 via-indigo-800 to-slate-900'
      };
  }
}

export function formatDayName(dateString: string): string {
  try {
    const d = new Date(dateString + 'T00:00:00');
    const day = d.toLocaleDateString('es-ES', { weekday: 'short' });
    return day.charAt(0).toUpperCase() + day.slice(1);
  } catch {
    return dateString;
  }
}
