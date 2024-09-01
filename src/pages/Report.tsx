import { useContext, useEffect, useState, useCallback } from 'react';
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import dayjs from 'dayjs';
import DataContext from '../contexts/DataContext';
import { Pagination, Sorting, Data } from '../interface';
import Table from '../components/Table';

function Report() {
  const { analysisDate, selectData, currencyRatio, currencyFixed } = useContext(DataContext);

  // Table related
  const [data, setData] = useState<Data[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [sorting, setSorting] = useState<Sorting>({ id: 'unitId', desc: false });
  const [searchTxt, setSearchTxt] = useState('');
  const pageSize = 10;

  const [isExporting, setIsExporting] = useState(false);

  const fetchData = useCallback(async (pageIndex: number, pageSize: number, sorting: Sorting) => {
    setIsLoading(true);
    try {
      setSorting(sorting);
      const countTemp = await selectData(`
        SELECT COUNT(*) as total
        FROM tbl_unit_reports
        WHERE date BETWEEN '${analysisDate[0]}' AND '${analysisDate[1]}'
        ${searchTxt !== '' ? `AND unitId LIKE '%${searchTxt}%'` : ''}
      `);
      if (countTemp) setPageCount(Math.ceil(countTemp[0].total as number / pageSize));
      const tableTemp = await selectData(`
        WITH calculated_units AS (
          SELECT 
            date, unitId, impression, request,
            ROUND(revenue * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${analysisDate[0]}' AND '${analysisDate[1]}'
          ${searchTxt !== '' ? `AND unitId LIKE '%${searchTxt}%'` : ''}
        )
        SELECT date, unitId, impression, request, revenue,
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
  }, [setPageCount, selectData, analysisDate, currencyRatio, currencyFixed, searchTxt]);

  const handleControllChange = (newPagination: Pagination, newSorting: Sorting[]) => {
    fetchData(newPagination.pageIndex, newPagination.pageSize, newSorting[0] || sorting);
  };

  const handleSearch = (e) => {
    setSearchTxt(e.target.value);
  }

  const handleExport = async () => {
    setIsExporting(true);
    const countTemp = await selectData(`
      SELECT COUNT(*) as total
      FROM tbl_unit_reports
      WHERE date BETWEEN '${analysisDate[0]}' AND '${analysisDate[1]}'
      ${searchTxt !== '' ? `AND unitId LIKE '%${searchTxt}%'` : ''}
    `);
    if (!countTemp) return;
    const split = 1000;
    const times = Math.ceil(countTemp[0].total as number / split);
    const result = [];
    let idx = 0;
    const timer = setInterval(async () => {
      if (idx === times) {
        clearInterval(timer);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Unit Report');
    
        worksheet.getRow(1).values = ['Date', 'Unit ID', 'Request', 'Impression', 'Revenue', 'eCPM', 'RPM'];
        result.forEach((record) => {
          worksheet.addRow([
            record.date,
            record.unitId,
            record.request,
            record.impression,
            record.revenue,
            record.ecpm,
            record.rpm
          ]);
        });
    
        workbook.xlsx.writeBuffer().then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          FileSaver.saveAs(blob, `unit-report-${dayjs().format('YYYY-MM-DD')}.xlsx`);
          setIsExporting(false);
        })
        return;
      }
      const tableTemp = await selectData(`
        WITH calculated_units AS (
          SELECT 
            date, unitId, impression, request,
            ROUND(revenue * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${analysisDate[0]}' AND '${analysisDate[1]}'
          ${searchTxt !== '' ? `AND unitId LIKE '%${searchTxt}%'` : ''}
        )
        SELECT date, unitId, impression, request, revenue,
        ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
        ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
        FROM calculated_units
        ORDER BY ${sorting.id} ${sorting.desc ? 'DESC' : 'ASC'}
        LIMIT ${split} OFFSET ${idx * split}`);
      if (tableTemp) {
        result.push(...tableTemp);
      }
      idx += 1;
    }, 500);
    // for (let i = 0; i < times; i++) {
    //   const tableTemp = await selectData(`
    //     WITH calculated_units AS (
    //       SELECT 
    //         date, unitId, impression, request,
    //         ROUND(revenue * ${currencyRatio}, ${currencyFixed}) AS revenue
    //       FROM tbl_unit_reports
    //       WHERE date BETWEEN '${analysisDate[0]}' AND '${analysisDate[1]}'
    //       ${searchTxt !== '' ? `AND unitId LIKE '%${searchTxt}%'` : ''}
    //     )
    //     SELECT date, unitId, impression, request, revenue,
    //     ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
    //     ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
    //     FROM calculated_units
    //     ORDER BY ${sorting.id} ${sorting.desc ? 'DESC' : 'ASC'}
    //     LIMIT ${split} OFFSET ${i * split}`);
    //   if (tableTemp) {
    //     result.push(...tableTemp);
    //   }
    // }
    // const workbook = new ExcelJS.Workbook();
    // const worksheet = workbook.addWorksheet('Unit Report');

    // worksheet.getRow(1).values = ['Date', 'Unit ID', 'Impression', 'Request', 'Revenue', 'eCPM', 'RPM'];
    // result.forEach((record) => {
    //   worksheet.addRow([
    //     record.date,
    //     record.unitId,
    //     record.impression,
    //     record.request,
    //     record.revenue,
    //     record.ecpm,
    //     record.rpm
    //   ]);
    // });

    // workbook.xlsx.writeBuffer().then((data) => {
    //   const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //   FileSaver.saveAs(blob, `unit-report-${dayjs().format('YYYY-MM-DD')}.xlsx`);
    //   setIsExporting(false);
    // })
  }

  useEffect(() => {
    if (analysisDate.length !== 0 && analysisDate.every((date) => date)) {
      fetchData(0, pageSize, sorting);
    }
  }, [analysisDate, fetchData, pageSize, sorting]);

  return (
    <div>
      <div className='flex justify-between'>
        <input type='text' placeholder='Search UnitID ...' className='w-60' value={searchTxt} onChange={handleSearch} />
        <div className='button' onClick={handleExport}>Export</div>
      </div>
      <Table
        column={[
          { accessor: 'date', header: 'Date', sort: true },
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
      {
        isExporting && (
          <div className='w-[100vw] h-[100vh] bg-white/60 absolute top-0 left-0 flex items-center justify-center'>
            <svg aria-hidden="true" className="w-16 h-16 text-gray-400 animate-spin fill-blue-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
          </div>
        )
      }
    </div>
  )
}

export default Report