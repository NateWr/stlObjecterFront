import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Object from "./Object-Old";
import { Button, ButtonBase } from "@mui/material";
import mapImg from "./map.png";
import SmallMap from "./smallMap";
import L from "leaflet";
import marker from "./icon.png";
import { BtnStyle } from "./Shared";
import { Loading } from "react-loading-dot";
import { useNavigate } from "react-router-dom";

//redux imports
import { useSelector, useDispatch } from "react-redux";
import { getApplications, reset, isError, isLoading } from "./Redux/Slice";

const myIcon = new L.Icon({
  iconUrl: marker,
  iconRetinaUrl: marker,
  popupAnchor: [-0, -0],
  iconSize: [30, 40],
});

export default function Map() {
  const [Postcodes, setPostcodes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();

  //redux handling
  const dispatch = useDispatch();
  const state = useSelector((state) => state);

  useEffect(() => {
    dispatch(getApplications());
  }, []);

  
  useEffect(() =>{
    setApplications(state.applications.applications);
  }, [state.applications])

  useEffect(() => {
    setPostcodes(applications.map((app) => app.Postcode));
  }, [applications]);

  const [latlongs, setLatlongs] = useState([]);
  const [index, setIndex] = useState(0);

  const fetchData = async (postcode, index) => {
    if (postcode) {
      const response = await fetch(
        `https://api.postcodes.io/postcodes/${postcode}`
      );
      const data = await response.json();

      setLatlongs([
        ...latlongs,
        {
          index: index,
          postcode: data.result.postcode,
          lat: data.result.latitude,
          long: data.result.longitude,
        },
      ]);
    }
  };

  useEffect(() => {
    if (Postcodes?.length > latlongs.length + 1) {
      fetchData(Postcodes[index], index);
      setIndex(index + 1);
    } else {
      console.log("stopping at: ", index);
    }
  }, [Postcodes, latlongs.length]);

  const [mapClass, setMapClass] = useState("mapBig");

  const toggleMap = () => {
    mapClass == "mapBig" ? setMapClass("mapSmall") : setMapClass("mapBig");
  };

  const [selectedCoords, setSelectedCoords] = useState({
    lat: "55.95005",
    long: "-3.21494",
  });

  const selectLicense = (postcode, coords) => {
    setSelected(applications.filter((app) => app.Postcode == postcode));
    setSelectedCoords(coords);
    setMapClass("mapSmall");
  };

  return (
    <div>
      <div
        className={
          mapClass == "mapBig" ? "mapContainer" : "mapContainerCollapsed"
        }
      >
        {mapClass == "mapBig" && (
          <>
            <center>
              <span
                className="header header3 bebas"
                style={{
                  backgroundColor: "rgba(0, 66, 25, 0.9)",
                  padding: "5px 10px 1px 6px",
                }}
              >
                Select an application to begin your objection
              </span>
            </center>

            <div className="mapInner">
              <div className={mapClass}>
                {mapClass == "mapBig" ? (
                  <center>
                    {state.applications.isLoading ? (
                      <div className="loading">
                        <Loading
                          size={"1rem"}
                          dots={3}
                          background={"rgb(255,255,255)"}
                        />
                        <h1 className="bebas header header3">
                          Loading - this may take a few moments
                        </h1>
                      </div>
                    ) : (
                      <MapContainer
                        center={[55.95005, -3.21494]}
                        zoom={11}
                        style={{
                          width: `100%`,
                          height: `420px`,
                          margin: "0 auto",
                        }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {latlongs.map((latlong, idx) => (
                          <Marker
                            position={[latlong.lat, latlong.long]}
                            icon={myIcon}
                          >
                            <Popup>
                              <div style={{ maxWidth: "100px" }}>
                                {
                                  applications.filter(
                                    (app) => app.Postcode == latlong.postcode
                                  )[0]["Premises address"]
                                }
                                <br />
                                <br />
                                <center>
                                  <Button
                                    onClick={() =>
                                      navigate(`../object/${latlong.postcode}`)
                                    }
                                    variant="contained"
                                    style={BtnStyle}
                                  >
                                    Object
                                  </Button>
                                </center>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    )}
                  </center>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {mapClass == "mapSmall" && (
        <>
          <div style={{ textAlign: "right" }}>
            <Button
              size="small"
              variant="contained"
              sx={{ margin: 1 }}
              onClick={() => setMapClass("mapBig")}
              style={{ ...BtnStyle, fontSize: "1.4em" }}
            >
              Back to applications
            </Button>
          </div>
          <Object selected={selected[0]} coords={selectedCoords} />
        </>
      )}
    </div>
  );
}
