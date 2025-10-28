import { useEffect, useState } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import DeckGL from '@deck.gl/react';
import { renderLayers } from './Layers';
import './index.css';

async function initDB() {
  const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
  const worker = await duckdb.createWorker(bundle.mainWorker);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  return db;
}

const INITIAL_VIEW_STATE = {
  latitude: 35.681236, // Tokyo station
  longitude: 139.767125,
  zoom: 12,
  bearing: 0,
  pitch: 0,
};

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const db = await initDB();
        const conn = await db.connect();

        await conn.query("INSTALL spatial;");
        await conn.query("LOAD spatial;");

        const response = await fetch('/data/parquet_police_station.parquet');
        const buffer = await response.arrayBuffer();
        await db.registerFileBuffer('data.parquet', new Uint8Array(buffer));

        const result = await conn.query("SELECT ST_AsGeoJSON(geometry) as geojson FROM 'data.parquet';");
        
        const features = result.toArray().map(row => {
            const geojsonStr = row.geojson;
            if (geojsonStr) {
                return {
                    type: 'Feature',
                    geometry: JSON.parse(geojsonStr),
                    properties: {} // Add other properties if needed
                };
            }
            return null;
        }).filter(Boolean);

        const featureCollection = {
            type: 'FeatureCollection',
            features: features
        };

        setData(featureCollection);

        await conn.close();
      } catch (e) {
        setError(e.toString());
        console.error(e);
      }
    })();
  }, []);

  return (
    <div>
      {error && <div style={{ color: 'red', position: 'absolute', top: 0, left: 0, zIndex: 1, background: 'white', padding: '10px' }}>{error}</div>}
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={renderLayers({ data })}
      >
      </DeckGL>
      <div className="attribution">
        <a
          href="http://www.openstreetmap.org/about/"
          target="_blank"
          rel="noopener noreferrer"
        >
          © OpenStreetMap
        </a>
      </div>
    </div>
  );
}
