import {useContext, useEffect} from "react";
import MapContext from "../Map/MapContext";
import Draw from 'ol/interaction/Draw';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorL} from 'ol/layer';
import {Polygon} from 'ol/geom';
import {getArea, getLength} from 'ol/sphere';
import {unByKey} from "ol/Observable";

const VectorLayer = () => {
    const {map} = useContext(MapContext);
    let source = new VectorSource();
    let poly = false;
    let polygon;

    useEffect(() => {
        if (!map) return;

        let vectorLayer = new VectorL({
            source: source, 
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)',
                }),
                stroke: new Stroke({
                    color: '#730099',
                    width: 2,
                }),
            }),
        });
        map.addLayer(vectorLayer);
        vectorLayer.setZIndex(0);
        
        return () => {
            if (map) {
                map.removeLayer(vectorLayer);
            }
        };
    }, [map]);

    useEffect(() => {
        if (!map) return;
        let distance = document.getElementById("distance");
        let draw;
        let sketch;
        let type = 'LineString';

        function addInteraction() {
            draw = new Draw({
                source: source,
                type: type,
                style: new Style({
                    fill: new Fill({
                        color: 'rgba(255, 255, 255, 0.2',
                    }),
                    stroke: new Stroke({
                        color: 'rgba(0, 0, 0, 0.5',
                        lineDash: [10, 10],
                        width: 2,
                    }),
                    image: new CircleStyle({ // circle to mark current point
                        radius: 5,
                        stroke: new Stroke({
                            color: 'rgba(0, 0, 0, 0.7)',
                        }),
                        fill: new Fill({
                            color: 'rgba(255, 255, 255, 0.2)',
                        }),
                    }),
                }),
            });
            map.addInteraction(draw);
            let listener;
            draw.on('drawstart', function(e) {
                sketch = e.feature;
                listener = sketch.getGeometry().on('change', function(evt) {
                    let geom = evt.target;
                    let out = formatLength(geom);
                    distance.innerHTML = "Teekonna pikkus on " + out;
                });
            });
    
            draw.on('drawend', function(e) {
                let coords = e.feature.getGeometry().getCoordinates();
                if (coords.length > 2 && !poly) {
                    poly = true;
                    let beginning = map.getPixelFromCoordinate([coords[0][0], coords[0][1]]);
                    let end = map.getPixelFromCoordinate([coords[coords.length - 1][0], coords[coords.length - 1][1]]);
                    if (Math.abs(Math.round(beginning[0]) - Math.round(end[0])) < 10 && Math.abs(Math.round(beginning[1]) - Math.round(end[1])) < 10) {
                        coords.push([coords[0][0], coords[0][1]]);
                        polygon = new Polygon([coords]);
                        document.getElementById("area").innerHTML = "Valitud punktide vahele jääva ala pindala on " + formatArea(polygon) + ".";
                    }
                }
                sketch = null;
                unByKey(listener);
            });
        }

        addInteraction();
    });

    useEffect (() => {
        if (!map) return;

        map.on('click', function(e) {
            if (poly) {
                if (isInsidePolygon(e.coordinate)) {
                    document.getElementById("point").innerHTML = "Klikiti polügoni sees";
                } else {
                    document.getElementById("point").innerHTML = "Klikiti polügonist väljaspool";
                }
            }
        });
    });

    let formatLength = function (line) {
        let length = getLength(line);
        let out;
        if (length > 100) {
            out = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
        } else {
            out = Math.round(length * 100) / 100 + ' ' + 'km';
        }
        return out;
    };

    let formatArea = function (polygon) {
        let area = getArea(polygon);
        let out;
        if (area > 10000) {
            out = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
        } else {
            out = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
        }
        return out;
    };

    let isInsidePolygon = function ([x, y]) {
        return polygon.intersectsCoordinate([x, y]);
    }

    return null;
};

export default VectorLayer;