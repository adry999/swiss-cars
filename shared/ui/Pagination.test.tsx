import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination', () => {
    it('should not render when totalPages is 1', () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render page buttons for small page counts', () => {
        render(
            <Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />
        );

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should highlight current page', () => {
        render(
            <Pagination currentPage={2} totalPages={3} onPageChange={vi.fn()} />
        );

        const currentPageButton = screen.getByText('2');
        expect(currentPageButton.className).toContain('active');
    });

    it('should call onPageChange when clicking a page', () => {
        const onPageChange = vi.fn();
        render(
            <Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />
        );

        fireEvent.click(screen.getByText('2'));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should disable Previous button on first page', () => {
        render(
            <Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />
        );

        const prevButton = screen.getByLabelText('Previous page');
        expect(prevButton).toBeDisabled();
    });

    it('should disable Next button on last page', () => {
        render(
            <Pagination currentPage={3} totalPages={3} onPageChange={vi.fn()} />
        );

        const nextButton = screen.getByLabelText('Next page');
        expect(nextButton).toBeDisabled();
    });

    it('should call onPageChange with previous page when clicking Previous', () => {
        const onPageChange = vi.fn();
        render(
            <Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />
        );

        fireEvent.click(screen.getByLabelText('Previous page'));
        expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onPageChange with next page when clicking Next', () => {
        const onPageChange = vi.fn();
        render(
            <Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />
        );

        fireEvent.click(screen.getByLabelText('Next page'));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('should show ellipsis for large page counts', () => {
        render(
            <Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />
        );

        const ellipses = screen.getAllByText('...');
        expect(ellipses.length).toBeGreaterThan(0);
    });

    it('should always show first and last page', () => {
        render(
            <Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />
        );

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
    });
});
