import { createContext, useState, useMemo, ReactNode } from 'react';
import useDatabase from '../hooks/useDatabase';
import { RawData } from '../interface';
import { currencyMap } from '../utils';

interface DataContextProps {
  db: any;
  analysisDate: string[];
  compareDate: string[];
  currency: string;
  currencyRatio: number;
  currencyFixed: number;
  isInsertFinish: boolean;
  insertData: (val: RawData[]) => void;
  selectData: (val: string) => Promise<{ [key: string]: number | string }[]>;
  setAnalysisDate: (val: string[]) => void;
  setCompareDate: (val: string[]) => void;
  setCurrency: (val: string) => void;
}

const DataContext = createContext<DataContextProps>({
  db: null,
  analysisDate: [],
  compareDate: [],
  currency: '',
  currencyRatio: 1,
  currencyFixed: 6,
  isInsertFinish: false,
  insertData: () => {},
  selectData: () => { return Promise.resolve([]) },
  setAnalysisDate: () => {},
  setCompareDate: () => {},
  setCurrency: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const database = useDatabase();
  const [analysisDate, setAnalysisDate] = useState<string[]>([]);
  const [compareDate, setCompareDate] = useState<string[]>([]);
  const [currency, setCurrency] = useState<string>('');

  const currencyRatio = useMemo(() => currencyMap.get(currency)?.ratio || 1, [currency]);
  const currencyFixed = useMemo(() => currencyMap.get(currency)?.fixed || 6, [currency]);

  return (
    <DataContext.Provider value={{ 
        ...database,
        analysisDate,
        compareDate,
        currency,
        currencyRatio,
        currencyFixed,
        setAnalysisDate,
        setCompareDate,
        setCurrency
      }}>
      {children}
    </DataContext.Provider>
  );
}

export default DataContext;
