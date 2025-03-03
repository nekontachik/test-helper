import {
  Grid,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Wrap,
  WrapItem
} from '@chakra-ui/react';

interface TestRunSummaryProps {
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    blocked: number;
    notExecuted: number;
    passRate: number;
    completionRate: number;
  };
}

export function TestRunSummary({ summary }: TestRunSummaryProps): JSX.Element {
  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
      <GridItem>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Pass Rate</StatLabel>
              <StatNumber>{summary.passRate.toFixed(1)}%</StatNumber>
              <StatHelpText>
                {summary.passed} of {summary.total} tests passed
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </GridItem>
      
      <GridItem>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Completion Rate</StatLabel>
              <StatNumber>{summary.completionRate.toFixed(1)}%</StatNumber>
              <StatHelpText>
                {summary.total - summary.notExecuted} of {summary.total} tests executed
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </GridItem>
      
      <GridItem>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Test Results</StatLabel>
              <Wrap spacing={2} mt={2}>
                <WrapItem>
                  <Badge colorScheme="green" px={2} py={1}>
                    {summary.passed} Passed
                  </Badge>
                </WrapItem>
                <WrapItem>
                  <Badge colorScheme="red" px={2} py={1}>
                    {summary.failed} Failed
                  </Badge>
                </WrapItem>
                <WrapItem>
                  <Badge colorScheme="yellow" px={2} py={1}>
                    {summary.skipped} Skipped
                  </Badge>
                </WrapItem>
                <WrapItem>
                  <Badge colorScheme="gray" px={2} py={1}>
                    {summary.blocked} Blocked
                  </Badge>
                </WrapItem>
              </Wrap>
            </Stat>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
} 