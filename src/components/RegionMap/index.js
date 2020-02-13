import React, { useState, useEffect } from "react";
import OlMap from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import TileWMS from 'ol/source/TileWMS';
import OSM from "ol/source/OSM";

import 'ol/ol.css';

import { MapContainer } from './styles';
import Menu from '../../components/Menu';
import Scalebar from '../../components/Scalebar';
import Footer from '../../components/Footer';

import Stackplot from '../../components/Stackplot';
import Barplot from '../../components/Barplot';

const RegionMap = (props) => {
  const [defaultYear, setYear] = useState(props.defaultYear);
  const [defaultCategory] = useState(props.defaultCategory);
  const [menuIsHidden] = useState(false);
  const [center] = useState([-45.25811, -12.652125]);
  const [zoom] = useState(8);

  useEffect(() => {
    map.getView().setCenter(center);
    map.getView().setZoom(zoom);
    map.setTarget("map");
  });

  const landsat = new TileLayer({
    visible: false,
    source: new TileWMS({
      url: 'http://corrente.dea.ufv.br/cgi-bin/mapserv?map=/var/www/obahia-webmap/mapfiles/landsatRegion.map',
      params: {
        'year': defaultYear,
        'LAYERS': 'Landsat',
      },
      serverType: 'mapserver'
    })
  });

  const landuse = new TileLayer({
    visible: true,
    source: new TileWMS({
      url: 'http://corrente.dea.ufv.br/cgi-bin/mapserv?map=/var/www/obahia-webmap/mapfiles/landuseRegion.map',
      params: {
        'year': defaultYear,
        'LAYERS': 'Landuse',
      },
      serverType: 'mapserver'
    })
  });

  const view = new View({
    projection: 'EPSG:4326',
    center: center,
    zoom: zoom
  });

  const osm = new TileLayer({ source: new OSM() });

  const map = new OlMap({
    controls: [],
    target: null,
    layers: [osm, landsat, landuse],
    view: view
  });

  const onOffLandsat = (evt) => {
    landsat.setVisible(evt);
  }

  const onOffLanduse = (evt) => {
    landuse.setVisible(evt);
  }

  const handleYears = year => {
    setYear(year);

    const new_landsat = new TileWMS({
      url: 'http://corrente.dea.ufv.br/cgi-bin/mapserv?map=/var/www/obahia-webmap/mapfiles/landsatRegion.map',
      params: {
        'year': year,
        'LAYERS': 'Landsat',
      },
      serverType: 'mapserver'
    })

    const new_landuse = new TileWMS({
      url: 'http://corrente.dea.ufv.br/cgi-bin/mapserv?map=/var/www/obahia-webmap/mapfiles/landuseRegion.map',
      params: {
        'year': year,
        'LAYERS': 'Landuse',
      },
      serverType: 'mapserver'
    })

    landuse.setSource(new_landuse);
    landuse.getSource().updateParams({ "time": Date.now() });
    landuse.changed();

    landsat.setSource(new_landsat);
    landsat.getSource().updateParams({ "time": Date.now() });
    landsat.changed();
  }

  return (
        <MapContainer id="map">
          <Menu 
            key="menu" 
            isHidden={menuIsHidden}
            defaultYear={defaultYear} 
            handleYears={handleYears} 
            defaultCategory={defaultCategory} 
            onOffLandsat={onOffLandsat} 
            onOffLanduse={onOffLanduse}
            map={map}
          />

          <Scalebar 
            key="scalebar"
            map={map}
          />

          <div id="plots" className="plot-card">
            <Stackplot 
              key="stackplot"
            />
            
            <Barplot 
              key={"barplot"+ defaultYear}
              defaultYear={defaultYear}
            />

          </div>

          <Footer 
            key="footer"
            map={map}
            projection='EPSG:4326'
          />
        </MapContainer>
    );
}

export default RegionMap;