import React from 'react';

export default function ResultTable({ table }) {
  // Arrow Tableオブジェクトがない場合は何も表示しない
  if (!table) {
    return null;
  }

  // スキーマからヘッダー名を取得
  const headers = table.schema.fields.map(field => field.name);
  // テーブルの行データをJavaScriptオブジェクトの配列に変換
  const rows = table.toArray();

  return (
    <div className="footer-table-container">
      <table className="result-table">
        <thead>
          <tr>
            {headers.map(header => <th key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map(header => (
                <td key={header}>{String(row[header])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}