import { useState, useEffect, useCallback } from 'react';
import initSqlJs from 'sql.js';

import { RawData } from '../interface';

function useDatabase() {
  const [db, setDb] = useState<any>(null);
  const [isInsertFinish, setIsInsertFinish] = useState(false);

  useEffect(() => {
    async function _setupDatabase() {
      const SQL = await initSqlJs({ locateFile: (file) => `https://sql.js.org/dist/${file}` });
      const db = new SQL.Database();

      // 建立表格
      db.run(`
        CREATE TABLE IF NOT EXISTS tbl_unit_reports (
          date TEXT,
          impression INTEGER,
          request INTEGER,
          revenue REAL,
          ecpm REAL,
          rpm REAL,
          unitId TEXT,
          PRIMARY KEY (date, unitId)
        );`
      );

      setDb(db);
    }

    _setupDatabase();
  }, []);

  const insertData = useCallback(async (data: RawData[]) => {
    const schema = []
    let statement = ''
    for (const record of data) {
      const values = `(
        '${record.date}',
        ${record.impression},
        ${record.request},
        ${record.revenue},
        ${record.impression === 0 ? 0 : (record.revenue / record.impression) * 1000},
        ${record.request === 0 ? 0 : (record.revenue / record.request) * 1000},
        '${record.unit_id}'
      )`

      if (statement.length === 0) {
        statement = `INSERT OR REPLACE INTO tbl_unit_reports VALUES ${values}`
      } else {
        statement += `,${values}`
      }

      if (statement.length >= 600000) {
        schema.push(`${statement};`)
        statement = ''
      }
    }

    if (statement.length) {
      schema.push(`${statement};`)
      statement = ''
    }
    if (db) {
      for (const sql of schema) {
        await db.run(sql)
      }
      setIsInsertFinish(true)
    }
  }, [db]);

  const selectData = useCallback(async (query = 'SELECT * FROM items'): Promise<{ [key: string]: string | number; }[]> => {
    if (db) {
      const queryResult = await db.exec(query);
      if (queryResult.length === 0) return [];
      const { values, columns } = queryResult[0];
      return values.map((list: string[] | number[]) => {
        const temp: { [key: string]: string | number } = {};
        list.forEach((value: string | number, index: number) => {
          temp[columns[index]] = value;
        })
        return temp;
      });
    } return [];
  }, [db]);

  return {
    db,
    isInsertFinish,
    insertData,
    selectData,
  };
}

export default useDatabase;