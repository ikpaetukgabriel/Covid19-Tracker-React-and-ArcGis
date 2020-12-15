import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
import './Map.css';

export const WebMapView = () => {
    const mapRef = useRef();

    useEffect(
      () => {
        // lazy load the required ArcGIS API for JavaScript modules and CSS
        loadModules(['esri/Map', 'esri/views/MapView', 'esri/Graphic',
        'esri/layers/GraphicsLayer'], { css: true })
        .then(([ArcGISMap, MapView, Graphic, GraphicsLayer]) => {


          const map = new ArcGISMap({
            basemap: 'topo-vector'
          });

          // load the map view at the ref's DOM node
          const view = new MapView({
            container: mapRef.current,
            map: map,
            center: [-98.7896876, 30.8260227], // starting longitude, latitude
            zoom: 2       
          });

          var graphicsLayer = new GraphicsLayer();
          map.add(graphicsLayer);
          
          var xmlhttp = new XMLHttpRequest();

          // This long function below is what will happen when we get a result
          // The actual sending of the http request and reading response occurs
          // after the definition of this function.
          xmlhttp.onreadystatechange = function() {
              // Did we get a response (4) and was the response successful (200)
              if (this.readyState == 4 && this.status == 200) {
                  
                  // Convert the JSON text to JSON object that we
                  // can loop through
                  var data = JSON.parse(this.responseText);
  
                  // The structure of the earthquake data can be found
                  // at the USGS website:
                  // https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
                  
                  // Loop through each feature in the features list
                  for (data of data) {   
                      
                      var textSymbol = {
                          type: "text",
                          color: "white"
                      }
                      // Define location to draw
                      // This JS map is expected by ArcGIS to make a graphic
                      var point = {
                          type: "point",
                          longitude: data.countryInfo.long,
                          latitude: data.countryInfo.lat,
                          textSymbol: textSymbol
                      };
                      // Determine symbol color based on the earthquake magnitude
                      var mag_color;
                      var mag = data.cases;
                      if (mag > 2000000) {
                          mag_color = [245, 93, 105];
                      }
                      else if (mag > 500000) {
                          mag_color = [225, 100, 24];
                      }
                      else if (mag > 1000000) {
                          mag_color = [250, 4, 23];
                      }
                      else {
                          mag_color = [78, 168, 50];
                      }
  
                      // Create a symbol
                      // This JS map is expected by ArcGIS to make a graphic                 
                      var simpleMarkerSymbol = {
                          type: "simple-marker",
                          color: mag_color, 
                          outline: {
                          color: [255, 255, 255], // white
                          width: 1
                          }
                      };
              
                      // Combine location and symbol to create a graphic object
                      // Also include the earthquake properties data so it
                      // can be used in the popup template.
                      var pointGraphic = new Graphic({
                          geometry: point,
                          symbol: simpleMarkerSymbol,
                          //attributes: feature.properties // this is just a JS Map
                      });
                      //get the flag of each country.
                      //var flag = document.getElementById("imageid").src=data.countryInfo.flag
                      // Add popup.  The items in curly braces within the 
                      // template are the key names from the graphic attributes.
                      pointGraphic.popupTemplate = {
                          "title" : "Covid-19",
                          "content" : `<b>Cases</b>: ${data.cases}<br>Death<b>: ${data.deaths}<br>Recovered<b>: ${data.recovered}<br>Test<b>: ${data.tests}<br>Flag<b>: ${data.countryInfo.flag} <br>Location</b>: ${data.country}<br><b>`
                      }
              
                      // Add the graphic (with its popup) to the graphics layer
                      graphicsLayer.add(pointGraphic);
                  } // End of Loop
              }
          }; // End of XML Call back Function
  
          // Time to actually send the GET request to the USGS.  When we get a response
          // it will call and execute the function we defined above.
          xmlhttp.open("GET", "https://disease.sh/v3/covid-19/countries", true);
          xmlhttp.send();

    

          return () => {
            if (view) {
              // destroy the map view
              view.destroy();
            }
          };
        });
      }
    );

    return <div className="webmap" ref={mapRef} />;
};