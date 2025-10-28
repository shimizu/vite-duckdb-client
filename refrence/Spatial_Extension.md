Spatial Extension
The spatial extension provides support for geospatial data processing in DuckDB. For an overview of the extension, see our blog post.

Installing and Loading
To install the spatial extension, run:

INSTALL spatial;

Note that the spatial extension is not autoloadable. Therefore, you need to load it before using it:

LOAD spatial;

The GEOMETRY Type
The core of the spatial extension is the GEOMETRY type. If you're unfamiliar with geospatial data and GIS tooling, this type probably works very different from what you'd expect.

On the surface, the GEOMETRY type is a binary representation of “geometry” data made up out of sets of vertices (pairs of X and Y double precision floats). But what makes it somewhat special is that its actually used to store one of several different geometry subtypes. These are POINT, LINESTRING, POLYGON, as well as their “collection” equivalents, MULTIPOINT, MULTILINESTRING and MULTIPOLYGON. Lastly there is GEOMETRYCOLLECTION, which can contain any of the other subtypes, as well as other GEOMETRYCOLLECTIONs recursively.

This may seem strange at first, since DuckDB already have types like LIST, STRUCT and UNION which could be used in a similar way, but the design and behavior of the GEOMETRY type is actually based on the Simple Features geometry model, which is a standard used by many other databases and GIS software.

The spatial extension also includes a couple of experimental non-standard explicit geometry types, such as POINT_2D, LINESTRING_2D, POLYGON_2D and BOX_2D that are based on DuckDBs native nested types, such as STRUCT and LIST. Since these have a fixed and predictable internal memory layout, it is theoretically possible to optimize a lot of geospatial algorithms to be much faster when operating on these types than on the GEOMETRY type. However, only a couple of functions in the spatial extension have been explicitly specialized for these types so far. All of these new types are implicitly castable to GEOMETRY, but with a small conversion cost, so the GEOMETRY type is still the recommended type to use for now if you are planning to work with a lot of different spatial functions.

GEOMETRY is not currently capable of storing additional geometry types such as curved geometries or triangle networks. Additionally, the GEOMETRY type does not store SRID information on a per value basis. These limitations may be addressed in the future.