Vite + React + DuckDB-WASM（Next.js を使わない代替）
B-1) 完全クライアント（ブラウザ内 DuckDB）
1) Vite テンプレ作成
pnpm create vite@latest vite-duckdb-client --template react-ts
cd vite-duckdb-client
pnpm i
pnpm add @duckdb/duckdb-wasm

2) 公開データ
/public
  /data
    sales.parquet

3) クエリUI（ブラウザで直接 Parquet を読む）

src/App.tsx を以下で置き換え：

import { useEffect, useState, useTransition } from 'react';
import { AsyncDuckDB, DuckDBBundles } from '@duckdb/duckdb-wasm';

async function initDB() {
  const bundle = DuckDBBundles.selectBundle({
    mvp: { mainModule: await import('@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url') as any },
    eh:  { mainModule: await import('@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url') as any },
  });
  const db = new AsyncDuckDB(bundle);
  await db.instantiate();
  return db;
}

export default function App() {
  const [db, setDB] = useState<AsyncDuckDB | null>(null);
  const [rows, setRows] = useState<any[] | null>(null);
  const [sql, setSQL] = useState(
    'SELECT category, SUM(revenue) AS rev FROM base GROUP BY 1 ORDER BY 2 DESC LIMIT 10'
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    (async () => setDB(await initDB()))();
  }, []);

  const run = async () => {
    if (!db) return;
    const conn = await db.connect();
    // fetch parquet into memory
    const resp = await fetch('/data/parquet_police_station.parquet', { cache: 'no-store' });
    const buf = new Uint8Array(await resp.arrayBuffer());
    const vfsPath = '/data.parquet';
    await db.registerFileBuffer(vfsPath, buf);

    const result = await conn.query<any[]>(`
      WITH base AS (SELECT * FROM read_parquet('${vfsPath}'))
      ${sql}
    `);
    setRows(result);
    await conn.close();
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>DuckDB-WASM in Browser</h1>
      <textarea rows={5} style={{ width: 600 }} value={sql} onChange={(e) => setSQL(e.target.value)} />
      <div>
        <button onClick={() => startTransition(run)} disabled={!db || isPending}>
          {isPending ? 'Running…' : 'Run SQL'}
        </button>
      </div>
      <pre>{rows ? JSON.stringify(rows, null, 2) : 'No results yet'}</pre>
    </main>
  );
}

4) 動作確認
pnpm dev


http://localhost:5173
 を開く

「Run SQL」→ JSON が出ればOK（完全クライアントで実行）

補足: 公開ファイルのURLはCORS影響を受けます。自サーバー配下（/public）に置くのが無難。