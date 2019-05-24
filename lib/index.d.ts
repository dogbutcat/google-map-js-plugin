type GoogleMapInstance = {};
type GoogleMapDrawingManager = {};
type PointArray = Array<LatLng> | Array<Array<LatLng>>
type Polygon = {
	polygonOptions: Object|Array<Object>,
	polygonPaths: PointArray
}
type Routine = {
	routineOptions: Object|Array<Object>,
	routinePaths: { from: LatLng, to: LatLng, path: Array<LatLng> }
}
type LatLng = {
	lat: Number,
	lng: Number
}
type GoogleMapOption = {
	center: LatLng,
	zoom: Number
}
type LoadMapOption = {
	API_KEY: String,
	map_options: GoogleMapOption,
	node_name: String,
	polygon: Polygon,
	routine: Routine,
	on_load: (err: String) => void
}
type mapObj = {
	loadMap: (LoadMapOption) => void,
	startDrawing: () => void,
	cleanDrawing: () => void,
	cleanPolygons: () => void,
	cleanRoutines: () => void,
	removeLastMarker: () => void,
	undoLastDrawing: () => void,
	getMap: () => GoogleMapInstance,
	getDrawingManager: () => GoogleMapDrawingManager,
	getDrawPoints: () => PointArray,
	getPolygonPoints: () => PointArray,
	getCenterPoints: () => LatLng,
	checkPoint: (LatLng) => Boolean
}

