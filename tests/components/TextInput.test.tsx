import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { TextInput } from '@/components/TextInput';

describe('TextInput', () => {
  it('renders correctly', () => {
    const { getByLabelText } = render(
      <TextInput label="Test Input" name="test" value="" onChange={() => {}} />
    );

    expect(getByLabelText('Test Input')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', () => {
    const handleChange = jest.fn();
    const { getByLabelText } = render(
      <TextInput
        label="Test Input"
        name="test"
        value=""
        onChange={handleChange}
      />
    );

    fireEvent.change(getByLabelText('Test Input'), {
      target: { value: 'New Value' },
    });
    expect(handleChange).toHaveBeenCalled();
  });
});
