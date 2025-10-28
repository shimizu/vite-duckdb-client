TL;DR: DuckDB-Wasm users can now load DuckDB extensions, allowing them to run extensions in the browser.

In this blog post, we will go over two exciting DuckDB features: the DuckDB-Wasm client and DuckDB extensions. I will discuss how these disjoint features have now been adapted to work together. These features are now available for DuckDB-Wasm users and you can try them out at shell.duckdb.org.

DuckDB Extensions
DuckDB's philosophy is to have a lean core system to ensure robustness and portability. However, a competing design goal is to be flexible and allow a wide range of functionality that is necessary to perform advanced analytics. To accommodate this, DuckDB has an extension mechanism for installing and loading extensions during runtime.

Running DuckDB Extensions Locally
For DuckDB, here is a simple end-to-end example using the command line interface:

INSTALL tpch;
LOAD tpch;
CALL dbgen(sf = 0.1);
PRAGMA tpch(7);

This script first installs the TPC-H extension from the official extension repository, which implements the popular TPC-H benchmark. It then loads the TPC-H extension, uses it to populate the database with generated data using the dbgen function. Finally, it runs TPC-H query 7.

This example demonstrates a case where we install an extension to complement DuckDB with a new feature (the TPC-H data generator), which is not part of the base DuckDB executable. Instead, it is downloaded from the extension repository, then loaded and executed it locally within the framework of DuckDB.

Currently, DuckDB has several extensions. These add support for filesystems, file formats, database and network protocols. Additionally, they implement new functions such as full text search.

DuckDB-Wasm
In an effort spearheaded by André Kohn, DuckDB was ported to the WebAssembly platform in 2021. WebAssembly, also known as Wasm, is a W3C standard language developed in recent years. Think of it as a machine-independent binary format that you can execute from within the sandbox of a web browser.

Thanks to DuckDB-Wasm, anyone has access to a DuckDB instance only a browser tab away, with all computation being executed locally within your browser and no data leaving your device. DuckDB-Wasm is a library that can be used in various deployments (e.g., notebooks that run inside your browser without a server). In this post, we will use the Web shell, where SQL statements are entered by the user line by line, with the behavior modeled after the DuckDB CLI shell.

DuckDB Extensions, in DuckDB-Wasm!
DuckDB-Wasm now supports DuckDB extensions. This support comes with four new key features. First, the DuckDB-Wasm library can be compiled with dynamic extension support. Second, DuckDB extensions can be compiled to a single WebAssembly module. Third, users and developers working with DuckDB-Wasm can now select the set of extensions they load. Finally, the DuckDB-Wasm shell's features are now much closer to the native CLI functionality.

Using the TPC-H Extension in DuckDB-Wasm
To demonstrate this, we will again use the TPC-H data generation example. To run this script in your browser, start an online DuckDB shell that runs these commands. The script will generate the TPC-H data set at scale factor 0.1, which corresponds to 100 MB in uncompressed CSV format.

Once the script is finished, you can keep executing queries, or you could even download the customer.parquet file (1 MB) using the following commands:

COPY customer TO 'customer.parquet';
.files download customer.parquet

This will first copy the customer.parquet to the DuckDB-Wasm file system, then download it via your browser.

In short, your DuckDB instance, which runs entirely within your browser, first installed and loaded the TPC-H extension. It then used the extension logic to generate data and convert it to a Parquet file. Finally, you could download the Parquet file as a regular file to your local file system.

Wasm shell using the TPC-H extension

Using the Spatial Extension in DuckDB-Wasm
To show the possibilities unlocked by DuckDB-Wasm extensions and test the capabilities of what's possible, what about using the spatial extension within DuckDB-Wasm? This extension implements geospatial types and functions that allow it to work with geospatial data and relevant workloads.

To install and load the spatial extension in DuckDB-Wasm, run:

INSTALL spatial;
LOAD spatial;

Using the spatial extension, the following query uses the New York taxi dataset, and calculates the area of the taxi zones for each borough:

CREATE TABLE nyc AS
    SELECT
        borough,
        st_union_agg(geom) AS full_geom,
        st_area(full_geom) AS area,
        st_centroid(full_geom) AS centroid,
        count(*) AS count
    FROM
        st_read('https://raw.githubusercontent.com/duckdb/duckdb-spatial/main/test/data/nyc_taxi/taxi_zones/taxi_zones.shp')
