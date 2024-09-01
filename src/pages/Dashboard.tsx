import { useContext, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { metricsOptionList, getDiff, getDateXAxis } from '../utils';
import { lineChartOption, barLineChartOption, scatterOption } from '../utils/chart';
import { Data } from '../interface';
import DataContext from '../contexts/DataContext';
import Table from '../components/Table';

function Dashboard() {
  const {
   analysisDate, compareDate, selectData, currencyRatio, currencyFixed
  } = useContext(DataContext);

  const [metric, setMetric] = useState('request');
  const [rank, setRank] = useState<Data[]>([]);
  const [options, setOptions] = useState(lineChartOption);
  const [chart, setChart] = useState(barLineChartOption);
  const [scatter, setScatter] = useState(scatterOption);

  useEffect(() => {
    async function _fetchData(analysisList: string[], compareList: string[]) {
      const analysis = await selectData(`
        WITH calculated_date AS (
          SELECT 
            date, SUM(impression) as impression, SUM(request) as request,
            ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${analysisList[0]}' AND '${analysisList[1]}'
          GROUP BY date
        )
        SELECT
          date, impression, request, revenue,
          ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
          ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
        FROM calculated_date
        ORDER BY date ASC`);
      const compare = await selectData(`
        WITH calculated_date AS (
          SELECT 
            date, SUM(impression) as impression, SUM(request) as request,
            ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${compareList[0]}' AND '${compareList[1]}'
          GROUP BY date
        )
        SELECT
          date, impression, request, revenue,
          ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
          ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
        FROM calculated_date
        ORDER BY date ASC`);
      const anaRank = await selectData(`
        WITH calculated_rank AS (
          SELECT 
            unitId,
            SUM(impression) as impression,
            SUM(request) as request,
            ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${analysisList[0]}' AND '${analysisList[1]}'
          GROUP BY unitId
        )
        SELECT
          unitId, impression, request, revenue,
          ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
          ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
        FROM calculated_rank
        ORDER BY ${metric} DESC
        LIMIT 10
      `);
      const comRank = await selectData(`
        WITH calculated_rank AS (
          SELECT 
            unitId,
            SUM(impression) as impression,
            SUM(request) as request,
            ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${compareList[0]}' AND '${compareList[1]}'
          GROUP BY unitId
        )
        SELECT
          unitId, impression, request, revenue,
          ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
          ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
        FROM calculated_rank
      `);

      const anaBarLine = await selectData(`
        SELECT 
          date,
          SUM(impression) AS impression,
          SUM(request) AS request,
          ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
        FROM tbl_unit_reports
        WHERE date BETWEEN '${analysisList[0]}' AND '${analysisList[1]}'
        GROUP BY date
      `);

      const anaScatter = await selectData(`
        WITH calculated_rank AS (
          SELECT 
            unitId,
            SUM(impression) as impression,
            SUM(request) as request,
            ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${analysisList[0]}' AND '${analysisList[1]}'
          GROUP BY unitId
        )
        SELECT
          unitId, impression, request, revenue,
          ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
          ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
        FROM calculated_rank
      `);

      const comScatter = await selectData(`
        WITH calculated_rank AS (
          SELECT 
            unitId,
            SUM(impression) as impression,
            SUM(request) as request,
            ROUND(SUM(revenue) * ${currencyRatio}, ${currencyFixed}) AS revenue
          FROM tbl_unit_reports
          WHERE date BETWEEN '${compareList[0]}' AND '${compareList[1]}'
          GROUP BY unitId
        )
        SELECT
          unitId, impression, request, revenue,
          ROUND(CASE WHEN impression = 0 THEN 0 ELSE ((revenue / impression) * 1000) END, ${currencyFixed}) AS ecpm,
          ROUND(CASE WHEN request = 0 THEN 0 ELSE ((revenue / request) * 1000) END, ${currencyFixed}) AS rpm
        FROM calculated_rank
      `);

      if (analysis && compare) {
        setOptions((options) => {
          const temp = JSON.parse(JSON.stringify(options));
          const dateList = getDateXAxis(analysisList, compareList);
          temp.xAxis.data = dateList;
          temp.series[0].name = metricsOptionList.find((option) => option.value === metric)?.label;
          temp.series[0].data = dateList.map((date: string) => analysis.find((d) => d.date === date)?.[metric] || null);
          temp.series[1].data = dateList.map((date: string) => compare.find((d) => d.date === date)?.[metric] || null);
          return temp
        });
      }

      if (anaRank && comRank) {
        setRank(anaRank.map((ana) => ({
          unitId: ana.unitId as string,
          target: ana[metric] as number,
          diff: getDiff(ana[metric] as number, comRank.find((com) => com.unitId === ana.unitId)?.[metric] as number || 0)
        })));
      }

      if (anaBarLine) {
        setChart((options) => {
          const temp = JSON.parse(JSON.stringify(options));
          const dateList = getDateXAxis(analysisList);
          temp.xAxis[0].data = dateList;
          temp.series[0].data = dateList.map((date: string) => anaBarLine.find((d) => d.date === date)?.request || null);
          temp.series[1].data = dateList.map((date: string) => anaBarLine.find((d) => d.date === date)?.impression || null);
          temp.series[2].data = dateList.map((date: string) => anaBarLine.find((d) => d.date === date)?.revenue || null);
          return temp;
        });
      }

      if (anaScatter && comScatter) {
        setScatter((options) => {
          const temp = JSON.parse(JSON.stringify(options));

          temp.series[0].data = anaScatter.map((item) => {
            return [item.ecpm, item.rpm];
          });

          temp.series[1].data = comScatter.map((item) => {
            return [item.ecpm, item.rpm];
          });

          return temp;
        });
      }
    }
    if (
      analysisDate.length !== 0 && analysisDate.every((date) => date) && 
      compareDate.length !== 0 && compareDate.every((date) => date)
    ) {
      _fetchData(analysisDate, compareDate);
    }
  }, [analysisDate, compareDate, selectData, metric, currencyRatio, currencyFixed]);

  return (
    <div>
      <div className='flex mb-4 gap-2'>
        {
          metricsOptionList.map((option) => (
            <div className={option.value === metric ? 'button select' : 'button'} onClick={() => setMetric(option.value)} key={option.value}>{option.label}</div>))
        }
      </div>
      <ReactECharts option={options} className='mb-4' />
      <div className='flex gap-4'>
        <div className='w-2/5'>
          <div className='text-bold text-lg'>Top 10 Unit - {metricsOptionList.find((option) => option.value === metric)?.label}</div>
          <Table
            column={[
              { accessor: 'unitId', header: 'Unit ID' },
              { accessor: 'target', header: metricsOptionList.find((option) => option.value === metric)?.label || '' },
              { accessor: 'diff', header: 'Diff.' }
            ]}
            data={rank}
            pageSize={10}
            pageCount={0}
            isLoading={false}
            onPaginationChange={() => {}}
            onSortingChange={() => {}}
          />
        </div>
        <div className='w-3/5'>
          <ReactECharts option={chart} />
          <ReactECharts option={scatter} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;