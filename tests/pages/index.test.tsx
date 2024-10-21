import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../../pages/index';

describe('Home page', () => {
  it('renders the home page', () => {
    render(<Home />);
    expect(screen.getByText(/welcome to test helper/i)).toBeInTheDocument();
  });
});
