import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SignIn from '@/src/app/auth/signin/page';
import Register from '@/src/app/auth/register/page';
import { act } from 'react-dom/test-utils';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Chakra toast
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => jest.fn(),
}));

describe('Authentication Flow', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('SignIn Page', () => {
    it('should render sign in form', () => {
      render(<SignIn />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should handle successful sign in', async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({ error: null });
      
      render(<SignIn />);
      
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
          target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      });

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        });
        expect(mockRouter.push).toHaveBeenCalledWith('/projects');
      });
    });

    it('should handle sign in error', async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({ error: 'Invalid credentials' });
      
      render(<SignIn />);
      
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
          target: { value: 'wrongpassword' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Register Page', () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    beforeEach(() => {
      mockFetch.mockClear();
    });

    it('should render registration form', () => {
      render(<Register />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('should handle successful registration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: '1', email: 'test@example.com' } }),
      });

      render(<Register />);
      
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/name/i), {
          target: { value: 'Test User' },
        });
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
          target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
          }),
        });
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/signin');
      });
    });

    it('should handle registration error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'User already exists' }),
      });

      render(<Register />);
      
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/name/i), {
          target: { value: 'Test User' },
        });
        fireEvent.change(screen.getByLabelText(/email/i), {
          target: { value: 'existing@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
          target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));
      });

      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication API', () => {
    it('should handle registration API request', async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.user).toHaveProperty('email', 'test@example.com');
      expect(data.user).not.toHaveProperty('password');
    });

    it('should handle duplicate email registration', async () => {
      // First registration
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'duplicate@example.com',
          password: 'password123',
        }),
      });

      // Duplicate registration
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Another User',
          email: 'duplicate@example.com',
          password: 'password123',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.message).toBe('User already exists');
    });
  });
}); 