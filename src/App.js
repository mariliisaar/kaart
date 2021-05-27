import React, {useState, useEffect} from 'react';
import './App.css';
import Map from "./Map";
import {Layers, TileLayer, VectorLayer} from "./Layers";
import {osm, Activity} from "./Source";
import {fromLonLat, get} from 'ol/proj';
import {Controls, FullScreenControl} from "./Controls";


const App = () => {
  const [center, setCenter] = useState([24.7536, 59.4370]);
  const [zoom, setZoom] = useState(9);
  const [showLayer, setShowLayer] = useState(true);

  return (
    <div>
      <Map center={fromLonLat(center)} zoom={zoom}>
        <Layers>
          <TileLayer
            source={osm()}
            zIndex={0}
          />
          {showLayer && ( 
            <VectorLayer />
          )}
        </Layers>
        <Controls>
          <FullScreenControl />
        </Controls>
      </Map>
      {/* <Activity /> */}
      <div className="info">
        <button id="clearAll">Alusta uuesti</button>
        <p id="distance"></p>
        <p id="area"></p>
        <p id="point"></p>
        <div className="credit">Icon made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect" target="_blank">Pixel perfect</a> from <a href="https://www.flaticon.com/" title="Flaticon" target="_blank">www.flaticon.com</a></div>
      </div>
    </div>
  );
}

export default App;
