import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> to <b>{Math.min(currentPage * itemsPerPage, totalItems)}</b> of <b>{totalItems}</b> results
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                    onClick={() => onPageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    style={{ padding: '6px 12px', border: '1px solid var(--border-color)', background: currentPage === 1 ? '#f8fafc' : '#fff', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#cbd5e1' : '#334155', display: 'flex', alignItems: 'center' }}
                >
                    <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                        key={page}
                        onClick={() => onPageChange(page)}
                        style={{ padding: '6px 12px', minWidth: '32px', border: page === currentPage ? '1px solid var(--brand-primary)' : '1px solid var(--border-color)', background: page === currentPage ? 'var(--brand-primary)' : '#fff', borderRadius: '6px', cursor: 'pointer', color: page === currentPage ? '#fff' : '#334155', fontWeight: page === currentPage ? 'bold' : 'normal' }}
                    >
                        {page}
                    </button>
                ))}
                <button 
                    onClick={() => onPageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    style={{ padding: '6px 12px', border: '1px solid var(--border-color)', background: currentPage === totalPages ? '#f8fafc' : '#fff', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#cbd5e1' : '#334155', display: 'flex', alignItems: 'center' }}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
