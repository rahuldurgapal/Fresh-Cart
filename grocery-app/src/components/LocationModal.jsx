import React, { useState } from 'react';
import './LocationModal.css';

const LocationModal = ({ isOpen, onClose, selectedLocation, setSelectedLocation }) => {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const mockLocations = [
        { id: 1, title: 'Home', address: 'B-45, Phase 1, New Delhi', type: 'home' },
        { id: 2, title: 'Work', address: 'Tower A, Cyber City, Gurgaon', type: 'work' },
        { id: 3, title: 'Other', address: 'Vasant Kunj Ext., New Delhi', type: 'map-pin' }
    ];

    const handleSelect = (loc) => {
        setSelectedLocation(loc.address);
        onClose();
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
                            placeholder="Search for your area or apartment..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    <button className="current-location-btn" onClick={() => handleSelect({address: 'Current GPS Location, India'})}>
                        <i className="fa-solid fa-crosshairs"></i>
                        <div className="loc-btn-text">
                            <h4>Use current location</h4>
                            <p>Enable location services for best experience</p>
                        </div>
                        <i className="fa-solid fa-chevron-right arrow"></i>
                    </button>

                    <div className="saved-addresses">
                        <h4>Saved Addresses</h4>
                        {mockLocations.map(loc => (
                            <div 
                                key={loc.id} 
                                className={`saved-loc-item ${selectedLocation === loc.address ? 'active-loc' : ''}`}
                                onClick={() => handleSelect(loc)}
                            >
                                <div className="loc-icon-wrapper">
                                    <i className={`fa-solid fa-${loc.type === 'home' ? 'house' : loc.type === 'work' ? 'briefcase' : 'map-pin'}`}></i>
                                </div>
                                <div className="loc-details">
                                    <h5>{loc.title}</h5>
                                    <p>{loc.address}</p>
                                </div>
                                {selectedLocation === loc.address && (
                                    <i className="fa-solid fa-circle-check text-green"></i>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
