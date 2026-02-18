import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '@/components/shared/pagination';

describe('Pagination', () => {
    const onPageChange = vi.fn();

    it('renders correct page numbers', () => {
        render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('disables prev on first page', () => {
        render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
        const prevButton = screen.getAllByRole('button')[0]; // ChevronLeft
        expect(prevButton).toBeDisabled();
    });

    it('disables next on last page', () => {
        render(<Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />);
        const buttons = screen.getAllByRole('button');
        const nextButton = buttons[buttons.length - 1]; // ChevronRight
        expect(nextButton).toBeDisabled();
    });

    it('calls onPageChange with correct page when a number is clicked', () => {
        render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
        fireEvent.click(screen.getByText('3'));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('calls onPageChange with next page when next is clicked', () => {
        render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
        const buttons = screen.getAllByRole('button');
        const nextButton = buttons[buttons.length - 1];
        fireEvent.click(nextButton);
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('shows dots when many pages exist', () => {
        render(<Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />);
        expect(screen.getAllByText('...')).toHaveLength(2);
    });

    it('renders nothing when totalPages <= 1', () => {
        const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={onPageChange} />);
        expect(container).toBeEmptyDOMElement();
    });
});
