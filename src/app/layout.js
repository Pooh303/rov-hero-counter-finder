// src/app/layout.js
import { Inter } from 'next/font/google'; // Or your local font setup
import localFont from 'next/font/local';
import ThemeRegistry from './ThemeRegistry';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography'; // <-- Import Typography
import Link from '@mui/joy/Link';           // <-- Import Link
import { SpeedInsights } from "@vercel/speed-insights/next";
import './globals.css';

// --- Font Setup ---
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
  title: "Hero Counter Finder | Joy UI",
  description: "Find hero counters based on win rate data using MUI Joy UI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${notoSansThai.variable} ${inter.variable}`}>
      <body className={notoSansThai.className}>
        <ThemeRegistry options={{ key: 'joy' }}>
          {/* Main Box now uses flex to push footer down */}
          <Box
            sx={{
              minHeight: '100vh', // Ensures footer can be pushed down
              display: 'flex',
              flexDirection: 'column', // Stack children vertically
              // justifyContent: 'center', // Remove this if you want content centered only if it's short
            }}
          >
             {/* Content Centering Box */}
             <Box
                component="main" // Use main semantic tag
                sx={{
                    flexGrow: 1, // Allow this Box to grow and push the footer down
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center', // Center content horizontally
                    justifyContent: 'center', // Center content vertically if it's short
                    width: '100%',
                    py: { xs: 2, md: 3 }, // Vertical padding for content area
                    // Horizontal padding is applied within the child page's Sheet now
                }}
             >
                {children} {/* Your page content (Sheet component) goes here */}
             </Box>

             {/* Footer Section */}
             <Box
                component="footer"
                sx={{
                    width: '100%',
                    py: 2, // Padding top/bottom for footer
                    mt: 'auto', // Push footer to the bottom when content is short
                    textAlign: 'center',
                    // Dark background color
                    bgcolor: 'neutral.900', // Or common.black, or #000000
                    borderTop: '1px solid', // Optional subtle top border
                    borderColor: 'divider',
                }}
             >
                 <Typography
                    level="body-sm"
                    // White text for contrast
                    sx={{ color: 'common.white' }}
                 >
                     อ้างอิง: {/* Non-breaking space */}
                     <Link
                        href="https://herowinrate.moba.garena.in.th/th"
                        target="_blank"
                        rel="noopener noreferrer"
                        // Style link to be blue and visible on dark background
                        sx={{
                            // Use a lighter blue shade from the primary palette
                            // Adjust the number (200, 300, 400) for desired brightness
                            color: 'primary.300',
                            // Or use a specific blue if primary isn't blue: color: 'info.300' / 'info.400'
                            // Or hardcode: color: '#64B5F6', // Example light blue hex

                            textDecoration: 'underline', // Make it clear it's a link
                            '&:hover': {
                                // Slightly brighter blue on hover
                                color: 'primary.200',
                                // Or: color: 'info.200',
                                // Or hardcode: color: '#90CAF9',
                            }
                        }}
                        >
                          herowinrate.moba.garena.in.th/th
                     </Link>
                 </Typography>
             </Box>

             <SpeedInsights />

          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}