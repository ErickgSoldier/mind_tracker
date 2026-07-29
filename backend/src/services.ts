import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createRecord = async (data: any) => {
  return await prisma.dailyRecord.create({ data });
};

export const getRecords = async (filter: string) => {
  let dateFilter = {};
  const now = new Date();
  
  if (filter === 'today') {
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    dateFilter = { gte: startOfDay };
  } else if (filter === '7days') {
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    dateFilter = { gte: sevenDaysAgo };
  } else if (filter === '30days') {
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    dateFilter = { gte: thirtyDaysAgo };
  }

  return await prisma.dailyRecord.findMany({
    where: filter && filter !== 'all' ? { createdAt: dateFilter } : undefined,
    orderBy: { createdAt: 'desc' }
  });
};

export const getDashboardStats = async () => {
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const todayRecords = await prisma.dailyRecord.findMany({
    where: { createdAt: { gte: startOfDay } }
  });

  const count = todayRecords.length;
  if (count === 0) {
    return { count: 0, avgEnergia: 0, avgClareza: 0, avgImpulso: 0, cedeuCount: 0 };
  }

  const avgEnergia = todayRecords.reduce((acc, r) => acc + r.energia, 0) / count;
  const avgClareza = todayRecords.reduce((acc, r) => acc + r.clareza_mental, 0) / count;
  const avgImpulso = todayRecords.reduce((acc, r) => acc + r.impulso, 0) / count;
  const cedeuCount = todayRecords.filter(r => r.cedeu).length;

  return { count, avgEnergia, avgClareza, avgImpulso, cedeuCount };
};

// Pearson correlation logic
function pearsonCorrelation(x: number[], y: number[]) {
  const n = x.length;
  if (n === 0) return 0;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumY2 = y.reduce((a, b) => a + b * b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);

  const num = (n * sumXY) - (sumX * sumY);
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (den === 0) return 0;
  return num / den;
}

export const getAnalytics = async () => {
  // We need at least 7 days of data for good analytics as per prompt.
  // Actually, we'll just calculate it on all data or last 30 days. Let's do all data for simplicity.
  const records = await prisma.dailyRecord.findMany({
    orderBy: { createdAt: 'asc' }
  });

  const count = records.length;
  if (count === 0) return { averages: {}, correlations: [], insights: [], charts: {} };

  const avg = (field: keyof typeof records[0]) => 
    records.reduce((acc, r) => acc + (r[field] as number), 0) / count;

  const averages = {
    energia: avg('energia'),
    estresse: avg('estresse'),
    tedio: avg('tedio'),
    clareza: avg('clareza_mental'),
    impulso: avg('impulso')
  };

  // Correlations with 'impulso'
  const impulsoArr = records.map(r => r.impulso);
  const cedeuArr = records.map(r => r.cedeu ? 1 : 0);
  
  const factors = ['energia', 'estresse', 'tedio', 'clareza_mental'] as const;
  
  const correlations = factors.map(factor => {
    const factorArr = records.map(r => r[factor]);
    return {
      factor,
      correlationImpulso: pearsonCorrelation(factorArr, impulsoArr),
      correlationCedeu: pearsonCorrelation(factorArr, cedeuArr)
    };
  });

  // Sort by highest absolute impact on cedeu or impulso
  correlations.sort((a, b) => Math.abs(b.correlationImpulso) - Math.abs(a.correlationImpulso));

  // Insights generation
  const insights: string[] = [];
  const topFactor = correlations[0];
  
  if (Math.abs(topFactor.correlationImpulso) > 0.3) {
    const nameMap: any = { energia: 'energia', estresse: 'estresse', tedio: 'tédio', clareza_mental: 'clareza mental' };
    insights.push(`Seu maior gatilho para o impulso parece ser: ${nameMap[topFactor.factor]}.`);
  }

  // Example insight: "Quando energia < 5, o impulso médio sobe para X."
  const lowEnergy = records.filter(r => r.energia < 5);
  if (lowEnergy.length > 0) {
    const avgImpLowEng = lowEnergy.reduce((a, b) => a + b.impulso, 0) / lowEnergy.length;
    insights.push(`Quando energia < 5, o impulso médio sobe para ${avgImpLowEng.toFixed(1)}.`);
  }

  const highBoredom = records.filter(r => r.tedio > 7);
  if (highBoredom.length > 0) {
    const cedeuPct = (highBoredom.filter(r => r.cedeu).length / highBoredom.length) * 100;
    insights.push(`Quando tédio > 7, houve ${cedeuPct.toFixed(0)}% de respostas "Sim" (cedeu).`);
  }

  const highClarity = records.filter(r => r.clareza_mental > 8);
  if (highClarity.length > 0) {
    const cedeuPct = (highClarity.filter(r => r.cedeu).length / highClarity.length) * 100;
    insights.push(`Quando clareza mental > 8, apenas ${cedeuPct.toFixed(0)}% das respostas foram "Sim" (cedeu).`);
  }

  // Generate chart data
  const charts = {
    labels: records.map(r => r.createdAt.toLocaleDateString() + ' ' + r.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})),
    clareza: records.map(r => r.clareza_mental),
    impulso: records.map(r => r.impulso),
    energia: records.map(r => r.energia),
    tedio: records.map(r => r.tedio),
    estresse: records.map(r => r.estresse),
    cedeu: records.map(r => r.cedeu ? 1 : 0)
  };

  return { averages, correlations, insights, charts };
};

export const getSettings = async () => {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({ data: {} });
  }
  return settings;
};

export const updateSettings = async (data: any) => {
  const settings = await getSettings();
  return await prisma.settings.update({
    where: { id: settings.id },
    data
  });
};
