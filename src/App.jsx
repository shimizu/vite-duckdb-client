import { useEffect, useState } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';

async function initDB() {
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
  const worker = await duckdb.createWorker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  return db;
}

export default function App() {
  const [db, setDB] = useState(null);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const db = await initDB();
        setDB(db);

        const conn = await db.connect();
        const response = await fetch('/data/parquet_police_station.parquet');
        const buffer = await response.arrayBuffer();
        await db.registerFileBuffer('data.parquet', new Uint8Array(buffer));
        
        await conn.query("INSTALL spatial;");
        await conn.query("LOAD spatial;");
        
        const result = await conn.query("SELECT ST_AsText(geometry) as geom_wkt FROM 'data.parquet' LIMIT 10;");
        setRows(result.toArray().map(Object.fromEntries));

        await conn.close();
      } catch (e) {
        setError(e.toString());
        console.error(e);
      }
    })();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>DuckDB-WASM: Read Parquet</h1>
      {error && <pre style={{ color: 'red' }}>{error}</pre>}
      <pre>{rows ? JSON.stringify(rows, null, 2) : 'Loading...'}</pre>
    </main>
  );
}