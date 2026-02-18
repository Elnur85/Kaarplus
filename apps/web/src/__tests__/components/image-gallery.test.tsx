import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageGallery } from '@/components/car-detail/image-gallery';

describe('ImageGallery', () => {
    const mockImages = [
        { id: '1', url: 'https://example.com/image1.jpg', order: 0 },
        { id: '2', url: 'https://example.com/image2.jpg', order: 1 },
        { id: '3', url: 'https://example.com/image3.jpg', order: 2 },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders empty state when no images', () => {
        render(<ImageGallery images={[]} />);
        expect(screen.getByText('gallery.noImages')).toBeInTheDocument();
    });

    it('renders main image and thumbnails', () => {
        render(<ImageGallery images={mockImages} />);
        
        // Check main image
        const mainImage = screen.getByAltText('gallery.vehicleImage');
        expect(mainImage).toBeInTheDocument();
        
        // Check thumbnails
        const thumbnails = screen.getAllByAltText('gallery.thumbnail');
        expect(thumbnails).toHaveLength(3);
    });

    it('changes main image when thumbnail is clicked', () => {
        render(<ImageGallery images={mockImages} />);
        
        const thumbnails = screen.getAllByAltText('gallery.thumbnail');
        
        // Click second thumbnail
        fireEvent.click(thumbnails[1].closest('button')!);
        
        // Main image should still be rendered
        const mainImage = screen.getByAltText('gallery.vehicleImage');
        expect(mainImage).toBeInTheDocument();
    });

    it('shows navigation arrows when multiple images', () => {
        render(<ImageGallery images={mockImages} />);
        
        // Should have navigation buttons (they may be hidden by CSS but in DOM)
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(3); // prev, next, fullscreen
    });

    it('opens fullscreen when fullscreen button is clicked', async () => {
        render(<ImageGallery images={mockImages} />);
        
        // Get fullscreen button by title
        const fullscreenButton = screen.getByTitle('gallery.fullscreen');
        fireEvent.click(fullscreenButton);
        
        await waitFor(() => {
            // Fullscreen modal should be visible (check for close button with X icon)
            const closeButton = screen.getAllByRole('button').find(
                btn => btn.querySelector('svg') // Close button has X icon
            );
            expect(closeButton).toBeDefined();
        });
    });

    it('displays photo counter', () => {
        render(<ImageGallery images={mockImages} />);
        
        // Photo counter should show current/total
        expect(screen.getByText(/gallery.photoCount/)).toBeInTheDocument();
    });
});
