import React, { createContext, useContext, useState, useMemo } from 'react';
import { runSimulation, generateMonteCarlo } from '../engine/FinanceEngine';

const SimulationContext = createContext(null);

export const DEFAULT_USER = {
  name: 'Example Plan',
  age: 30,
  city: 'Mumbai',
  profession: 'Software Engineer',
  ctc: 1440000,   // annual CTC
  company: 'Tech Corp',
  riskProfile: 'Moderate',
  retirementGoal: 60,
};

export const DEFAULT_PARAMS = {
  currentAge: 30,
  targetAge: 85,
  retirementAge: 60,
  initialNetWorth: 500000,
  monthlySalary: 120000,
  monthlyExpenses: 80000,
  annualStepUp: 0.08,
  inflationRate: 0.06,
  capitalGainsTaxRate: 0.10,
  returns: { phase1: 0.12, phase2: 0.10, phase3: 0.08 },
  emiAutoConvert: true,
  milestones: [
    { id: 'm1', age: 33, name: 'Dream Home', cost: 8000000, loanType: 'HOME' },
    { id: 'm2', age: 36, name: 'Luxury Car', cost: 1500000, loanType: 'CAR' },
    { id: 'm3', age: 42, name: "Child's Education", cost: 2000000, loanType: '' },
  ],
};

export const AGGRESSIVE_PARAMS = {
  currentAge: 25,
  targetAge: 85,
  retirementAge: 50,
  initialNetWorth: 200000,
  monthlySalary: 200000,
  monthlyExpenses: 120000,
  annualStepUp: 0.12,
  inflationRate: 0.06,
  capitalGainsTaxRate: 0.10,
  returns: { phase1: 0.15, phase2: 0.12, phase3: 0.09 },
  emiAutoConvert: true,
  milestones: [
    { id: 'm1', age: 30, name: 'Sports Car', cost: 4000000, loanType: 'CAR' },
  ],
};

// ── Provider ──────────────────────────────────────────────────────────────
export function SimulationProvider({ children, initialUser }) {
  // Derive starting params if user came from signup
  const startingUser = initialUser
    ? {
        ...DEFAULT_USER,
        name:        initialUser.name        || DEFAULT_USER.name,
        age:         initialUser.age         || DEFAULT_USER.age,
        city:        initialUser.city        || DEFAULT_USER.city,
        profession:  initialUser.profession  || DEFAULT_USER.profession,
        company:     initialUser.company     || DEFAULT_USER.company,
        ctc:         initialUser.ctc         || DEFAULT_USER.ctc,
        riskProfile: initialUser.riskProfile || DEFAULT_USER.riskProfile,
      }
    : DEFAULT_USER;

  const startingParams = initialUser
    ? {
        ...DEFAULT_PARAMS,
        currentAge:     Number(initialUser.age)  || DEFAULT_PARAMS.currentAge,
        retirementAge:  initialUser.retirementGoal || DEFAULT_PARAMS.retirementAge,
        monthlySalary:  Math.round((initialUser.ctc || DEFAULT_USER.ctc) * 0.7 / 12),
      }
    : DEFAULT_PARAMS;

  const [params, setParams]           = useState(startingParams);
  const [userProfile, setUserProfile] = useState(startingUser);
  const [monteCarloEnabled, setMC]    = useState(false);

  const updateParam = (key, val) =>
    setParams(prev => ({ ...prev, [key]: val }));

  const updateReturn = (phase, val) =>
    setParams(prev => ({ ...prev, returns: { ...prev.returns, [phase]: val } }));

  const updateMilestone = (id, patch) =>
    setParams(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => m.id === id ? { ...m, ...patch } : m),
    }));

  const addMilestone = (m) =>
    setParams(prev => ({
      ...prev,
      milestones: [...prev.milestones, { ...m, id: 'm' + Date.now() }],
    }));

  const removeMilestone = (id) =>
    setParams(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id),
    }));

  const simulationResult = useMemo(() => runSimulation(params), [params]);

  const monteCarloData = useMemo(() => {
    if (!monteCarloEnabled) return [];
    return generateMonteCarlo(params);
  }, [params, monteCarloEnabled]);

  return (
    <SimulationContext.Provider value={{
      params, setParams,
      userProfile, setUserProfile,
      updateParam, updateReturn,
      updateMilestone, addMilestone, removeMilestone,
      simulationResult,
      monteCarloEnabled, setMonteCarloEnabled: setMC,
      monteCarloData,
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  return useContext(SimulationContext);
}
