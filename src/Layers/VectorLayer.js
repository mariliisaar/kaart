import {useContext, useEffect} from "react";
import MapContext from "../Map/MapContext";
import Draw from 'ol/interaction/Draw';
import {Circle as CircleStyle, Fill, Icon, Stroke, Style} from 'ol/style';
import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorL} from 'ol/layer';
import {Polygon} from 'ol/geom';
import Circle from 'ol/geom/Circle';
import Point from 'ol/geom/Point';
import {getArea, getLength} from 'ol/sphere';
import {unByKey} from "ol/Observable";
import { Feature } from "ol";
import { fromLonLat } from "ol/proj";

const VectorLayer = () => {
    const {map} = useContext(MapContext);
    let source = new VectorSource();
    let draw;
    let sketch;
    let type = 'LineString';
    let poly = false;
    let polygon;

    // Set vecor layer that will display line or polygon
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

    // Draw line or polygon
    useEffect(() => {
        if (!map) return;
        addInteraction();
    });

    // Check if click is inside or outside polygon
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

    // Set point of interest
    useEffect(() => {
        if (!map) return;

        let zoom = map.getView().getZoom();
        let style = setIconFeature(zoom);

        let vL = new VectorL({
            source: new VectorSource({
                projection: 'ESPG:4326',
            }),
        });

        let circle = new Feature(new Circle(fromLonLat([24.7453, 59.4373]), setIconRadius(zoom)));
        circle.setId('circle');
        vL.getSource().addFeature(circle);

        let point = new Feature({
            geometry: new Point(fromLonLat([24.7453, 59.4373])),
        });
        point.setId('point');

        map.on('dblclick', e => {
            let iconPixels = map.getPixelFromCoordinate(point.getGeometry().getCoordinates());
            let clickPixels = map.getPixelFromCoordinate(e.coordinate);

            const feature = map.forEachFeatureAtPixel(e.pixel, (feature) => {
                return feature;
            });

            if (feature instanceof Feature && isWithinRange(iconPixels, clickPixels, 15, 15)) {
                map.removeInteraction(draw);
                map.getView().animate({
                    zoom: 17.5,
                    center: fromLonLat([24.7453, 59.4373]),
                    duration: 250,
                });
                addInteraction();
            }
        });

        // Change cursor to pointer when over icon
        map.on('pointermove', e => {
            if (e.dragging) {
                return;
            }

            let pixel = map.getPixelFromCoordinate(point.getGeometry().getCoordinates());
            let pointer = map.getPixelFromCoordinate(e.coordinate);
            if (isWithinRange(pixel, pointer, 15, 15)) {
                map.getTarget().style.cursor = 'pointer';
            } else {
                map.getTarget().style.cursor = '';
            }
        });

        vL.getSource().addFeature(point);


        vL.setStyle(style);

        map.getView().on('change:resolution', function() {
            zoom = map.getView().getZoom();
            style = setIconFeature(zoom);
            vL.getSource().getFeatureById('circle').getGeometry().setRadius(setIconRadius(zoom));
            vL.setStyle(style);
        });

        map.addLayer(vL);
        vL.setZIndex(1);
        
        return () => {
            if (map) {
                map.removeLayer(vL);
            }
        };
    }, [map]);

    // Reset map
    useEffect(() => {
        document.getElementById("clearAll").addEventListener('click', clearAll);
    });

    // Clear map
    let clearAll = function () {
        if (!map) return;
        map.removeInteraction(draw);
        source.clear();
        poly = false;
        document.getElementById("distance").innerHTML = "";
        document.getElementById("area").innerHTML = "";
        document.getElementById("point").innerHTML = "";
        resetZoom();
        addInteraction();
    };

    // Reset zoom
    let resetZoom = function () {
        if (!map) return;

        map.getView().animate({
            zoom: 9,
            center: fromLonLat([24.7453, 59.4373]),
            duration: 250,
        });
    };

    // Add drawing functionality
    let addInteraction = function() {
        if (!map) return;

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
            }),
        });

        map.addInteraction(draw);         
        let listener;
        draw.on('drawstart', function(e) {
            sketch = e.feature;
            listener = sketch.getGeometry().on('change', function(evt) {
                let geom = evt.target;
                let out = formatLength(geom);
                document.getElementById("distance").innerHTML = "Teekonna pikkus on " + out;
            });
        });

        draw.on('drawend', function(e) {
            let coords = e.feature.getGeometry().getCoordinates();
            if (coords.length > 2 && !poly) {
                let beginning = map.getPixelFromCoordinate([coords[0][0], coords[0][1]]);
                let end = map.getPixelFromCoordinate([coords[coords.length - 1][0], coords[coords.length - 1][1]]);
                if (isWithinRange(beginning, end, 10, 0)) {
                    coords.push([coords[0][0], coords[0][1]]);
                    polygon = new Polygon([coords]);
                    poly = true;
                    map.removeInteraction(draw);
                    document.getElementById("area").innerHTML = "Valitud punktide vahele jääva ala pindala on " + formatArea(polygon) + ".";
                }
            }
            sketch = null;
            unByKey(listener);
        });
    }

    // Format line length
    let formatLength = function (line) {
        let length = getLength(line);
        let out;
        if (length > 100) {
            out = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
        } else {
            out = Math.round(length * 100) / 100 + ' ' + 'm';
        }
        return out;
    };

    // Format polygon area
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

    // Check if point is inside polygon
    let isInsidePolygon = function ([x, y]) {
        return polygon.intersectsCoordinate([x, y]);
    }

    // Set icon circle radius
    let setIconRadius = function (zoom) {
        let radius;
        if (zoom >= 17.5) {
            radius = 10;
        } else if (zoom < 17.5 && zoom >= 13.5) {
            radius = 100;
        } else if (zoom < 13.5 && zoom >= 10) {
            radius = 1000;
        } else {
            radius = 0;
        }

        return radius;
    }

    // set icon or circle style
    let setIconFeature = function (zoom) {
        let iconStyle = new Style({
            stroke: new Stroke({
                color: 'rgba(0, 0, 255, 0.7)',
            }),
            fill: new Fill({
                color: 'rgba(0, 0, 255, 0.2)',
            }),
        });

        let icon = new Style({
            image: new Icon({
                anchor: [0.5, 30],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                offset: [0, 0],
                offsetOrigin: 'bottom-left',
                rotation: 0,
                src: '../../images/location.svg',
            }),
            graphicXOffset: 0,
            graphicYOffset: 0,
        });

        let radius = setIconRadius(zoom);
        let style;

        if (radius == 0) {
            style = icon;
        } else {
            style = iconStyle;
        }

        return style;
    }

    // Check whether click is within range
    let isWithinRange = function (first, second, compare, modifier) {
        return (Math.abs(Math.round(first[0]) - Math.round(second[0])) <= compare && Math.abs(Math.round(first[1] - modifier) - Math.round(second[1])) <= compare);
    }

    return null;
};

export default VectorLayer;