GROUP BY borough;

SELECT borough, area, centroid::VARCHAR, count
FROM nyc;

Both your local DuckDB client and the online DuckDB shell will perform the same analysis.

Under the Hood
Let's dig into how this all works. The following figure shows an overview of DuckDB-Wasm's architecture. Both components in the figure run within the web browser.

Overview of the architecture of DuckDB-Wasm

When you load DuckDB-Wasm in your browser, there are two components that will be set up: (1) A main-thread wrapper library that acts as a bridge between users or code using DuckDB-Wasm and drives the background component. (2) A DuckDB engine used to execute queries. This component lives in a Web Worker and communicates with the main thread component via messages. This component has a JavaScript layer that handles messages and the original DuckDB C++ logic compiled down to a single WebAssembly file.

What happens when we add extensions to the mix?

Overview of the architecture of DuckDB-Wasm with extensions

Extensions for DuckDB-Wasm are composed of a single WebAssembly module. This will encode the logic and data of the extensions, the list of functions that are going to be imported and exported, and a custom section encoding metadata that allows verification of the extension.

To make extension loading work, the DuckDB engine component blocks, fetches, and validates external WebAssembly code, then links it in, wires together import and export, and then the system will be connected and set to keep executing as if it was a single codebase.

The central code block that makes this possible is the following:

EM_ASM(
    {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", UTF8ToString($0), false);
        xhr.responseType = "arraybuffer";
        xhr.send(null);
        var uInt8Array = xhr.response;
        // Check signatures / version compatibility left as an exercise
        WebAssembly.validate(uInt8Array);
        // Here we add the uInt8Array to Emscripten's filesystem,
        // for it to be found by dlopen
        FS.writeFile(UTF8ToString($1), new Uint8Array(uInt8Array));
    },
    filename.c_str(), basename.c_str()
);

auto lib_hdl = dlopen(basename.c_str(), RTLD_NOW | RTLD_LOCAL);
if (!lib_hdl) {
    throw IOException(
      "Extension \"%s\" could not be loaded: %s",
      filename,
      GetDLError()
    );
}

Here, we rely on two powerful features of Emscripten, the compiler toolchain we are using to compile DuckDB to WebAssembly.

First, EM_ASM allows us to inline JavaScript code directly in C++ code. It means that during runtime when we get to that block of code, the WebAssembly component will go back to JavaScript land, perform a blocking XMLHttpRequest on a URL such as https://extensions.duckdb.org/…/tpch.duckdb_extension.wasm, then validate that the package that has been just fetched is actually a valid WebAssembly module.

Second, we leverage Emscripten's dlopen implementation, which enables compatible WebAssembly modules to be linked together and act as a single composable codebase.

These enable implementing dynamic loading of extensions, when triggered via the SQL LOAD statement.

Developer Guide
We see two main groups of developers using extensions with DuckDB-Wasm.

Developers working with DuckDB-Wasm: If you are building a website or a library that wraps DuckDB-Wasm, the new extension support means that there is now a wider range of functionality that can be exposed to your users.
Developers working on DuckDB extensions: If you have written a DuckDB extension, or are thinking of doing so, consider porting it to DuckDB-Wasm. The DuckDB extension template repository contains the configuration required for compiling to DuckDB-Wasm.
Limitations
DuckDB-Wasm extensions have a few inherent limitations. For example, it is not possible to communicate with native executables living on your machine, which is required by some extensions, such as the postgres scanner extension. Moreover, compilation to Wasm may not be currently supported for some libraries you are relying on, or capabilities might not be one-to-one with local executables due to additional requirements imposed on the browser, in particular around non-secure HTTP requests.

Conclusions
In this blog post, we explained how DuckDB-Wasm supports extensions, and demonstrated with multiple extensions: TPC-H, Parquet, and spatial.

Thanks to the portability of DuckDB, the scripts shown in this blog post also work on your smartphone:

Wasm shell using the TPC-H extension on iOS

For updates on the latest developments, follow this blog and join the Wasm channel in our Discord. If you have an example of what's possible with extensions in DuckDB, let us know!