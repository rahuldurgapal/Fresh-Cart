import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API_BASE from '../config.js';
import './LocationModal.css';

const LocationModal = ({ isOpen, onClose, selectedLocation, setSelectedLocation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingGeo, setIsLoadingGeo] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [isFetchingObj, setIsFetchingObj] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user && isOpen) {
            setIsFetchingObj(true);
            fetch(`${API_BASE}/api/address/get_by_user.php?user_id=${user.id}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
            .then(r => r.json())
            .then(data => {
                if (data && data.records) {
                    setSavedAddresses(data.records);
                }
            })
            .catch(console.error)
            .finally(() => setIsFetchingObj(false));
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSelect = (loc) => {
        const addressText = typeof loc === 'string' ? loc : loc.address;
        if (addressText.trim() !== '') {
            setSelectedLocation(addressText);
            onClose();
        }
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Your browser does not support Geolocation.');
            return;
        }

        if (window.isSecureContext === false && window.location.hostname !== 'localhost') {
            alert('GPS Blocked by Browser: You are currently testing the app on a local IP without HTTPS. Mobile browsers fully block GPS requests on insecure HTTP pages. Try manually searching for your address!');
            return;
        }

        setIsLoadingGeo(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Free reverse geocoding via Nominatim API
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                        headers: { 'Accept-Language': 'en-US,en;q=0.9' }
                    });
                    const data = await res.json();
                    
                    if (data && data.display_name) {
                        let shortAddress = data.display_name;
                        if (data.address) {
                            const { neighbourhood, suburb, city_district, city, town, village, state, postcode } = data.address;
                            const parts = [neighbourhood || suburb || city_district, city || town || village, state, postcode].filter(Boolean);
                            if (parts.length > 0) {
                                shortAddress = parts.join(', ');
                            }
                        }
                        handleSelect(shortAddress);
                    } else {
                        handleSelect('GPS Location Detected');
                    }
                } catch (err) {
                    console.error("Geocoding failed", err);
                    handleSelect('Current GPS Location');
                } finally {
                    setIsLoadingGeo(false);
                }
            },
            (error) => {
                setIsLoadingGeo(false);
                if (error.code === error.PERMISSION_DENIED) {
                    alert('Location access denied. Please allow location permissions in your browser or phone.');
                } else {
                    alert('Unable to retrieve your location. Please type manually.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="location-modal-overlay fade-in">
            <div className="location-modal-backdrop" onClick={onClose}></div>
            <div className="location-modal-content">
                <div className="location-modal-header">
                    <h3>Select your location</h3>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div className="location-modal-body">
                    <div className="search-location-input">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input 
                            type="text" 
                            placeholder="Type location and press enter..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSelect(searchQuery);
                            }}
                            autoFocus
                        />
                    </div>
                    
                    <button 
                        className="current-location-btn" 
                        onClick={handleCurrentLocation} 
                        disabled={isLoadingGeo}
                        style={{ opacity: isLoadingGeo ? 0.7 : 1, cursor: isLoadingGeo ? 'wait' : 'pointer' }}
                    >
                        <i className={`fa-solid ${isLoadingGeo ? 'fa-spinner fa-spin' : 'fa-crosshairs'}`}></i>
                        <div className="loc-btn-text">
                            <h4>{isLoadingGeo ? 'Fetching GPS Data...' : 'Use current location'}</h4>
                            <p>{isLoadingGeo ? 'Please wait a moment' : 'Enable location services for best experience'}</p>
                        </div>
                        <i className="fa-solid fa-chevron-right arrow"></i>
                    </button>

                    <div className="saved-addresses">
                        <h4>Saved Addresses</h4>
                        {user ? (
                            isFetchingObj ? (
                                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-light)' }}>
                                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading addresses...
                                </div>
                            ) : savedAddresses.length > 0 ? (
                                savedAddresses.map(loc => {
                                    const fullAddressStr = `${loc.street_address}, ${loc.city} - ${loc.zip_code}`;
                                    // Use 'house' for Home, 'briefcase' for Work, 'map-pin' for Other
                                    // But db doesn't seem to store type easily here unless it's in a column. Fallback to map-pin.
                                    return (
                                        <div 
                                            key={loc.id} 
                                            className={`saved-loc-item ${selectedLocation === fullAddressStr ? 'active-loc' : ''}`}
                                            onClick={() => handleSelect(fullAddressStr)}
                                        >
                                            <div className="loc-icon-wrapper">
                                                <i className="fa-solid fa-location-dot"></i>
                                            </div>
                                            <div className="loc-details">
                                                <h5>{loc.street_address.substring(0, 20)}{loc.street_address.length > 20 ? '...' : ''}</h5>
                                                <p>{fullAddressStr}</p>
                                            </div>
                                            {selectedLocation === fullAddressStr && (
                                                <i className="fa-solid fa-circle-check text-green"></i>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '10px' }}>You haven't saved any addresses yet.</p>
                                    <Link to="/profile" onClick={onClose} style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Go to Profile</Link>
                                </div>
                            )
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <i className="fa-solid fa-user-lock" style={{ fontSize: '2rem', color: 'var(--text-light)', marginBottom: '12px' }}></i>
                                <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '15px' }}>Login to view your saved addresses and order faster.</p>
                                <Link to="/login" onClick={onClose} style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>Login Now</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
