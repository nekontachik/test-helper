import React from 'react';
import { render, screen } from '@testing-library/react';

function SimpleComponent() {
  return <div>Hello, World!</div>;
}

describe('SimpleComponent', () => {
  it('renders hello world', () => {
    render(<SimpleComponent />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });
});
