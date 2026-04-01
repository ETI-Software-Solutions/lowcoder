import {
  antd,
  UICompBuilder,
  NameConfig,
  Section,
  withDefault,
  withExposingConfigs,
  withMethodExposing,
  toJSONObjectArray,
  StringControl,
  NumberControl,
  ArrayControl,
  jsonControl,
  dropdownControl,
  AutoHeightControl,
  BoolControl,
  eventHandlerControl,
  ToConstructor,
} from "lowcoder-sdk";
import Map, { FullscreenControl, GeolocateControl, Layer, NavigationControl, Popup, ScaleControl, Source, MapRef } from 'react-map-gl/maplibre';
import maplibregl from "maplibre-gl";
import { useResizeDetector } from "react-resize-detector";
import { trans } from "i18n";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import styled, { createGlobalStyle } from "styled-components";

const isUrl = (url: unknown): url is string => {
  if (typeof url !== "string") return false;
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

const transformBoundariesToMaxBounds = (value: string): maplibregl.LngLatBoundsLike => {
  switch (value) {
    case "Europe": return [[-25, 35], [40, 72]];
    case "Canada": return [[-141.0, 41.7], [-52.6, 83.1]];
    case "South America": return [[-81.0, -56.0], [-35.0, 12.0]];
    case "Africa": return [[-17.5, -34.8], [51.4, 37.3]];
    case "Asia": return [[26.0, 1.4], [169.5, 77.5]];
    case "World": return [[-169, -80], [190, 80]];
    default: return [[-125.0, 24.396308], [-66.93457, 49.384358]];
  }
};

const parseIfArray = (value: any) => {
  return typeof value === 'string' && value.startsWith('[') && value.endsWith(']');
};

const renderHyperlink = (url: string) => {
  if (isUrl(url)) {
    return <a href={url} target="_blank" rel="noopener noreferrer">External link</a>;
  }
  return url;
};

const EventOptions = [
  { label: trans("event.click"), value: "click", description: trans("event.clickDesc") },
] as const;
const MapEventControl = eventHandlerControl(EventOptions);

const PopupStyles = createGlobalStyle`
  .maplibregl-popup-content {
    padding: 0;
    border-radius: 14px;
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.10),
      0 1px 4px rgba(0, 0, 0, 0.06);
    border: 0.5px solid rgba(0, 0, 0, 0.08);
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    overflow: hidden;
    max-width: 340px;
    min-width: 260px;
    max-height: calc(100vh - 80px);
    background: #ffffff;
    margin-right: 8px;
    margin-bottom: 8px;
  }

  .maplibregl-popup-content .popup-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 20px 14px;
    border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
  }

  .maplibregl-popup-close-button {
    position: absolute;
    top: 12px;
    right: 18px;
    width: 21px;
    height: 21px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px 10px 10x 10px;
    border: 1px solid transparent !important;
    background: rgba(255, 255, 255, 0.95) !important;
    color: #9ca3af !important;
    font-size: 14px !important;
    line-height: 1;
    cursor: pointer !important;
    transition:
      background 0.15s ease,
      color 0.15s ease,
      border-color 0.15s ease !important;
    z-index: 10;
  }

  .maplibregl-popup-close-button:hover,
  .maplibregl-popup-close-button:focus {
    background: #fee2e2 !important;
    color: #dc2626 !important;
    border-color: #fca5a5 !important;
    outline: none !important;
  }

  .maplibregl-popup-tip {
    filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.08));
  }

  .maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
    border-top-color: #ffffff;
  }

  .maplibregl-popup-anchor-top .maplibregl-popup-tip {
    border-bottom-color: #ffffff;
  }

  .maplibregl-popup-anchor-left .maplibregl-popup-tip {
    border-right-color: #ffffff;
  }

  .maplibregl-popup-anchor-right .maplibregl-popup-tip {
    border-left-color: #ffffff;
  }
`;

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #dddddd;
  background-color: white;
`;

export const TableContainer = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
  padding: 6px 0;
  background: #ffffff;
  min-height: 0;
  border-radius: 0 0 14px 14px;

  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 99px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
`;

export const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;
  margin: 0;
  border: none;
  background: transparent;

  tr {
    border-bottom: 0.5px solid rgba(0, 0, 0, 0.05);
    transition: background 0.12s ease;
  }
  tr:hover {
    background: #f8faff;
  }
  tr:last-child {
    border-bottom: none;
  }

  td {
    padding: 9px 16px;
    vertical-align: middle;
    font-size: 12.5px;
    border: none;
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  td:nth-child(1) {
    width: 110px;
    color: #9ca3af;
    font-weight: bold;
    text-transform: capitalize;
    white-space: nowrap;
  }
  td:nth-child(2) {
    color: #0f1117;
    font-weight: 400;
    word-break: break-word;
  }

  td > a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11.5px;
    font-weight: 500;
    padding: 3px 9px;
    border-radius: 6px;
    background: #eff6ff;
    color: #1d4ed8;
    border: 0.5px solid #bfdbfe;
    text-decoration: none;
    transition: background 0.15s ease;
  }
  td > a:hover {
    background: #dbeafe;
    color: #1e40af;
  }
`;

export const TableDropdownContainer = styled.div`
  margin: 0 12px 12px;
  padding: 12px 14px;
  border: 0.5px solid rgba(0, 0, 0, 0.07);
  border-radius: 10px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TableDropdownLabel = styled.label`
  font-size: 10.5px;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
`;

const defaultValues = {
    mapStyleLabel: "Positron",
    mapStyle: "https://tiles.openfreemap.org/styles/positron",
}

const _mapStyleSetter = { current: null as ((v: string) => void) | null };
const _currentMapStyle = { current: defaultValues.mapStyleLabel };

let MapLibreTmpComp = (function () {

    const MAP_STYLES = [
        { label: "Bright", value: "Bright" },
        { label: "Liberty", value: "Liberty" },
        { label: "Positron", value: "Positron" },
    ].sort((a, b) => a.label.localeCompare(b.label));

    const MAP_STYLE_URLS: Record<string, string> = {
        Bright: "https://tiles.openfreemap.org/styles/bright",
        Liberty: "https://tiles.openfreemap.org/styles/liberty",
        Positron: "https://tiles.openfreemap.org/styles/positron",
    };

    const BOUNDARIES_OPTIONS = [
        { label: "USA", value: "USA" },
        { label: "Europe", value: "Europe" },
        { label: "South America", value: "South America" },
        { label: "Canada", value: "Canada" },
        { label: "Africa", value: "Africa" },
        { label: "Asia", value: "Asia" },
        { label: "World", value: "World" }
    ].sort((a, b) => a.label.localeCompare(b.label));

    const DataControl = jsonControl(toJSONObjectArray, []);
    const MapStyleControl = withDefault(StringControl, defaultValues.mapStyleLabel) as typeof StringControl;
    const BoundariesControl = dropdownControl(BOUNDARIES_OPTIONS, "USA");

    type MaplibreChildrenMap = {
      autoHeight: InstanceType<typeof AutoHeightControl>;
      data: InstanceType<typeof DataControl>;
      mapStyle: InstanceType<typeof StringControl>;
      boundaries: InstanceType<typeof BoundariesControl>;
      center: InstanceType<typeof ArrayControl>;
      zoom: InstanceType<typeof NumberControl>;
      bearing: InstanceType<typeof NumberControl>;
      pitch: InstanceType<typeof NumberControl>;
      hidePopup: InstanceType<typeof BoolControl>;
      popupDataState: InstanceType<ReturnType<typeof jsonControl>>;
      onEvent: InstanceType<typeof MapEventControl>;
    };

  const childrenMap: ToConstructor<MaplibreChildrenMap> = {
    autoHeight: withDefault(AutoHeightControl, "auto"),
    data: DataControl,
    mapStyle: new Proxy(MapStyleControl, {
      get(target, prop) {
        if (prop === "getView") return () => _currentMapStyle.current;
        const val = (target as any)[prop];
        return typeof val === "function" ? val.bind(target) : val;
      }
    }) as unknown as typeof StringControl,
    boundaries: BoundariesControl,
    center: withDefault(ArrayControl, JSON.stringify([0, 0])),
    zoom: withDefault(NumberControl, 0),
    bearing: withDefault(NumberControl, 0),
    pitch: withDefault(NumberControl, 0),
    hidePopup: withDefault(BoolControl, false),
    popupDataState: jsonControl(() => ({}), {}),
    onEvent: MapEventControl,
  };
  
  return new UICompBuilder(childrenMap, (props) => {
    const { ref: conRef, height: containerHeight } = useResizeDetector({
      onResize: () => mapRef.current?.resize(),
      refreshMode: "debounce"
    });
    const mapRef = useRef<MapRef>(null);

    interface IPopupCoords {
      longitude: number;
      latitude: number;
    }

    const [popupData, setPopupData] = useState<{ [name: string]: any }>({});
    const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
    const [popupCoords, setPopupCoords] = useState<IPopupCoords>({ longitude: 0, latitude: 0 });
    const [dropdownValues, setDropdownValues] = useState<{ [key: string]: string }>({});

    const [activeMapStyle, setActiveMapStyle_inner] = useState<string>(defaultValues.mapStyle);
    const setActiveMapStyle = (label: string) => {
      _currentMapStyle.current = label;
      setActiveMapStyle_inner(MAP_STYLE_URLS[label] ?? defaultValues.mapStyle);
    };

    _mapStyleSetter.current = setActiveMapStyle;

    useEffect(() => {
      const raw = props.mapStyle;
      if (typeof raw === "string" && MAP_STYLE_URLS[raw]) {
        setActiveMapStyle(raw);
      }
    }, [props.mapStyle]);

    useEffect(() => {
      if (!isPopupVisible) return;
      const initialDropdowns: { [key: string]: string } = {};
      Object.entries(popupData).forEach(([title, value]) => {
        if (parseIfArray(value)) {
          try {
            const assets = JSON.parse(value as string);
            if (assets && assets.length > 0) {
              const firstKey = Object.keys(assets[0])[0];
              initialDropdowns[title] = assets[0][firstKey];
            }
          } catch (e) {
            console.error("Failed to parse asset array", e);
          }
        }
      });
      setDropdownValues(prev => ({ ...prev, ...initialDropdowns }));
    }, [popupData, isPopupVisible]);

    const setPopupToTopRight = useCallback(() => {
      if (!mapRef.current) return;
      const bounds = mapRef.current.getBounds();
      const ne = bounds.getNorthEast();
      setPopupCoords({ longitude: ne.lng, latitude: ne.lat });
    }, []);

    const handleClusterClick = useCallback((event: maplibregl.MapLayerMouseEvent) => {
      const map = mapRef.current;
      if (!map) return;

      const clusterFeatures     = map.queryRenderedFeatures(event.point, { layers: ["clusters"] });
      const unclusteredFeatures = map.queryRenderedFeatures(event.point, { layers: ["unclustered-point"] });

      if (clusterFeatures.length > 0) {
        const geometry = clusterFeatures[0].geometry;
        if (geometry.type === "Point") {
          map.easeTo({
            center:   geometry.coordinates as [number, number],
            zoom:     map.getZoom() + 2,
            duration: 1000,
            easing:   (t: number) => t * (2 - t),
          });
        }
      }

      if (unclusteredFeatures.length > 0) {
        const feature    = unclusteredFeatures[0];
        const geometry   = feature.geometry;
        const properties = feature.properties || {};

        setPopupData(properties);
        setIsPopupVisible(true);
        setPopupToTopRight();

        props.onEvent("click");
        (props as any).popupDataState_dispatch?.(properties);
      }
    }, [setPopupToTopRight, props]);

    useEffect(() => {
      (props as any).onPopupDataChange?.(popupData);
    }, [popupData]);

    useEffect(() => {
      if (isPopupVisible) {
        setPopupToTopRight();
      }
    }, [isPopupVisible, setPopupToTopRight]);

    useEffect(() => {
      if (!props.boundaries || !mapRef.current) return;
      const bounds = transformBoundariesToMaxBounds(props.boundaries);
      mapRef.current.fitBounds(bounds);
      if (props.boundaries === "Canada") {
        mapRef.current.setCenter([-97, 56]);
      } else if (props.boundaries === "Europe") {
        mapRef.current.setCenter([10, 49]);
      }
    }, [props.boundaries]);

    useEffect(() => { mapRef.current?.setZoom(props.zoom); }, [props.zoom]);
    useEffect(() => { mapRef.current?.setBearing(props.bearing); }, [props.bearing]);
    useEffect(() => { mapRef.current?.setPitch(props.pitch); }, [props.pitch]);

    const centerValue = useMemo(() => {
      let raw: any = props.center;
      if (typeof raw === "string") {
        try {
          raw = JSON.parse(raw);
        } catch (e) {
          if (typeof raw === "string" && raw.includes(",")) {
            raw = raw.split(",").map(Number);
          } else {
            return null;
          }
        }
      }
      if (Array.isArray(raw) && raw.length === 1 && Array.isArray(raw[0])) {
        raw = raw[0];
      }
      if (Array.isArray(raw) && raw.length >= 2) {
        const lng = Number(raw[0]);
        const lat = Number(raw[1]);
        if (!isNaN(lng) && !isNaN(lat) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return [lng, lat] as [number, number];
        }
      }
      return null;
    }, [props.center]);

    useEffect(() => {
      if (!mapRef.current || !centerValue) return;
      const coords = new maplibregl.LngLat(centerValue[0], centerValue[1]);
      const bounds = mapRef.current.getMaxBounds();
      if (!bounds || bounds.contains(coords)) {
        mapRef.current.easeTo({
          center: coords,
          zoom: Math.max(mapRef.current.getZoom(), 8),
          duration: 1000,
          easing: (t: number) => t * (2 - t),
        });
      }
    }, [centerValue]);

    const handleOnChange = (value: string, title: string) => {
      setDropdownValues(prevState => ({ ...prevState, [title]: value }));
    };

    const renderTable = (data: { [name: string]: any }) => (
      <StyledTable>
        <tbody>
          {Object.entries(data).map(([key, value], i) => {
            if (parseIfArray(value) || key.toLowerCase() === 'id' || key.toLowerCase() === 'point_count') return null;
            return (
              <tr key={i}>
                <td>{key.replace(/_/g, ' ')}</td>
                <td>{value !== null && value !== undefined ? String(value) : '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </StyledTable>
    );

    const renderAssetTable = (data: { [name: string]: any }) => {
      return Object.entries(data).map(([title, value], i: number) => {
        if (!parseIfArray(value)) return null;
        try {
          const assets = JSON.parse(value as string);
          const currentSelection = dropdownValues[title] || (assets[0] && assets[0][Object.keys(assets[0])[0]]);
          return (
            <div key={`assetTable-${i}`}>
              <TableDropdownContainer>
                <TableDropdownLabel htmlFor={title}>{title}:</TableDropdownLabel>
                <antd.Select
                  value={currentSelection}
                  onChange={(val: string) => handleOnChange(val, title)}
                  style={{ width: "100%", margin: 0 }}
                  options={assets.map((asset: any) => {
                    const key = Object.keys(asset)[0];
                    return { value: asset[key], label: <span>{asset[key]}</span> };
                  })}
                />
              </TableDropdownContainer>
              <StyledTable>
                <tbody>
                  {assets
                    .filter((asset: any) => asset[Object.keys(asset)[0]] === currentSelection)
                    .map((asset: any) => Object.entries(asset).map(([k, v], idx) => (
                      <tr key={`${idx}`}>
                        <td>{k}</td>
                        <td>{renderHyperlink(v as string)}</td>
                      </tr>
                    )))}
                </tbody>
              </StyledTable>
            </div>
          );
        } catch (e) {
          return null;
        }
      });
    };

    const wrapperStyle = {
      width: "100%",
      height: props.autoHeight ? "auto" : "100%",
      minHeight: props.autoHeight ? 440 : undefined,
    };
    const mapStyleOverride = {
      width: "100%",
      height: props.autoHeight ? 440 : "100%",
    };

    const showPopup = isPopupVisible && !props.hidePopup;

    return (
      <Wrapper ref={conRef} style={wrapperStyle}>
        <PopupStyles />
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: centerValue ? centerValue[0] : 0,
            latitude: centerValue ? centerValue[1] : 0,
            zoom: props.zoom,
            bearing: props.bearing,
            pitch: props.pitch,
          }}
          interactiveLayerIds={["clusters", "unclustered-point"]}
          onClick={handleClusterClick}
          onMove={() => {
            if (isPopupVisible) {
              setPopupToTopRight();
            }
          }}
          minZoom={0}
          maxBounds={transformBoundariesToMaxBounds(props.boundaries)}
          style={mapStyleOverride}
          mapLib={maplibregl}
          mapStyle={activeMapStyle}
        >
          <Source
            id="features"
            type="geojson"
            data={Array.isArray(props.data) ? props.data[0] : (props.data as any)}
            cluster={true}
            clusterRadius={50}
          >
            <Layer
              id="clusters"
              type="circle"
              source="features"
              filter={['has', 'point_count']}
              paint={{
                'circle-color': ['step', ['get', 'point_count'], '#1494d1', 100, '#f1f075', 750, '#f28cb1'],
                'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
                'circle-opacity': 0.8,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff',
              }}
            />
            <Layer
              id="cluster-count"
              type="symbol"
              source="features"
              filter={["has", "point_count"]}
              layout={{
                "text-field": "{point_count_abbreviated}",
                "text-size": 13,
                "text-font": ["Noto Sans Bold"],
              }}
              paint={{ "text-color": "#ffffff" }}
            />
            <Layer
              id="unclustered-point"
              type="circle"
              source="features"
              filter={['!', ['has', 'point_count']]}
              paint={{
                "circle-color": "#1494d1",
                "circle-radius": 10,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff"
              }}
            />
          </Source>

          {showPopup && (
            <Popup
              longitude={popupCoords.longitude}
              latitude={popupCoords.latitude}
              anchor="top-right"
              closeOnMove={false}
              closeOnClick={false}
              onClose={() => setIsPopupVisible(false)}
              maxWidth="400px"
            >
              <TableContainer style={{ maxHeight: containerHeight ? `${Math.max(containerHeight - 80, 150)}px` : "400px" }}>
                {renderTable(popupData)}
                {renderAssetTable(popupData)}
              </TableContainer>
            </Popup>
          )}

          <GeolocateControl position="top-left" />
          <FullscreenControl position="top-left" />
          <NavigationControl position="top-left" />
          <ScaleControl position="bottom-left" />
        </Map>
      </Wrapper>
    );
})
.setPropertyViewFn((children: any) => {
    return (
      <>
        <Section name="Basic">
          {children.data.propertyView({ label: "GeoJSON", tooltip: "" })}

          {(() => {
            const [, forceUpdate] = useState(0);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                <label style={{ fontSize: 13, color: "var(--text-primary, #333)" }}>Map Style</label>
                <antd.Select
                  style={{ width: "100%" }}
                  value={_currentMapStyle.current}
                  options={MAP_STYLES}
                  onChange={(val: string) => {
                    _mapStyleSetter.current?.(val);
                    children.mapStyle.dispatchChangeValueAction(val);
                    forceUpdate(n => n + 1);
                  }}
                />
              </div>
            );
          })()}

          {children.boundaries.propertyView({ label: "Boundaries", tooltip: trans("maplibre.tooltips.boundaries") })}
          {children.center.propertyView({ label: "Center", tooltip: trans("maplibre.tooltips.center") })}
          {children.zoom.propertyView({ label: "Zoom", tooltip: trans("maplibre.tooltips.zoom") })}
          {children.bearing.propertyView({ label: "Bearing", tooltip: trans("maplibre.tooltips.bearing") })}
          {children.pitch.propertyView({ label: "Pitch", tooltip: trans("maplibre.tooltips.pitch") })}
          {children.hidePopup.propertyView( { label: "Hide Popup",  tooltip: trans("maplibre.tooltips.hidePopup") })}
        </Section>
        <Section name="Interaction">
          {children.onEvent.getPropertyView()}
        </Section>
        <Section name="Styles">
          {children.autoHeight.getPropertyView()}
        </Section>
      </>
    );
  })
  .build();
})();

MapLibreTmpComp = class extends MapLibreTmpComp {
  autoHeight(): boolean {
    return this.children.autoHeight.getView();
  }
};

MapLibreTmpComp = withMethodExposing(MapLibreTmpComp, [
  {
    method: {
      name: "setBoundaries",
      description: trans("maplibre.methods.setBoundaries"),
      params: [{ name: "boundaries", type: "string", description: "String" }],
    },
    execute: (comp: any, values: any[]) => {
      comp.children.boundaries.dispatchChangeValueAction(values[0]);
    }
  },
  {
    method: {
      name: "setCenter",
      description: trans("maplibre.methods.setCenter"),
      params: [{ name: "center", type: "JSON", description: "JSON Value" }],
    },
    execute: (comp: any, values: any[]) => {
      comp.children.center.dispatchChangeValueAction(JSON.stringify(values));
      comp.children.zoom.dispatchChangeValueAction(8);
    }
  },
  {
    method: {
      name: "setBearing",
      description: trans("maplibre.methods.setBearing"),
      params: [{ name: "bearing", type: "number", description: "Number" }],
    },
    execute: (comp: any, values: any[]) => {
      comp.children.bearing.dispatchChangeValueAction(values[0]);
    }
  },
  {
    method: {
      name: "setPitch",
      description: trans("maplibre.methods.setPitch"),
      params: [{ name: "pitch", type: "number", description: "Number" }],
    },
    execute: (comp: any, values: any[]) => {
      comp.children.pitch.dispatchChangeValueAction(values[0]);
    }
  },
  {
    method: {
      name: "setGeoJSON",
      description: trans("maplibre.methods.setGeoJSON"),
      params: [{ name: "data", type: "JSON", description: "JSON value" }],
    },
    execute: (comp: any, values: any[]) => {
      comp.children.data.dispatchChangeValueAction(values[0]);
    }
  },
  {
    method: {
      name: "setMapStyle",
      description: trans("maplibre.methods.setMapStyle"),
      params: [{ name: "mapStyle", type: "string", description: "Map style URL string" }],
    },
    execute: (comp: any, values: any[]) => {
      _mapStyleSetter.current?.(values[0]);
      comp.children.mapStyle.dispatchChangeValueAction(values[0]);
    }
  },
  {
    method: {
      name: "hidePopup",
      description: trans("maplibre.methods.hidePopup"),
      params: [],
    },
    execute: (comp: any) => comp.children.hidePopup.dispatchChangeValueAction(true),
  },
  {
    method: {
      name: "showPopup",
      description: trans("maplibre.methods.showPopup"),
      params: [],
    },
    execute: (comp: any) => comp.children.hidePopup.dispatchChangeValueAction(false),
  },
]);

export const MaplibreComp = withExposingConfigs(MapLibreTmpComp, [
  new NameConfig("data", trans("maplibre.properties.data")),
  new NameConfig("mapStyle", trans("maplibre.properties.mapStyle")),
  new NameConfig("boundaries", trans("maplibre.properties.boundaries")),
  new NameConfig("center", trans("maplibre.properties.center")),
  new NameConfig("zoom", trans("maplibre.properties.zoom")),
  new NameConfig("bearing", trans("maplibre.properties.bearing")),
  new NameConfig("pitch", trans("maplibre.properties.pitch")),
  new NameConfig("hidePopup",     trans("maplibre.properties.hidePopup")),
  new NameConfig("popupDataState",trans("maplibre.properties.popupDataState")),
]);

export default MaplibreComp;