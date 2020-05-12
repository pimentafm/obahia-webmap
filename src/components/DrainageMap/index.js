import React, { useState, useEffect } from "react";
import OlMap from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import OSM from "ol/source/OSM";
import { defaults } from 'ol/interaction';
import {createStringXY} from 'ol/coordinate';
import Overlay from 'ol/Overlay';

import oba from "~/services/obahiadb";

import "ol/ol.css";

import { MapContainer } from "./styles";
import Menu from "~/components/Menu";
import Scalebar from "~/components/Scalebar";
import Footer from "~/components/Footer";

import CardPlot from "~/components/CardPlot";
import Stackplot from "~/components/Stackplot/StackplotDrainage";
import Barplot from "~/components/Barplot/BarplotDrainage";

import CardReport from "~/components/CardReport";
import Report from "~/components/Report";

import Popup from "~/components/popup";

import domtoimage from 'dom-to-image';

const DrainageMap = props => {
  const [defaultYear, setYear] = useState(props.defaultYear);
  const [defaultCodeName, setCode] = useState(props.defaultCodeName);
  const [defaultCategory] = useState(props.defaultCategory);
  const [menuIsHidden] = useState(false);
  const [plotsAreHidden] = useState(false);
  const [reportIsHidden, setReportHidden] = useState(true);
  const [center, setCenter] = useState([]);
  const [zoom, setZoom] = useState([]);
  const [landuse] = useState(new TileLayer({ name: 'landuse', visible: true }));
  const [landsat] = useState(new TileLayer({ name: 'landsat', visible: false }));
  const [stackImage, setStackImage] = useState("http://obahia.dea.ufv.br/static/geonode/img/loading.png");
  const [barImage, setBarImage] = useState("http://obahia.dea.ufv.br/static/geonode/img/loading.png");

  const base_URL = "http://obahia.dea.ufv.br:8085/";

  const landuse_source = new TileWMS({
    url: base_URL + "cgi-bin/mapserv.fcgi?map=/var/www/geodb/mapfiles/landuseDrainage.map",
    params: {
      year: defaultYear,
      code: defaultCodeName.code,
      LAYERS: "landuse"
    },
    serverType: "mapserver"
  });

  const landsat_source = new TileWMS({
    url: base_URL + "cgi-bin/mapserv.fcgi?map=/var/www/geodb/mapfiles/landsatDrainage.map",
    params: {
      year: defaultYear,
      code: defaultCodeName.code,
      LAYERS: "landsat"
    },
    serverType: "mapserver"
  });

  landsat.setSource(landsat_source);
  landsat.getSource().updateParams({ time: Date.now() });
  landsat.changed();
  landuse.setSource(landuse_source);
  landuse.getSource().updateParams({ time: Date.now() });
  landuse.changed();

  const view = new View({
    projection: "EPSG:4326",
    center: center,
    zoom: zoom
  });

  const osm = new TileLayer({ source: new OSM() });

  const map = new OlMap({
    controls: [],
    target: null,
    layers: [osm, landsat, landuse],
    view: view,
    interactions: defaults({
      keyboard: false
    })
  });

  useEffect(() => {
    map.getView().setCenter(props.center);
    map.getView().setZoom(props.zoom);
    map.setTarget("map");
  }, [props.center, props.zoom, map]);

  const handleYears = year => {
    setYear(year);
  };

  const handleCodeNames = codename => {
    const code = codename.split(" - ")[1];

    setCode({code: parseInt(code), name: codename});

    oba
      .post("geom/", {
        table_name: "drainageareas",
        headers: {
          "Content-type": "application/json"
        }
      })
      .then(response => {
        const cxcy = response.data
          .filter(f => f.name === defaultCodeName.name)
          .map(c => c.centroid);
        const extent = response.data
          .filter(f => f.name === defaultCodeName.name)
          .map(c => c.extent);

        setCenter(cxcy[0]);
        setZoom(extent[0]);
      })
      .catch(e => {
        this.errors.push(e);
      });
  };

  const handleReport = () => {
    domtoimage.toPng(document.getElementById('stack-plot'))
    .then(function (dataUrl) {
        var img = new Image();
        img.src = dataUrl;
        setStackImage(img.src);
    })
    .catch(function (error) {
        console.error('oops, something went wrong when generate StackPlot image!', error);
    });

    domtoimage.toPng(document.getElementById('bar-plot'))
    .then(function (dataUrl) {
        var img = new Image();
        img.src = dataUrl;
        setBarImage(img.src);
    })
    .catch(function (error) {
        console.error('oops, something went wrong when generate BarPlot image!', error);
    });

    if (reportIsHidden === false) {
      setReportHidden(true);
    } else {
      setReportHidden(false);
    }
  };

  const onOffLayers = (evt, obj) => {
    const lyr_name = obj.target.name;
    map.getLayers().forEach(lyr => {
      if (lyr.get('name') === lyr_name) {
        lyr.setVisible(!lyr.get('visible'));
      }
    });
  };

  map.on('singleclick', evt => {

    let coords = evt.coordinate;
    let res = view.getResolution();
    let proj = view.getProjection();

    let url = landuse.getSource().getFeatureInfoUrl(
      coords, res, proj,
      {
        INFO_FORMAT: 'text/html',
        VERSION: '1.3.0'
      });
      
    if (url) {
      fetch(url)
        .then(response => { return response.text(); })
        .then(html => {
          const stringifyFunc = createStringXY(5);

          const luclass = document.getElementById('popup-lulc');
          const pcoords = document.getElementById('popup-coords');
          const value = document.getElementById('popup-value');

          const luclasses = {
            '1.0': 'Formações florestais',
            '2.0': 'Formações savânicas',
            '3.0': 'Formações campestres',
            '4.0': 'Mosaico de agricultura ou pastagem',
            '5.0': 'Agricultura de sequeiro',
            '6.0': 'Agricultura irrigada',
            '7.0': 'Pastagem',
            '8.0': `Corpos d'água`,
            '9.0': 'Área urbana/Construções rurais'
          };

          luclass.innerHTML = luclasses[html] ? luclasses[html] : "NaN";
          pcoords.innerHTML = stringifyFunc(coords);
          value.innerHTML = html ? html : "NaN";


          const element = document.getElementById('popup-class');
          element.style.display = "unset";

          const popup = new Overlay({
            position: coords,
            element: element,
            positioning: 'bottom-left',
            autoPan: true,
            autoPanAnimation: {
              duration: 250
            }
          });

          map.addOverlay(popup);

        });
    }
  });

  return (
    <MapContainer id="map">
      <Menu
        key="menu"
        isHidden={menuIsHidden}
        reportIsHidden={reportIsHidden}
        handleReport={handleReport}
        defaultYear={defaultYear}
        handleYears={handleYears}
        handleCodeNames={handleCodeNames}
        defaultCodeName={defaultCodeName.name}
        defaultCategory={defaultCategory}
        onOffLayers={onOffLayers}
        map={map}
      />

      <Popup className="popup-class"/>

      <Scalebar key="scalebar" map={map} />

      <CardPlot plotsAreHidden={plotsAreHidden}
        stackplot={
          <Stackplot
            key="stackplot"
            defaultCodeName={defaultCodeName}
            defaultYear={defaultYear}
          />
        }
        barplot={
          <Barplot
            key={"barplot" + defaultYear}
            defaultCodeName={defaultCodeName}
            defaultYear={defaultYear}
          />
        }
      />

      <Footer key="footer" map={map} />

      <CardReport reportIsHidden={reportIsHidden}
        report={
          <Report 
            key="report" 
            params={{
              defaultYear, 
              defaultCategory,
              defaultCodeName,
              stackImage,
              barImage
            }}
          />
        }
      />

    </MapContainer>
  );
};

export default DrainageMap;
