import React from 'react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0', gap: '10px' }}>
            <button 
                onClick={() => {
                    onPageChange(currentPage - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', border: '1px solid #ddd', background: currentPage === 1 ? '#f1f1f1' : '#fff', borderRadius: '20px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#aaa' : '#333', fontWeight: 600, fontSize: '0.9rem' }}
            >
                <i className="fa-solid fa-chevron-left" style={{marginRight: '6px'}}></i> Prev
            </button>
            
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#555', padding: '0 10px' }}>
                Page {currentPage} of {totalPages}
            </div>

            <button 
                onClick={() => {
                    onPageChange(currentPage + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', border: currentPage === totalPages ? '1px solid #ddd' : '1px solid var(--primary)', background: currentPage === totalPages ? '#f1f1f1' : '#f4fbf6', borderRadius: '20px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#aaa' : 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}
            >
                Next <i className="fa-solid fa-chevron-right" style={{marginLeft: '6px'}}></i>
            </button>
        </div>
    );
};

export default Pagination;
