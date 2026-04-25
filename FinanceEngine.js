export const LOAN_TYPES = {
  HOME: { name: 'Home Loan', rate: 0.085, termsYears: 20 },
  CAR: { name: 'Car Loan', rate: 0.09, termsYears: 5 },
  PERSONAL: { name: 'Personal Loan', rate: 0.12, termsYears: 5 }
};

export function runSimulation(params) {
  const {
    currentAge = 30,
    targetAge = 80, // Simulator end age
    retirementAge = 60,
    initialNetWorth = 0,
    monthlySalary = 100000,
    monthlyExpenses = 75000,
    annualStepUp = 0.05, // 5%
    inflationRate = 0.06, // 6%
    capitalGainsTaxRate = 0.10, // 10%
    returns = { phase1: 0.12, phase2: 0.10, phase3: 0.08 }, // 20-40, 40-60, 60-80
    milestones = [],
    emiAutoConvert = true,
    monteCarloOffset = 0 // e.g., 0.01 for +1%, -0.02 for -2%
  } = params;

  let netWorth = initialNetWorth;
  let activeLoans = []; 
  let monthlySavings = monthlySalary - monthlyExpenses;
  let currentAnnualSavings = monthlySavings * 12;
  
  const timeline = [];
  const trackedShortfalls = {}; 
  const loanTracking = []; // { id, name, initialBalance, emi, rate, terms, startAge, remainingTerm }// age -> shortfall amount
  
  for (let age = currentAge; age <= targetAge; age++) {
    // 1. Determine return rate
    let returnRate = returns.phase1;
    if (age >= 40 && age < 60) returnRate = returns.phase2;
    if (age >= 60) returnRate = returns.phase3;
    
    returnRate += monteCarloOffset;

    // 2. Add savings
    let addedSavings = 0;
    if (age <= retirementAge) {
      addedSavings = currentAnnualSavings;
      // Process EMI payments
      let totalEMI = 0;
      activeLoans = activeLoans.filter(loan => {
        totalEMI += loan.emi * 12;
        loan.remainingTerm--;
        return loan.remainingTerm >= 0;
      });
      // Deduct EMIs from added savings. If EMI > addedSavings, it eats into NetWorth.
      addedSavings -= totalEMI; 
    }

    // Compounding
    netWorth = (netWorth + addedSavings) * (1 + returnRate);

    // 3. Process Milestones
    const yearMilestones = milestones.filter(m => m.age === age);
    let shortfallForYear = 0;

    for (const m of yearMilestones) {
       const yearsFromStart = age - currentAge;
       const inflatedCost = m.cost * Math.pow(1 + inflationRate, yearsFromStart);
       
       // Tax drag
       const costToDeduct = inflatedCost * (1 + capitalGainsTaxRate);

       if (netWorth >= costToDeduct) {
         netWorth -= costToDeduct;
       } else {
         const gap = costToDeduct - Math.max(0, netWorth);
         shortfallForYear += gap;
         trackedShortfalls[m.id] = gap; 
         netWorth = 0; // depleted
         
         if (emiAutoConvert && m.loanType) {
            const loanInfo = LOAN_TYPES[m.loanType];
            const r = loanInfo.rate / 12;
            const n = loanInfo.termsYears * 12;
            const emi = (gap * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const loanRecord = { remainingTerm: loanInfo.termsYears, emi, name: m.name, rate: loanInfo.rate, initialBalance: gap };
            activeLoans.push(loanRecord);
            loanTracking.push({ ...loanRecord, startAge: age });
         }
       }
    }

    timeline.push({
      age,
      netWorth: Math.max(0, netWorth), // We'll clip at 0 for visual simplicity if it drops below, or let it go negative to show debt?
      // Let's allow negative net worth to properly show deep debt if EMI + expenses exceed everything
      rawNetWorth: netWorth,
      shortfall: shortfallForYear
    });

    if (age < retirementAge) {
      currentAnnualSavings *= (1 + annualStepUp);
    }
  }

  return { timeline, trackedShortfalls, loanTracking };
}

export function generateMonteCarlo(baseParams) {
    const offsets = [0, 0.03, 0.02, 0.01, -0.01, -0.02, -0.03];
    const scenarios = offsets.map(offset => {
        return {
            offset,
            result: runSimulation({ ...baseParams, monteCarloOffset: offset })
        }
    });

    // Merge into one timeline for recharts
    const { timeline: baseTimeline } = scenarios.find(s => s.offset === 0).result;
    
    return baseTimeline.map((pt, i) => {
        const row = { age: pt.age, netWorth: pt.rawNetWorth };
        scenarios.forEach(s => {
            row[`nw_MC_Plus${s.offset * 100}`] = Math.max(0, s.result.timeline[i].rawNetWorth);
        });
        return row;
    });
}
