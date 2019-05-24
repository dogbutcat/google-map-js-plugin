var API_KEY = "REPLACE THIS WITH YOUR OWN";
// Example Code
var drawObj;
function draw() {
  drawObj = mapObj.startDrawing();
}

function stop() {
  drawObj && drawObj.stopDrawing();
}

function check() {
  var lng = parseFloat(document.getElementById("lng").value);
  var lat = parseFloat(document.getElementById("lat").value);
  var ret = mapObj.checkPoint({ lat, lng });
  if (typeof ret !== "undefined") {
    alert(ret);
  }
}

function clear() {
  mapObj.cleanDrawing();
}

function getDrawPoints() {
    var pointArr = mapObj.getDrawPoints();
    console.log(pointArr);
}

function getPolygonPoints() {
  var pointArr = mapObj.getPolygonPoints();
  console.log(pointArr);
}

function getPolygonCenters() {
    var centerPoint = mapObj.getCenterPoints();
    console.log(centerPoint);
}

function undo() {
    mapObj.undoLastDrawing();
}

function removeMarker() {
    mapObj.removeMarker();
}

function closeModal() {
  stop();
  modal.style.display = "none";
}

// Get the modal
var modal = document.getElementById("myModal");

// When the user clicks on the button, open the modal
modalBtn.onclick = function() {
  modal.style.display = "block";

  mapObj.loadMap({
    API_KEY: API_KEY,
    node_name: "map",
    map_options: {
      center: { lat: -8.7467172, lng: 115.166787 },
      zoom: 10
    },
    polygon: {
      polygonOptions:[ {
          editable: false,
          draggable: false,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.3
      },{
        editable: true,
        draggable: false,
        strokeColor: '#0000FF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#0000FF',
        fillOpacity: 0.3
    } ],
      polygonPaths: [
        [  { lat: 30.199545929361474, lng: 120.21756730429502 },
          { lat: 30.19227585989521, lng: 120.20404897085996 },
          { lat: 30.18964218188118, lng: 120.21829686514707 }],
        [
          { lat: 31.199545929361474, lng: 120.21756730429502 },
          { lat: 31.19227585989521, lng: 120.20404897085996 },
          { lat: 31.18964218188118, lng: 120.21829686514707 }
        ]
      ]
      // polygonPaths:[[{"lat":51.472817256422,"lng":-0.12477740884673949},{"lat":51.486982677895,"lng":-0.14366016031158324},{"lat":51.491658973539,"lng":-0.13584956766021605},{"lat":51.495399664723,"lng":-0.14185771585357543},{"lat":51.49689585525,"lng":-0.14529094339263793},{"lat":51.498391996666,"lng":-0.14683589578521605},{"lat":51.501597848612,"lng":-0.1512990915859973},{"lat":51.503307544111,"lng":-0.14975413919341918},{"lat":51.504696624474,"lng":-0.15095576883209105},{"lat":51.506299356891,"lng":-0.15164241433990355},{"lat":51.507902032935,"lng":-0.15370235086334105},{"lat":51.511961893281,"lng":-0.15799388528716918},{"lat":51.51367119993,"lng":-0.1595388376797473},{"lat":51.518585099286,"lng":-0.16812190652740355},{"lat":51.522323580632,"lng":-0.17292842508209105},{"lat":51.519760083635,"lng":-0.16949519754302855},{"lat":51.521469097666,"lng":-0.15971049905670043},{"lat":51.522964432334,"lng":-0.15215739847076293},{"lat":51.523818887242,"lng":-0.14632091165435668},{"lat":51.524139303699,"lng":-0.14185771585357543},{"lat":51.525634550687,"lng":-0.1355062449063098},{"lat":51.530226788009,"lng":-0.1224599802578723},{"lat":51.530119997052,"lng":-0.12074336648834105},{"lat":51.531508259944,"lng":-0.11782512308013793},{"lat":51.531401471994,"lng":-0.1135335886563098},{"lat":51.531935409239,"lng":-0.10649547220123168},{"lat":51.531187895342,"lng":-0.10220393777740355},{"lat":51.527663735921,"lng":-0.08829936624420043},{"lat":51.525634550687,"lng":-0.08709773660552855},{"lat":51.526382155768,"lng":-0.08366450906646605},{"lat":51.521896341153,"lng":-0.0764547312344348},{"lat":51.520614598667,"lng":-0.0743947947109973},{"lat":51.518157824734,"lng":-0.0743947947109973},{"lat":51.515380442442,"lng":-0.07113322854888793},{"lat":51.514632656735,"lng":-0.07387981058013793},{"lat":51.510573034402,"lng":-0.07267818094146605},{"lat":51.510893544055,"lng":-0.07405147195709105},{"lat":51.506085662493,"lng":-0.07473811746490355},{"lat":51.501490990514,"lng":-0.0778280222500598},{"lat":51.49689585525,"lng":-0.0812612497891223},{"lat":51.494117176611,"lng":-0.08555278421295043},{"lat":51.494010300973,"lng":-0.09550914407623168},{"lat":51.495613409234,"lng":-0.10065898538482543},{"lat":51.49294153081,"lng":-0.1011739695156848},{"lat":51.489948841047,"lng":-0.10649547220123168},{"lat":51.488879975664,"lng":-0.11095866800201293},{"lat":51.487276630604,"lng":-0.11319026590240355},{"lat":51.486742169722,"lng":-0.11868342996490355},{"lat":51.482760238955,"lng":-0.11756763101470824}],[{"lat":51.474902254933,"lng":-0.13374671579254027},{"lat":51.486982677895,"lng":-0.14366016031158324},{"lat":51.491658973539,"lng":-0.13584956766021605},{"lat":51.495399664723,"lng":-0.14185771585357543},{"lat":51.49689585525,"lng":-0.14529094339263793},{"lat":51.498391996666,"lng":-0.14683589578521605},{"lat":51.501597848612,"lng":-0.1512990915859973},{"lat":51.503307544111,"lng":-0.14975413919341918},{"lat":51.504696624474,"lng":-0.15095576883209105},{"lat":51.506299356891,"lng":-0.15164241433990355},{"lat":51.507902032935,"lng":-0.15370235086334105},{"lat":51.511961893281,"lng":-0.15799388528716918},{"lat":51.51367119993,"lng":-0.1595388376797473},{"lat":51.518585099286,"lng":-0.16812190652740355},{"lat":51.522323580632,"lng":-0.17292842508209105},{"lat":51.519760083635,"lng":-0.16949519754302855},{"lat":51.521469097666,"lng":-0.15971049905670043},{"lat":51.522964432334,"lng":-0.15215739847076293},{"lat":51.523818887242,"lng":-0.14632091165435668},{"lat":51.524139303699,"lng":-0.14185771585357543},{"lat":51.525634550687,"lng":-0.1355062449063098},{"lat":51.530226788009,"lng":-0.1224599802578723},{"lat":51.530119997052,"lng":-0.12074336648834105},{"lat":51.531508259944,"lng":-0.11782512308013793},{"lat":51.531401471994,"lng":-0.1135335886563098},{"lat":51.531935409239,"lng":-0.10649547220123168},{"lat":51.531187895342,"lng":-0.10220393777740355},{"lat":51.527663735921,"lng":-0.08829936624420043},{"lat":51.525634550687,"lng":-0.08709773660552855},{"lat":51.526382155768,"lng":-0.08366450906646605},{"lat":51.521896341153,"lng":-0.0764547312344348},{"lat":51.520614598667,"lng":-0.0743947947109973},{"lat":51.518157824734,"lng":-0.0743947947109973},{"lat":51.515380442442,"lng":-0.07113322854888793},{"lat":51.514632656735,"lng":-0.07387981058013793},{"lat":51.510573034402,"lng":-0.07267818094146605},{"lat":51.510893544055,"lng":-0.07405147195709105},{"lat":51.506085662493,"lng":-0.07473811746490355},{"lat":51.501490990514,"lng":-0.0778280222500598},{"lat":51.49689585525,"lng":-0.0812612497891223},{"lat":51.494117176611,"lng":-0.08555278421295043},{"lat":51.494010300973,"lng":-0.09550914407623168},{"lat":51.495613409234,"lng":-0.10065898538482543},{"lat":51.49294153081,"lng":-0.1011739695156848},{"lat":51.489948841047,"lng":-0.10649547220123168},{"lat":51.488879975664,"lng":-0.11095866800201293},{"lat":51.487276630604,"lng":-0.11319026590240355},{"lat":51.486742169722,"lng":-0.11868342996490355},{"lat":51.482760238955,"lng":-0.11756763101470824},{"lat":51.47426072708,"lng":-0.12127980829131957}]]
    },
    // polyline: {
    //   polylinePaths: [[]]
    // },
    routine: {
      routineOptions: {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      },
      routinePaths: {
        from: { lat: -8.7467172, lng: 115.166787 },
        to: { lat: 1.3644202, lng: 103.9915308 },
        path: [
          { lat: -8.7467172, lng: 115.166787 },
          { lat: -5.7467172, lng: 110.166787 },
          { lat: -2.7467172, lng: 100.787 },
          { lat: 1.3644202, lng: 103.9915308 }
        ]
      }
    }
  });
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  switch (event.target.id) {
    case "drawBtn":
      draw();
      break;
    case "cleanBtn":
      clear();
      break;
    case "stopBtn":
      stop();
      break;
    case "checkBtn":
      check();
      break;
    case "undoBtn":
      undo();
      break;
    case "removeBtn":
      removeMarker();
      break;
    case "getGeoBtn":
      getDrawPoints();
      break;
    case "getPolygon":
      getPolygonPoints();
      break;
    case "getPolygonCenters":
        getPolygonCenters();
      break;
    case "cleanPolygon":
      mapObj.cleanPolygons();
        break;
    case "cancelBtn":
      mapObj.cleanDrawing();
      mapObj.cleanPolygons();
      closeModal();
      break;
    case "confirmBtn":
      // get the point array
      // return to server
      getDrawPoints();
      clear();
      closeModal();
      break;
  }
};
