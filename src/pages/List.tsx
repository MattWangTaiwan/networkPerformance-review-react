import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import DataContext from '../contexts/DataContext';
import { metricsOptionList, getDiff } from '../utils';
import { Pagination, Sorting, Data } from '../interface';
import Table from '../components/Table';
import Card from '../components/Card';

function List() {
  const {
    currency, analysisDate, compareDate, selectData, currencyRatio, currencyFixed
  } = useContext(DataContext);

  const [summary, _setSummary] = useState<Data[]>([]);
  const [data, setData] = useState<Data[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [sorting, setSorting] = useState<Sorting>({ id: 'revenue', desc: true });
  const [pageIndex, setPageIndex] = useState(0);
  const [searchTxt, setSearchTxt] = useState('');
  const pageSize = 10;

  const tableRef = useRef();

  const fetchData = useCallback(async (pageIndex: number, pageSize: number, sorting: Sorting) => {
    setIsLoading(true);
    try {
      setPageIndex(pageIndex);
      setSorting(sorting);
      const countTemp = await selectData(`
        SELECT COUNT(*) as total
        FROM tbl_unit_reports
        WHERE date BETWEEN '${analysisDate[0]}' AND '${analysisDate[1]}'
        ${searchTxt !== '' ? `AND unitId LIKE '%${searchTxt}%'` : ''}
        GROUP BY unitId
      `);
      if (countTemp) setPageCount(Math.ceil(countTemp.length / pageSize));
      const tableTemp = await selectData(`
        WITH calculated_units AS (
          SELECT 
            unitId, SUM(impression) as impression, SUM(request) as request,
            ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${analysisDate[0]}' AND '${analysisDate[1]}'
          ${searchTxt !== '' ? `AND unitId LIKE '%${searchTxt}%'` : ''}
          GROUP BY unitId
        )
        SELECT unitId, impression, request, revenue,
        ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
        ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
        FROM calculated_units
        ORDER BY ${sorting.id} ${sorting.desc ? 'DESC' : 'ASC'}
        LIMIT ${pageSize} OFFSET ${pageIndex * pageSize}`);
      if (tableTemp) {
        const result: Data[] = [];
        for(const item of tableTemp) {
          const compareTemp = await selectData(`
            WITH calculated_units AS (
              SELECT 
                SUM(impression) as impression, SUM(request) as request,
                ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
              FROM tbl_unit_reports
              WHERE date BETWEEN '${compareDate[0]}' AND '${compareDate[1]}'
              AND unitId = '${item.unitId}'
              GROUP BY unitId
            )
            SELECT impression, request, revenue,
            ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
            ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
            FROM calculated_units`);
          result.push({
            ...item,
            requestDiff: compareTemp ? getDiff(item.request as number, compareTemp[0]?.request as number) : 0,
            impressionDiff: compareTemp ? getDiff(item.impression as number, compareTemp[0]?.impression as number) : 0,
            revenueDiff: compareTemp ? getDiff(item.revenue as number, compareTemp[0]?.revenue as number) : 0,
            ecpmDiff: compareTemp ? getDiff(item.ecpm as number, compareTemp[0]?.ecpm as number) : 0,
            rpmDiff: compareTemp ? getDiff(item.rpm as number, compareTemp[0]?.rpm as number) : 0
          });
        }
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // 處理錯誤，可能顯示錯誤消息給用戶
    } finally {
      setIsLoading(false);
    }
  }, [selectData, analysisDate, searchTxt, currencyRatio, currencyFixed, compareDate]);

  const handleControllChange = (newPagination: Pagination, newSorting: Sorting[]) => {
    fetchData(newPagination.pageIndex, newPagination.pageSize, newSorting[0] || sorting );
  };

  const handleSearch = (e) => {
    setSearchTxt(e.target.value);
  };

  useEffect(() => {
    if (
      analysisDate.length !== 0 && analysisDate.every((date) => date) &&
      compareDate.length !== 0 && compareDate.every((date) => date)
    ) {
      tableRef.current.resetPage();
    }
  }, [analysisDate, compareDate, searchTxt]);

  useEffect(() => {
    if (
      analysisDate.length !== 0 && analysisDate.every((date) => date) &&
      compareDate.length !== 0 && compareDate.every((date) => date)
    ) {
      fetchData(pageIndex, pageSize, sorting);
    }
  }, [currency]);

  useEffect(() => {
    async function _fetchData() {
      const anaAmount = await selectData(`
        WITH calculated_units AS (
          SELECT 
            SUM(impression) as impression, SUM(request) as request,
            ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${analysisDate[0]}' AND '${analysisDate[1]}'
        )
        SELECT impression, request, revenue,
        ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
        ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
        FROM calculated_units`);
      const comAmount = await selectData(`
        WITH calculated_units AS (
          SELECT 
            SUM(impression) as impression, SUM(request) as request,
            ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${compareDate[0]}' AND '${compareDate[1]}'
        )
        SELECT impression, request, revenue,
        ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
        ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
        FROM calculated_units`);
      if (anaAmount && comAmount) {
        _setSummary(metricsOptionList.map((metric) => ({
          title: metric.label as string,
          target: (anaAmount?.[0]?.[metric.value] || 0) as number,
          diff: getDiff((anaAmount?.[0]?.[metric.value] || 0) as number, (comAmount?.[0]?.[metric.value] || 0) as number)
        })));
      }
    }

    if (
      analysisDate.length !== 0 && analysisDate.every((date) => date) && 
      compareDate.length !== 0 && compareDate.every((date) => date)
    ) {
      _fetchData();
    }
  }, [analysisDate, compareDate, currencyRatio, currencyFixed, selectData]);

  return (
    <div>
      <div className='flex gap-4 mb-4'>
        {
          summary.map((s) => (
            <Card key={s.title} title={s.title} target={s.target} diff={s.diff} />
          ))
        }
      </div>
      <div className='flex justify-between'>
        <input type='text' placeholder='Search UnitID ...' className='w-60' value={searchTxt} onChange={handleSearch} />
      </div>
      <Table
        ref={tableRef}
        column={[
          { accessor: 'unitId', header: 'Unit ID', sort: true },
          { accessor: 'request', header: 'Request', sort: true },
          { accessor: 'requestDiff', header: '%Change' },
          { accessor: 'impression', header: 'Impression', sort: true },
          { accessor: 'impressionDiff', header: '%Change' },
          { accessor: 'revenue', header: 'Revenue', sort: true },
          { accessor: 'revenueDiff', header: '%Change' },
          { accessor: 'ecpm', header: 'eCPM', sort: true },
          { accessor: 'ecpmDiff', header: '%Change' },
          { accessor: 'rpm', header: 'RPM', sort: true },
          { accessor: 'rpmDiff', header: '%Change' }
        ]}
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

export default List