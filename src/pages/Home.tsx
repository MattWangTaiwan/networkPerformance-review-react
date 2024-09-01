import { useContext, useEffect, useState, useCallback } from 'react';
import DataContext from '../contexts/DataContext';
import ReactECharts from 'echarts-for-react';
import { Pagination, Sorting } from '../interface';
import { getDateXAxis, metricsOptionList } from '../utils';
import { lineChartOption  } from '../utils/chart';
import Table from '../components/Table';

function Home() {
  const {
    analysisDate, compareDate, selectData, currencyFixed, currencyRatio
  } = useContext(DataContext);

  const [metric, setMetric] = useState('request');
  const [options, setOptions] = useState(lineChartOption);
  const [data, setData] = useState<{[key: string]: number | string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const pageSize = 10;

  const fetchData = useCallback(async (pageIndex: number, pageSize: number, sorting: Sorting) => {
    setIsLoading(true);
    try {
      const countTemp = await selectData(`
        SELECT COUNT(*) as total
        FROM tbl_unit_reports
        WHERE date BETWEEN '${analysisDate[0]}' AND '${analysisDate[1]}'
        GROUP BY unitId`);
      if (countTemp) setPageCount(Math.ceil(countTemp.length / pageSize));
      const tableTemp = await selectData(`
        WITH calculated_units AS (
          SELECT 
            unitId, SUM(impression) as impression, SUM(request) as request,
            ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${analysisDate[0]}' AND '${analysisDate[1]}'
          GROUP BY unitId
        )
        SELECT unitId, impression, request, revenue,
        ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
        ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
        FROM calculated_units
        ORDER BY ${sorting.id} ${sorting.desc ? 'DESC' : 'ASC'}
        LIMIT ${pageSize} OFFSET ${pageIndex * pageSize}`);
      if (tableTemp) {
        setData(tableTemp);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // 處理錯誤，可能顯示錯誤消息給用戶
    } finally {
      setIsLoading(false);
    }
  }, [setPageCount, selectData, analysisDate, currencyRatio, currencyFixed]);

  const handleControllChange = (newPagination: Pagination, sorting: Sorting[]) => {
    fetchData(newPagination.pageIndex, newPagination.pageSize, sorting[0] || { id: 'revenue', desc: true });
  };

  useEffect(() => {
    async function _fetchData() {
      const lineData = await selectData(`
        WITH calculated_date AS (
          SELECT 
            date, SUM(impression) as impression, SUM(request) as request,
            ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${analysisDate[0]}' AND '${analysisDate[1]}'
          GROUP BY date
        )
        SELECT
          date, impression, request, revenue,
          ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
          ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
        FROM calculated_date
        ORDER BY date ASC`);
      if (lineData) {
        setOptions((options) => {
          const temp = JSON.parse(JSON.stringify(options));
          const dateList = getDateXAxis(analysisDate);
          temp.xAxis.data = dateList;
          temp.series[0].data = dateList.map((date: string) => lineData.find((d) => d.date === date)?.[metric] || null);
          return temp;
        });
      }
    }
    if (analysisDate.length !== 0 && analysisDate.every((date) => date)) {
      _fetchData();
    }
  }, [analysisDate, compareDate, selectData, metric, currencyRatio, currencyFixed]);

  useEffect(() => {
    const sorting: Sorting = { id: 'revenue', desc: true };
    if (analysisDate.length !== 0 && analysisDate.every((date) => date)) {
      fetchData(0, pageSize, sorting);
    }
  }, [analysisDate, fetchData, pageSize]);

  return (
    <div>
      <div className='flex mb-4 gap-2'>
        {
          metricsOptionList.map((option) => (
            <div className={option.value === metric ? 'button select' : 'button'} onClick={() => setMetric(option.value)} key={option.value}>{option.label}</div>))
        }
      </div>
      <ReactECharts option={options} className='mb-4' />
      <Table
        column={[
          { accessor: 'unitId', header: 'Unit ID', sort: true },
          { accessor: 'request', header: 'Request', sort: true },
          { accessor: 'impression', header: 'Impression', sort: true },
          { accessor: 'revenue', header: 'Revenue', sort: true },
          { accessor: 'ecpm', header: 'eCPM', sort: true },
          { accessor: 'rpm', header: 'RPM', sort: true }]
        }
        data={data}
        pageSize={pageSize}
        pageCount={pageCount}
        isLoading={isLoading}
        onPaginationChange={handleControllChange}
        onSortingChange={handleControllChange}
      />
    </div>
  )
}

export default Home