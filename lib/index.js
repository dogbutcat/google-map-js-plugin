~(function(a) {
    var map, // map object
        _mapNode,
        drawingManager, // draw manager
        _allDrawing = [], // all overlays
        drawEvt = [], // all polygon overlays
        markers = [], // all markers
        _polygon, // draw polygon
        _lastMarker, // last marker
        _displayPolygon = [], // show pass in polygons path
        _displayRoutines = [],
        _displayPolylines = [],
        EditMenu = null,
        drawMapListener = null,
        _isEdited = false; // pass in polygons path is changed

    function initMap(elementNode, mapOptions, polygonPaths, options, cb) {
        if (!window.google) {
            cb && cb("No Google Map Detected!");
            // _error("No Google Map Detected!");
            return;
        }

        function DeleteMenu() {
            this.div_ = document.createElement("div");
            this.div_.className = "delete-menu";
            this.div_.innerHTML = "删除";
            var menu = this;
            google.maps.event.addDomListener(this.div_, "click", function() {
                menu.removeVertex();
            });
        }

        DeleteMenu.prototype = new google.maps.OverlayView();

        DeleteMenu.prototype.onAdd = function() {
            var deleteMenu = this;
            var map = this.getMap();
            this.getPanes().floatPane.appendChild(this.div_);

            this.divListener_ = google.maps.event.addDomListener(
                map.getDiv(),
                "mousedown",
                function(e) {
                    if (e.target != deleteMenu.div_) {
                        deleteMenu.close();
                    }
                },
                true
            );
        };

        DeleteMenu.prototype.onRemove = function() {
            google.maps.event.removeListener(this.divListener_);
            this.div_.parentNode.removeChild(this.div_);
            //clean up
            this.set("position");
            this.set("path");
            this.set("vertex");
        };

        DeleteMenu.prototype.close = function() {
            this.setMap(null);
        };

        DeleteMenu.prototype.draw = function() {
            var position = this.get("position");
            var projection = this.getProjection();
            if (!position || !projection) {
                return;
            }

            var point = projection.fromLatLngToDivPixel(position);
            this.div_.style.top = point.y + "px";
            this.div_.style.left = point.x + "px";
        };

        DeleteMenu.prototype.open = function(map, path, vertex) {
            // console.log(this.set);
            this.set("position", path.getAt(vertex));
            this.set("path", path);
            this.set("vertex", vertex);
            this.setMap(map);
            this.draw();
        };

        DeleteMenu.prototype.removeVertex = function() {
            var path = this.get("path");
            var vertex = this.get("vertex");

            if (!path || vertex == undefined) {
                this.close();
                return;
            }

            path.removeAt(vertex);
            this.close();
        };

        EditMenu = DeleteMenu;

        if (elementNode) {
            _mapNode = elementNode;
            map = new google.maps.Map(elementNode, mapOptions);
            injectGoogleMapPolygon();
            polygonPaths.length > 0 &&
                loadPolygons({
                    polygonPaths,
                    polygonOptions: options["polygonOptions"]
                });
            cb && cb(null);
        } else {
            cb && cb("Please check your DOM mount point!");
            // _error("Please check your DOM mount point!");
            return;
        }
    }

    function _loadPolygon(pathArr, mapTarget, options) {
        var tempPolygon = null;
        var polygonOptions = options || {
            editable: true,
            // draggable: true
            draggable: false
        };
        polygonOptions["paths"] = pathArr;
        tempPolygon = new google.maps.Polygon(polygonOptions);
        // google.maps.event.addListener(tempPolygon, 'rightclick', function(event) {
        //   if (event.vertex == undefined) {
        //     return;
        //   } else {
        //     removeVertex(tempPolygon,event.vertex);
        //   }
        // });
        var deleteMenu = new EditMenu();
        google.maps.event.addListener(tempPolygon, "rightclick", function(
            event
        ) {
            if (event.vertex == undefined) {
                return;
            } else {
                // removeVertex(tempPolygon,event.vertex);
                deleteMenu.open(map, tempPolygon.getPath(), event.vertex);
            }
        });
        _displayPolygon.push(tempPolygon);
        tempPolygon.setMap(mapTarget);
    }

    // function removeVertex(poly, vertex) {
    //     var path = poly.getPath();
    //     path.removeAt(vertex);
    // }

    function loadPolygons(polygons) {
        // draw the polygons

        var polygonPaths = polygons["polygonPaths"],
            options = Array.isArray(polygons["polygonOptions"])
                ? polygons["polygonOptions"]
                : [polygons["polygonOptions"]];

        if (polygonPaths && polygonPaths.length > 0) {
            if (polygonPaths[0] instanceof Array) {
                // multi path draw
                calcMapOption = getZoomLevelFromPoints(
                    polygonPaths.reduce(function(pre, cur) {
                        return pre.concat(cur);
                    }, [])
                );
                updateMapOption({
                    zoom: calcMapOption.zoom,
                    center: calcMapOption.center
                });
                polygonPaths.forEach(function(val, i) {
                    _loadPolygon(val, map, options[i] || options[0]);
                });
            } else {
                calcMapOption = getZoomLevelFromPoints(routinePaths["path"]);
                updateMapOption({
                    zoom: calcMapOption.zoom,
                    center: calcMapOption.center
                });
                _loadPolygon(polygonPaths, map, options[0]);
            }
        }
    }

    function _loadRoutine(routinePath, mapTarget, options) {
        var tempPolyline = null,
            startMarker = null,
            endMarker = null;
        var markerSize = 50,
            fontSize = 16,
            labelVertOffset = 20;
        var routineOptions = options || {
            editable: false,
            draggable: false
        };
        // https://developers.google.com/maps/documentation/javascript/reference/marker?hl=zh-cn#MarkerOptions
        var startMarkerOptions = (options && options["startMarkerOptions"]) || {
            clickable: false,
            animation: google.maps.Animation.DROP,
            label: {
                text: "A",
                color: "#eb3a44",
                fontSize: fontSize + "px",
                fontWeight: "bold"
            }
        };
        Object.assign(startMarkerOptions, options["startMarkerOptions"]);
        var startMarkerIcon = {
            url: "icons/green.svg",
            scaledSize: new google.maps.Size(markerSize, markerSize),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(25, markerSize + 2),
            labelOrigin: new google.maps.Point(markerSize / 2, labelVertOffset)
        };
        startMarkerOptions["icon"] = startMarkerIcon;
        var endMarkerOptions = (options && options["endMarkerOptions"]) || {
            clickable: false,
            animation: google.maps.Animation.DROP,
            label: {
                text: "B",
                color: "#eb3a44",
                fontSize: fontSize + "px",
                fontWeight: "bold"
            }
        };
        Object.assign(endMarkerOptions, options["endMarkerOptions"]);
        var endMarkerIcon = {
            url: "icons/red.svg",
            scaledSize: new google.maps.Size(markerSize, markerSize),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(25, markerSize),
            labelOrigin: new google.maps.Point(markerSize / 2, labelVertOffset)
        };
        endMarkerOptions["icon"] = endMarkerIcon;

        startMarkerOptions["position"] = routinePath["from"];
        endMarkerOptions["position"] = routinePath["to"];
        routineOptions["path"] = routinePath["path"];

        tempPolyline = new google.maps.Polyline(routineOptions);
        startMarker = new google.maps.Marker(startMarkerOptions);
        endMarker = new google.maps.Marker(endMarkerOptions);

        var deleteMenu = new EditMenu();
        routineOptions.editable &&
            google.maps.event.addListener(tempPolyline, "rightclick", function(
                event
            ) {
                if (event.vertex == undefined) {
                    return;
                } else {
                    // removeVertex(tempPolygon,event.vertex);
                    deleteMenu.open(map, tempPolyline.getPath(), event.vertex);
                }
            });

        // _displayRoutines.push({startMarker,endMarker,polyline:tempPolyline}); // temp disable routine save
        tempPolyline.setMap(mapTarget);
        startMarker.setMap(mapTarget);
        endMarker.setMap(mapTarget);
    }

    function loadRoutines(routine) {
        var routinePaths = routine["routinePaths"],
            options = Array.isArray(routine["routineOptions"])
                ? routine["routineOptions"]
                : [routine["routineOptions"]],
            calcMapOption;
        if (routinePaths && routinePaths.length > 0) {
            // multi path draw
            calcMapOption = getZoomLevelFromPoints(
                routinePaths.reduce(function(pre, cur) {
                    return pre.concat(cur["path"]);
                }, [])
            );
            updateMapOption({
                zoom: calcMapOption.zoom,
                center: calcMapOption.center
            });
            routinePaths.forEach(function(val, i) {
                _loadRoutine(val, map, options[i] || options[0]);
            });
        } else {
            calcMapOption = getZoomLevelFromPoints(routinePaths["path"]);
            updateMapOption({
                zoom: calcMapOption.zoom,
                center: calcMapOption.center
            });
            /**
             * @param {{from:{{lat:number,lng:number}},to:{{lat:number,lng:number}},pathArr:{Array}}} routinePaths - 线路路径对象
             */
            _loadRoutine(routinePaths, map, options[0]);
        }
    }

    function cleanRoutines() {
        _displayRoutines.forEach(function(val) {
            val["startMarker"].setMap(null);
            val["endMarker"].setMap(null);
            val["polyline"].setMap(null);
        });
        _displayRoutines = [];
    }

    function cleanPolygons() {
        _displayPolygon.forEach(function(val) {
            val.setMap(null);
        });
        _displayPolygon = [];
    }

    function _loadPolyline(pathArr, mapTarget, options) {
        var tempPolyline = null;
        var polylineOptions = (options && options["polylineOptions"]) || {
            editable: false,
            // draggable: true
            draggable: false
        };
        polylineOptions["paths"] = pathArr;
        tempPolyline = new google.maps.Polyline(polylineOptions);
        var deleteMenu = new EditMenu();
        polylineOptions.editable &&
            google.maps.event.addListener(tempPolyline, "rightclick", function(
                event
            ) {
                if (event.vertex == undefined) {
                    return;
                } else {
                    deleteMenu.open(map, tempPolyline.getPath(), event.vertex);
                }
            });
        _displayPolylines.push(tempPolyline);
        tempPolyline.setMap(mapTarget);
    }

    function loadPolylines(polyline) {
        var polylinePaths = polyline["polylinePaths"],
            options = Array.isArray(polyline["polylineOptions"])
                ? polyline["polylineOptions"]
                : [polyline["polylineOptions"]];
        if (polylinePaths && polylinePaths.length > 0) {
            if (polylinePaths[0] instanceof Array) {
                // multi path draw
                polylinePaths.forEach(function(val, i) {
                    _loadPolyline(val, map, options[i] || options[0]); // if not exist use first[must exist] or use random?
                });
            } else {
                _loadPolyline(polylinePaths, map, options[0]);
            }
        }
    }

    function startDrawing() {
        drawingManager =
            drawingManager ||
            new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.drawing.OverlayType.TOP_CENTER,
                    drawingModes: [
                        //'marker',
                        // 'circle',
                        "polygon"
                        //'polyline',
                        // 'rectangle'
                    ]
                },
                polygonOptions: {
                    draggable: false,
                    editable: true
                }
            });

        drawMapListener =
            drawMapListener ||
            google.maps.event.addListener(
                drawingManager,
                "overlaycomplete",
                function(event) {
                    if (event.type === "polygon") {
                        _polygon = event.overlay;
                        drawEvt.push(event.overlay);
                    }
                    _allDrawing.push(event.overlay);
                }
            );
        drawingManager.setMap(map);
        return {
            stopDrawing
        };
    }

    function stopDrawing() {
        drawMapListener &&
            (google.maps.event.removeListener(drawMapListener),
            (drawMapListener = null));
        drawingManager.setMap(null);
    }

    function undoLastDrawing() {
        var last = drawEvt.pop();
        _polygon = drawEvt[drawEvt.length - 1];
        last && last.setMap(null);
    }

    function cleanDrawing() {
        _allDrawing.forEach(function(val) {
            val.setMap(null);
        });
        _polygon = null;
        _allDrawing = [];
        drawEvt = [];
    }

    function checkPoint(point) {
        if (!point) {
            _error("Please check Your point!");
            return;
        }
        var lng = point["lng"];
        var lat = point["lat"];
        if (!lng || !lat) {
            _error("Please input Longitude or Latitude!");
            return;
        }
        if (!_lastMarker) {
            _lastMarker = new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map: map
            });
            // markers.push(_lastMarker);
        } else if (
            parseInt(_lastMarker.getPosition().lat() * 10e6) !==
                parseInt(lat * 10e6) ||
            parseInt(_lastMarker.getPosition().lng() * 10e6) !==
                parseInt(lng * 10e6)
        ) {
            _lastMarker = new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map: map
            });
            // markers.push(_lastMarker);
        } else {
            _lastMarker.setMap(map);
        }
        markers.push(_lastMarker);

        if (_polygon) {
            return _polygon.containsLatLng(lat, lng);
        } else {
            _error("Not detect region!");
            return;
        }
    }

    function removeLastMarker() {
        var lastMarker = markers.pop();
        lastMarker && lastMarker.setMap(null);
    }

    function injectGoogleMapPolygon() {
        if (!google.maps.Polygon.prototype.getBounds) {
            google.maps.Polygon.prototype.getBounds = function(latLng) {
                var bounds = new google.maps.LatLngBounds(),
                    paths = this.getPaths(),
                    path,
                    p,
                    i;

                for (p = 0; p < paths.getLength(); p++) {
                    path = paths.getAt(p);
                    for (i = 0; i < path.getLength(); i++) {
                        bounds.extend(path.getAt(i));
                    }
                }

                return bounds;
            };
        }

        // Polygon containsLatLng - method to determine if a latLng is within a polygon
        google.maps.Polygon.prototype.containsLatLng = function(latLng) {
            // Exclude points outside of bounds as there is no way they are in the poly

            var inPoly = false,
                bounds,
                lat,
                lng,
                numPaths,
                p,
                path,
                numPoints,
                i,
                j,
                vertex1,
                vertex2;

            // Arguments are a pair of lat, lng variables
            if (arguments.length === 2) {
                if (
                    typeof arguments[0] === "number" &&
                    typeof arguments[1] === "number"
                ) {
                    lat = arguments[0];
                    lng = arguments[1];
                }
            } else if (arguments.length === 1) {
                bounds = this.getBounds();

                if (!bounds && !bounds.contains(latLng)) {
                    return false;
                }
                lat = latLng.lat();
                lng = latLng.lng();
            } else {
                _error(
                    "Wrong number of inputs in google.maps.Polygon.prototype.contains.LatLng"
                );
            }

            // Ray cast point in polygon method

            numPaths = this.getPaths().getLength();
            for (p = 0; p < numPaths; p++) {
                path = this.getPaths().getAt(p);
                numPoints = path.getLength();
                j = numPoints - 1;

                for (i = 0; i < numPoints; i++) {
                    vertex1 = path.getAt(i);
                    vertex2 = path.getAt(j);

                    if (
                        (vertex1.lng() < lng && vertex2.lng() >= lng) ||
                        (vertex2.lng() < lng && vertex1.lng() >= lng)
                    ) {
                        if (
                            vertex1.lat() +
                                ((lng - vertex1.lng()) /
                                    (vertex2.lng() - vertex1.lng())) *
                                    (vertex2.lat() - vertex1.lat()) <
                            lat
                        ) {
                            inPoly = !inPoly;
                        }
                    }

                    j = i;
                }
            }

            return inPoly;
        };
    }

    function loadMap(options) {
        var api_key = options["API_KEY"],
            map_options = options["map_options"] || {
                zoom: 4,
                center: { lat: 30.1959666, lng: 120.2137009 }
            },
            node_name = options["node_name"],
            polygons = options["polygon"],
            polyline = options["polyline"],
            routine = options["routine"],
            cb = options["on_load"];

        function delegateLoadCallback(err) {
            if (!err) {
                polygons && loadPolygons(polygons);
                polyline && loadPolylines(polyline);
                routine && loadRoutines(routine);
            }
            cb && cb(err);
        }

        if (typeof window.google === "undefined") {
            const script = document.createElement("script");
            script.src = `//maps.googleapis.com/maps/api/js?key=${api_key}&libraries=drawing`;
            script.async = true;
            script.onload = function() {
                initMap(
                    (typeof node_name === "string" &&
                        document.getElementById(node_name)) ||
                        node_name,
                    map_options,
                    polygons,
                    options,
                    delegateLoadCallback
                );
            };
            document.body.append(script);
        } else {
            initMap(
                (typeof node_name === "string" &&
                    document.getElementById(node_name)) ||
                    node_name,
                map_options,
                polygons,
                options,
                delegateLoadCallback
            );
        }
    }

    function getMap() {
        return map || false;
    }

    function getDrawingManager() {
        return drawingManager || false;
    }

    function _getPoints(polygon) {
        var pointArr = [];
        var pathArray = polygon
            .getPaths()
            .getArray()[0]
            .getArray();
        pathArray.forEach(val => {
            pointArr.push({ lat: val.lat(), lng: val.lng() });
        });
        return pointArr;
    }

    function _getCenter(polygonPath) {
        var bounds = new google.maps.LatLngBounds(),
            point = {};
        var i;
        for (i = 0; i < polygonPath.length; i++) {
            bounds.extend(polygonPath[i]);
        }
        point["lat"] = bounds.getCenter().lat();
        point["lng"] = bounds.getCenter().lng();
        return point;
    }

    function getDrawPoints() {
        var latLngArray = [];
        // if (_polygon) {
        //   var pathArray = _polygon
        //     .getPaths()
        //     .getArray()[0]
        //     .getArray();
        //   pathArray.forEach(val => {
        //     latLngArray.push({ lat: val.lat(), lng: val.lng() });
        //   });
        // }
        if (drawEvt) {
            if (drawEvt.length === 1) {
                latLngArray = _getPoints(drawEvt[0]);
            } else if (drawEvt.length > 1) {
                drawEvt.forEach(function(val) {
                    latLngArray.push(_getPoints(val));
                });
            }
        }
        return latLngArray;
    }

    function getCenterPoints() {
        var latLngArr = [];
        if (drawEvt) {
            if (drawEvt.length === 1) {
                latLngArr = _getCenter(
                    drawEvt[0]
                        .getPaths()
                        .getArray()[0]
                        .getArray()
                );
            } else if (drawEvt.length > 1) {
                drawEvt.forEach(function(val) {
                    latLngArr.push(
                        _getCenter(
                            val
                                .getPaths()
                                .getArray()[0]
                                .getArray()
                        )
                    );
                });
            }
        }
        return latLngArr;
    }

    function getPolygonPoints() {
        var latLngArray = [];
        if (_displayPolygon) {
            if (_displayPolygon.length === 1) {
                // single one
                latLngArray = _getPoints(_displayPolygon[0]);
            } else if (_displayPolygon.length > 1) {
                // multiple
                _displayPolygon.forEach(function(val) {
                    latLngArray.push(_getPoints(val));
                });
            }
        }
        return latLngArray;
    }

    //#region resize region to fit size
    function _getMapNodeSize() {
        var __mapNode = _mapNode,
            __rectInfo = __mapNode.getBoundingClientRect();
        return {
            height: __rectInfo.height,
            width: __rectInfo.width
        };
    }

    function _createMarkerForPoint(point) {
        // {lat,lng}
        return new google.maps.Marker({
            position: new google.maps.LatLng(point.lat, point.lng)
        });
    }

    function createBoundsForMarkersOrExistedOne(points, bounds) {
        // [[{lat,lng},{lat,lng}],[{lat,lng}]]
        bounds = bounds || new google.maps.LatLngBounds(); // use existed one or create new one
        points = Array.isArray(points[0]) ? points : [points]; // fit the data structure
        var markers = [],
            i,
            j,
            pointArr;
        for (i = 0; i < points.length; i++) {
            pointArr = points[i];
            for (j = 0; j < pointArr.length; j++) {
                markers.push(_createMarkerForPoint(pointArr[j]));
            }
        }

        if (markers.length > 0) {
            // add each marker's position to bounds
            for (i = 0; i < markers.length; i++) {
                bounds.extend(markers[i].getPosition());
            }
        } else {
            _error("point");
        }

        return bounds;
    }

    function getZoomLevelFromPoints(points, bounds, opts) {
        var mapSize = _getMapNodeSize(),
            extendedBounds = createBoundsForMarkersOrExistedOne(points, bounds);
        return getZoomLevelFromBounds(extendedBounds, mapSize, opts);
    }

    function getZoomLevelFromBounds(bounds, mapNode, opts) {
        if (!bounds || !mapNode) {
            _error("point bounds not exist!");
            return {};
        }

        var WORLD_SIZE = { height: 256, width: 256 },
            ZOOM_MAX = 21,
            mSin = Math.sin,
            mLog = Math.log,
            PI = Math.PI,
            LN2 = Math.LN2,
            mFloor = Math.floor,
            mMax = Math.max,
            mMin = Math.min,
            lat2Rad,
            getZoomLevel;

        lat2Rad = function(lat) {
            var sin = mSin((lat * PI) / 180),
                radX2 = mLog((1 + sin) / (1 - sin)) / 2;
            return mMax(mMin(radX2, PI), -PI) / 2;
        };
        getZoomLevel = function(mapPx, worldPx, fraction) {
            return mFloor(mLog(mapPx / worldPx / fraction) / LN2);
        };

        var ne = bounds.getNorthEast(),
            sw = bounds.getSouthWest(),
            lngDiff,
            latFraction,
            lngFraction,
            latZoom,
            lngZoom;

        lngDiff = ne.lng() - sw.lng();
        latFraction = (lat2Rad(ne.lat()) - lat2Rad(sw.lat())) / PI;
        lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

        latZoom = getZoomLevel(mapNode.height, WORLD_SIZE.height, latFraction);
        lngZoom = getZoomLevel(mapNode.width, WORLD_SIZE.width, lngFraction);

        return {
            center: bounds.getCenter(),
            zoom: mMin(latZoom, lngZoom, ZOOM_MAX)
        };
    }

    function updateMapOption(options) {
        map.setCenter(options.center);
        map.setZoom(options.zoom);
    }

    //#endregion

    function _error(msg) {
        console.error(msg);
    }

    a.mapObj = {
        loadMap,
        startDrawing,
        cleanDrawing,
        cleanPolygons,
        cleanRoutines,
        removeLastMarker,
        undoLastDrawing,
        getMap,
        getDrawingManager,
        getDrawPoints,
        getPolygonPoints,
        getCenterPoints,
        checkPoint
    };
})(window);
