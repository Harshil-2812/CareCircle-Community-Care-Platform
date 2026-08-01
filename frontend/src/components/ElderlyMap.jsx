import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix leaflet default marker icon in vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// City coordinate mapping from seeded pincodes
const CITY_COORDS = {
  'Chennai':   [13.0827, 80.2707],
  'Bangalore': [12.9716, 77.5946],
  'Mumbai':    [19.0760, 72.8777],
  'New Delhi': [28.6139, 77.2090],
  'Hyderabad': [17.3850, 78.4867],
}

const makeIcon = (color, isHome) => L.divIcon({
  html: `<div style="
    width:36px; height:36px; border-radius:50%;
    background:${color}; border:3px solid white;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 14px rgba(0,0,0,0.5);
    font-size:16px;
  ">${isHome ? '🏠' : '🏥'}</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
})

export default function ElderlyMap({ elderly }) {
  // determine center from first elderly with known city
  let center = [20.5937, 78.9629] // India default
  const firstWithCity = elderly.find(e => {
    const city = e.elderly?.Locations?.Postal_Codes?.city
    return city && CITY_COORDS[city]
  })
  if (firstWithCity) {
    const city = firstWithCity.elderly?.Locations?.Postal_Codes?.city
    center = CITY_COORDS[city]
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: 420 }}>
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%', background: '#0d1225' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {elderly.map(e => {
          const city    = e.elderly?.Locations?.Postal_Codes?.city
          const coords  = CITY_COORDS[city]
          if (!coords) return null
          const isHome  = e.elderly?.living_type === 'Home'
          // Small random jitter so overlapping markers separate
          const jitter  = [coords[0] + (Math.random() - 0.5) * 0.05, coords[1] + (Math.random() - 0.5) * 0.05]
          return (
            <Marker key={e.map_id} position={jitter} icon={makeIcon(isHome ? '#6089ff' : '#f43f5e', isHome)}>
              <Popup>
                <div style={{ minWidth: 150, fontFamily: 'Inter, sans-serif' }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{e.elderly?.name}</p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>{e.relation_type} · Age {e.elderly?.age}</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>
                    📍 {e.elderly?.Locations?.address_line}, {city}
                  </p>
                  <p style={{ fontSize: 12 }}>
                    🏠 {e.elderly?.living_type === 'Care_Home' ? 'Care Home' : 'Home'}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
