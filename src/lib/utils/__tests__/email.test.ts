import { sendEmail, sendVerificationEmail } from '../email';
import { createTransport } from 'nodemailer';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}));

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email', async () => {
      const mockTransporter = createTransport({});
      await sendVerificationEmail('test@example.com', 'token123');
      
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Verify your email address',
        })
      );
    });
  });

  describe('sendEmail', () => {
    it('should retry failed emails', async () => {
      const mockTransporter = createTransport({});
      const mockSendMail = mockTransporter.sendMail as jest.Mock;
      
      mockSendMail
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(true);

      await sendEmail('test@example.com', 'Test', '<p>Test</p>');
      expect(mockSendMail).toHaveBeenCalledTimes(2);
    });
  });
}); 