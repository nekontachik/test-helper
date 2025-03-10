'use client';

import * as React from 'react';
import { useColorMode } from '@chakra-ui/react';
import { Button, Icon, Tooltip } from '@chakra-ui/react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

/**
 * A component that allows users to toggle between light and dark themes
 */
export function ThemeToggle({ className }: ThemeToggleProps): JSX.Element {
  const { colorMode: _colorMode, toggleColorMode } = useColorMode();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const toggleTheme = (): void => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
    toggleColorMode();
  };

  return (
    <Tooltip label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
      <Button
        size="sm"
        aria-label="Toggle theme"
        variant="ghost"
        border="1px solid #666666"
        p="1"
        _hover={{
          bg: isDarkMode ? "#333333" : "gray.100",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
        borderRadius="md"
        boxShadow="0 1px 2px rgba(0, 0, 0, 0.1)"
        className={cn(className)}
        onClick={toggleTheme}
      >
        {isDarkMode ? (
          <Icon as={FiMoon} boxSize={4} />
        ) : (
          <Icon as={FiSun} boxSize={4} />
        )}
      </Button>
    </Tooltip>
  );
} 