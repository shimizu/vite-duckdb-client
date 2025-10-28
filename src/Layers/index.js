import { GeoJsonLayer, BitmapLayer  } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';

export function renderLayers(props) {
    const { data } = props;

    //OSMタイルを読み込みベースマップとして表示
    const tileLayer = new TileLayer({
        data: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",

        minZoom: 0,
        maxZoom: 19,
        tileSize: 256,

        renderSubLayers: (props) => {
            const {
                bbox: { west, south, east, north }
            } = props.tile;

            return new BitmapLayer(props, {
                data: null,
                image: props.data,
                bounds: [west, south, east, north]
            });
        }
    });

    const geojsonLayer = new GeoJsonLayer({
        id: 'geojson-layer',
        data: data,
        pickable: true,
        stroked: false,
        filled: true,
        pointType: 'circle',
        pointRadiusMinPixels: 5,
        getPointRadius: 10,
        getFillColor: [255, 0, 0],
    });
    

    return [tileLayer, geojsonLayer];
}
