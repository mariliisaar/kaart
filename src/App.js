import React, {useState} from 'react';
import './App.css';
import Map from "./Map";
import {Layers, TileLayer, VectorLayer} from "./Layers";
import {osm, vector} from "./Source";
import {fromLonLat, get} from 'ol/proj';
import {Controls, FullScreenControl} from "./Controls";


const App = () => {
  const [center, setCenter] = useState([25.0136, 58.5953]);
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
      <div>
        <p id="distance"></p>
        <p id="area"></p>
        <p id="point"></p>
      </div>
    </div>
  );
}

export default App;
