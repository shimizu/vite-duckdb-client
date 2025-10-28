import { useEffect, useState, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { renderLayers } from './Layers';
import { useDuckDB } from './hooks/useDuckDB';
import { executeQuery } from './utils/queries';
import ResultTable from './components/ResultTable';
import './index.css';

const INITIAL_VIEW_STATE = {
  latitude: 35.681236, // Tokyo station
  longitude: 139.767125,
  zoom: 12,
  bearing: 0,
  pitch: 0,
};

// Arrow TableからGeoJSON FeatureCollectionを生成するヘルパー関数
function createGeoJsonFromTable(table) {
  if (!table) return null;

  // 'geojson'カラムが存在するか確認
  const geojsonField = table.schema.fields.find(f => f.name === 'geojson');
  if (!geojsonField) return null;

  const features = table.toArray().map(row => {
    const geojsonStr = row.geojson;
    if (typeof geojsonStr === 'string') {
      try {
        const properties = { ...row };
        delete properties.geojson;
        return {
          type: 'Feature',
          geometry: JSON.parse(geojsonStr),
          properties: properties,
        };
      } catch (e) {
        console.error("Failed to parse GeoJSON string:", geojsonStr, e);
        return null;
      }
    }
    return null;
  }).filter(Boolean);

  return {
    type: 'FeatureCollection',
    features: features,
  };
}

export default function App() {
  const { db, loading: dbLoading, error: dbError } = useDuckDB();
  const [queryResult, setQueryResult] = useState(null); // Arrow Tableを保持
  const [deckGlData, setDeckGlData] = useState(null);   // 地図用のGeoJSONを保持
  const [queryError, setQueryError] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [query, setQuery] = useState("SELECT *, ST_AsGeoJSON(geometry) as geojson FROM 'https://storage.googleapis.com/g3-open-resource/parquet/police_station2.parquet';");

  const handleQuery = useCallback(async () => {
    if (!db) return;

    setIsQuerying(true);
    setQueryError(null);
    setQueryResult(null);
    setDeckGlData(null);

    try {
      const resultTable = await executeQuery(db, query);
      setQueryResult(resultTable);
    } catch (e) {
      setQueryError(e.toString());
      console.error(e);
    } finally {
      setIsQuerying(false);
    }
  }, [db, query]);

  // クエリ結果が変わったら、地図用のデータを生成し直す
  useEffect(() => {
    if (queryResult) {
      const geojsonData = createGeoJsonFromTable(queryResult);
      setDeckGlData(geojsonData);
    }
  }, [queryResult]);

  const error = dbError || queryError;

  return (
    <div>
      {error && <div className="error-panel">{error}</div>}
      <div className="control-panel">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={!db || isQuerying}
        />
        <button onClick={handleQuery} disabled={!db || isQuerying}>
          {isQuerying ? '実行中...' : 'クエリ実行'}
        </button>
        {dbLoading && <span>DBを初期化中...</span>}
      </div>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={renderLayers({ data: deckGlData })} // 地図用データを渡す
      >
      </DeckGL>
      <div className="attribution">
        <a
          href="https://maps.gsi.go.jp/development/ichiran.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          © 地理院タイル
        </a>
      </div>
      <ResultTable table={queryResult} /> {/* テーブル用データ(Arrow Table)を渡す */}
    </div>
  );
}