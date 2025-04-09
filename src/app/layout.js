// src/app/layout.js
import { Inter } from 'next/font/google'; // Or your local font setup
import localFont from 'next/font/local';
import ThemeRegistry from './ThemeRegistry';
import Box from '@mui/joy/Box';
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'; // Import global styles

// --- Font Setup (Assuming Noto Sans Thai + Inter Fallback) ---
const notoSansThai = localFont({
  src: './fonts/NotoSansThai.ttf',
  display: 'swap',
  weight: '400',
  variable: '--font-noto-sans-thai',
});
const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
 });
// --- End Font Setup ---

export const metadata = {
  title: "Hero Counter Finder",
  description: "Find hero counters based on win rate data",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${notoSansThai.variable} ${inter.variable}`}>
      <body className={notoSansThai.className}>
        <ThemeRegistry options={{ key: 'joy' }}>
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center', // Center content vertically
              width: '100%', // Ensure Box takes full width
              // Responsive padding for the overall page container
              p: { xs: 1, sm: 2, md: 3 },
            }}
          >
            {children}
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}