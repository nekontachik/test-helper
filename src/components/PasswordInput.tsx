'use client';

import { useState, forwardRef } from 'react';
import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  InputProps,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const [show, setShow] = useState(false);

    return (
      <InputGroup size="md">
        <Input
          ref={ref}
          pr="4.5rem"
          type={show ? 'text' : 'password'}
          {...props}
        />
        <InputRightElement width="4.5rem">
          <IconButton
            aria-label={show ? 'Hide password' : 'Show password'}
            h="1.75rem"
            size="sm"
            onClick={() => setShow(!show)}
            icon={show ? <ViewOffIcon /> : <ViewIcon />}
            variant="ghost"
          />
        </InputRightElement>
      </InputGroup>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
