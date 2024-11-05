import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface VerificationEmailProps {
  name: string;
  verificationUrl: string;
}

export function VerificationEmail({
  name,
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify your email address</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Please verify your email address by clicking the button below:
          </Text>
          <Section style={buttonContainer}>
            <Button 
              style={{
                ...button,
                padding: '12px 20px'
              }}
              href={verificationUrl}
            >
              Verify Email
            </Button>
          </Section>
          <Text style={text}>
            Or copy and paste this URL into your browser:{' '}
            <Link href={verificationUrl} style={link}>
              {verificationUrl}
            </Link>
          </Text>
          <Text style={text}>
            If you didn't request this email, you can safely ignore it.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
} as const;

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
} as const;

const h1 = {
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  color: '#1a1a1a',
} as const;

const text = {
  margin: '16px 0',
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#3a3a3a',
} as const;

const buttonContainer = {
  margin: '24px 0',
} as const;

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
} as const;

const link = {
  color: '#067df7',
  textDecoration: 'none',
} as const; 