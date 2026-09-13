import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { LeadInquiryAction } from './use-lead-inquiry-submission';
import CarInquiryForm from './CarInquiryForm';

const carId = '5d0f7a8e-3c1b-4b8e-9a51-2f7c1d9e4b20';
const carTitle = 'BMW X5 2020';

function renderForm(submitLeadInquiry: LeadInquiryAction) {
    return render(
        <CarInquiryForm carId={carId} carTitle={carTitle} carPrice={45000} submitLeadInquiry={submitLeadInquiry} />,
    );
}

// fireEvent.submit dispatches the 'submit' event directly, so a blank `required`
// input doesn't let jsdom's native constraint validation swallow the submit
// before our own required-fields check runs.
async function submitFormWith(customerName: string, customerPhone: string) {
    const user = userEvent.setup();
    if (customerName) await user.type(screen.getByPlaceholderText('form_name_placeholder'), customerName);
    if (customerPhone) await user.type(screen.getByPlaceholderText('form_phone_placeholder'), customerPhone);
    fireEvent.submit(screen.getByRole('button', { name: /form_submit/ }).closest('form')!);
}

describe('CarInquiryForm', () => {
    it('shows required_fields and never submits when name is blank', async () => {
        const submitLeadInquiry = vi.fn<LeadInquiryAction>();
        renderForm(submitLeadInquiry);

        await submitFormWith('', '069123456');

        expect(await screen.findByText('required_fields')).toBeInTheDocument();
        expect(submitLeadInquiry).not.toHaveBeenCalled();
    });

    it('shows required_fields and never submits when phone is blank', async () => {
        const submitLeadInquiry = vi.fn<LeadInquiryAction>();
        renderForm(submitLeadInquiry);

        await submitFormWith('Ion Popescu', '');

        expect(await screen.findByText('required_fields')).toBeInTheDocument();
        expect(submitLeadInquiry).not.toHaveBeenCalled();
    });

    it('sends an inquiry draft for the current car when the form is filled', async () => {
        const submitLeadInquiry = vi.fn<LeadInquiryAction>().mockResolvedValue({ status: 'succeeded' });
        renderForm(submitLeadInquiry);

        await submitFormWith('Ion Popescu', '069123456');

        await waitFor(() =>
            expect(submitLeadInquiry).toHaveBeenCalledWith(
                expect.objectContaining({
                    formType: 'inquiry',
                    carId,
                    carTitle,
                    customerName: 'Ion Popescu',
                    customerPhone: '069123456',
                }),
            ),
        );
    });

    it('shows form_success_title once the submission is accepted', async () => {
        const submitLeadInquiry = vi.fn<LeadInquiryAction>().mockResolvedValue({ status: 'succeeded' });
        renderForm(submitLeadInquiry);

        await submitFormWith('Ion Popescu', '069123456');

        expect(await screen.findByText('form_success_title')).toBeInTheDocument();
    });

    it('shows rate_limited when the server rejects the submission as rate-limited', async () => {
        const submitLeadInquiry = vi
            .fn<LeadInquiryAction>()
            .mockResolvedValue({ status: 'rejected', reason: 'rate-limited' });
        renderForm(submitLeadInquiry);

        await submitFormWith('Ion Popescu', '069123456');

        expect(await screen.findByText('rate_limited')).toBeInTheDocument();
    });
});
