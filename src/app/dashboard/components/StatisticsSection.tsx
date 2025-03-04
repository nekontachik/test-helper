'use client';

import { SimpleGrid } from '@chakra-ui/react';
import { StatCard } from '@/components/Dashboard/StatCard';
import type { StatData } from '../types';

interface StatisticsSectionProps {
  stats: StatData[];
}

export const StatisticsSection = ({ stats }: StatisticsSectionProps): JSX.Element => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          stat={stat.stat}
          icon={stat.icon}
          colorScheme={stat.colorScheme}
          helpText={stat.helpText || ''}
        />
      ))}
    </SimpleGrid>
  );
};

export default StatisticsSection; 