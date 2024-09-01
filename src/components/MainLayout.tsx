import { useState, useEffect, useContext, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import dayjs from 'dayjs';
import { FaHome, FaChartBar, FaTable, FaBook } from 'react-icons/fa';
import DataContext from '../contexts/DataContext';
import DatePicker from 'react-datepicker'
import { useLocation } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css'

function MainLayout() {
  const location = useLocation();
  const [network, setNetwork] = useState('');
  const [timeOption, setTimeOption] = useState('last14');
  const [currencyOptionList, setCurrencyOptionList] = useState<{label: string; value: string}[]>([])
  const [lastDate, setLastDate] = useState('');

  const { 
    db, currency, analysisDate, compareDate, isInsertFinish,
    setAnalysisDate, setCompareDate, setCurrency, insertData, selectData 
  } = useContext(DataContext);

  const timeOptionList: { label: string; value: string }[] = [
    { label: 'Last 7 days', value: 'last7' },
    { label: 'Last 14 days', value: 'last14' },
    { label: 'Last 30 days', value: 'last30' },
    { label: 'Last 60 days', value: 'last60' },
    { label: 'Custom', value: 'custom' }
  ]

  const showCompare = useMemo(() => ['/dashboard', '/list'].indexOf(location.pathname) >= 0, [location.pathname])

  useEffect(() => {
    async function _fetchData() {
      try {
        const response = await fetch('/take-home-assignment-dataset.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setCurrencyOptionList([
          { label: result.network.currency, value: result.network.currency },
          { label: 'TWD', value: 'TWD' },
        ])
        setNetwork(result.network.name);
        setCurrency(result.network.currency);
        insertData(result.unit_reports);
      } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
      }
    }

    _fetchData();

    return () => {
      console.log('MainLayout unmounted')
    }
  }, [db, insertData, setCurrency])

  useEffect(() => {
    async function _getLastDate() {
      const temp = await selectData('SELECT * FROM tbl_unit_reports ORDER BY date DESC LIMIT 1');
      if (temp.length) {
        setLastDate(temp[0].date as string);
        setAnalysisDate([dayjs(temp[0].date).subtract(13, 'day').format('YYYY-MM-DD'), temp[0].date as string]);
        setCompareDate([dayjs(temp[0].date).subtract(27, 'day').format('YYYY-MM-DD'), dayjs(temp[0].date).subtract(14, 'day').format('YYYY-MM-DD')]);
      }
    }
    _getLastDate();
  }, [isInsertFinish, selectData, setLastDate, setAnalysisDate, setCompareDate])

  function handleTimeOptionChange(value: string) {
    setTimeOption(value);
    if (value === 'custom') return;
    const dateIdx = +(value.replace('last', '')) - 1;
    setAnalysisDate([dayjs(lastDate).subtract(dateIdx, 'day').format('YYYY-MM-DD'), dayjs(lastDate).format('YYYY-MM-DD')]);
    setCompareDate([dayjs(lastDate).subtract(dateIdx + 1 + dateIdx, 'day').format('YYYY-MM-DD'), dayjs(lastDate).subtract(dateIdx + 1, 'day').format('YYYY-MM-DD')]);
  }

  function handleAnalysisDateChange(date: Date[]) {
    setAnalysisDate(date.map((d) => d ? dayjs(d).format('YYYY-MM-DD') : d));
  }

  function handleCompareDateChange(date: Date[]) {
    setCompareDate(date.map((d) => d ? dayjs(d).format('YYYY-MM-DD') : d));
  }

  const parseAnalysisDate = useMemo(() => analysisDate.map((date) => date ? dayjs(date).toDate() : date), [analysisDate])  
  const parseCompareDate = useMemo(() => compareDate.map((date) => date ? dayjs(date).toDate() : date), [compareDate])  
  
  return (
    <div className='mb-4'>
      <div className='text-2xl mb-2'>{network}</div>
      <div className='flex items-center gap-4'>
        <select value={timeOption} onChange={(e) => handleTimeOptionChange(e.target.value)}>
          {
            timeOptionList.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))
          }
        </select>
        {
          timeOption === 'custom' ? 
            <DatePicker
              selectsRange={true}
              className='border-2 p-2 rounded-lg w-60' 
              startDate={parseAnalysisDate[0]}
              endDate={parseAnalysisDate[1]}
              onChange={handleAnalysisDateChange}
              dateFormat='YYYY-MM-dd'/> : 
            <div>{analysisDate[0]} {analysisDate.length === 2 ? '~' : ''} {analysisDate[1]}</div>
        }
        { showCompare && <div>v.s.</div> }
        {
          showCompare &&
            (timeOption === 'custom' ? 
              <DatePicker
                selectsRange={true}
                className='border-2 p-2 rounded-lg w-60' 
                startDate={parseCompareDate[0]}
                endDate={parseCompareDate[1]}
                onChange={handleCompareDateChange}
                dateFormat='YYYY-MM-dd'/> : 
              <div>{compareDate[0]} {compareDate.length === 2 ? '~' : ''} {compareDate[1]}</div>)
        }
        <div className='ml-auto flex gap-2'>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {
              currencyOptionList.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))
            }
          </select>
          <NavLink to='/'><FaHome /></NavLink>
          <NavLink to='/dashboard'><FaChartBar /></NavLink>
          <NavLink to='/list'><FaBook /></NavLink>
          <NavLink to='/report'><FaTable /></NavLink>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;