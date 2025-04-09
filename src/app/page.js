// src/app/page.js
'use client'; // Required for hooks and event handlers

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

// --- Joy UI Imports ---
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import Autocomplete from '@mui/joy/Autocomplete';
import AutocompleteOption from '@mui/joy/AutocompleteOption'; // Use specific option component
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Avatar from '@mui/joy/Avatar';
import Chip from '@mui/joy/Chip';
import CircularProgress from '@mui/joy/CircularProgress';
import Alert from '@mui/joy/Alert';
// Import specific icons
import ReportIcon from '@mui/icons-material/Report';
import SearchIcon from '@mui/icons-material/Search';

// Helper function to convert rate strings to floats for sorting
const convertRateToFloat = (rateStr) => {
    if (!rateStr || rateStr === 'N/A') return 0.0;
    try { return parseFloat(rateStr.replace('%', '').trim()); }
    catch (e) {
        // console.warn(`Rate conversion failed for: ${rateStr}`); // Avoid console logs in production
        return 0.0;
     }
};

// Base path for hero images in the public folder
const HERO_IMAGE_BASE_PATH = '/images/heroes/';

export default function HomePage() {
    // State variables
    const [searchTerm, setSearchTerm] = useState('');         // The selected/final hero name to search for
    const [inputValue, setInputValue] = useState('');         // The text currently typed in the input box
    const [results, setResults] = useState(null);             // Array of counter heroes, or null if no search done
    const [isLoading, setIsLoading] = useState(false);        // Loading state for counter search results
    const [isLoadingNames, setIsLoadingNames] = useState(true); // Loading state for fetching hero names
    const [error, setError] = useState(null);                 // Error messages
    const [allHeroInfo, setAllHeroInfo] = useState([]);       // Array of {name, image} for autocomplete
    const formRef = useRef(null); // Keep ref for potential future use

    // Fetch hero names and images on component mount
    useEffect(() => {
        setIsLoadingNames(true);
        fetch('/api/heronames') // Fetch from the endpoint returning {name, image}
            .then(res => {
                if (!res.ok) throw new Error('Network response error fetching hero info');
                return res.json();
            })
            .then(info => {
                setAllHeroInfo(info || []); // Ensure it's an array
            })
            .catch(err => {
                console.error("Error fetching hero info:", err);
                setError("Could not load hero list for autocomplete."); // Set user-facing error
            })
            .finally(() => {
                setIsLoadingNames(false); // Stop loading indicator
            });
    }, []); // Empty dependency array ensures this runs only once on mount

    // Form submission logic (with updated error handling)
    const handleSubmit = async (event) => {
        if (event) event.preventDefault(); // Prevent page reload
        const termToSearch = searchTerm.trim() || inputValue.trim(); // Prioritize selected term, fallback to input

        if (!termToSearch) {
            setError('Please select or enter a valid hero name.'); // Use a more informative generic message
            setResults(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults(null); // Clear previous results

        try {
            // Fetch counter data from the API
            const response = await fetch(`/api/counters?heroName=${encodeURIComponent(termToSearch)}`);

            // *** UPDATED ERROR HANDLING FOR NON-OK RESPONSES ***
            if (!response.ok) {
                let message = `Error: ${response.status}`; // Default error message
                try {
                    // Attempt to parse the JSON body for a specific error message from the API
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        message = errorData.error; // Use the error message from the API (e.g., "ไม่พบข้อมูล...")
                    }
                } catch (jsonError) {
                    // If parsing JSON fails, stick with the status code message
                    console.error("Failed to parse error response JSON:", jsonError);
                }
                setError(message); // Set the error state
                setResults(null); // Ensure results are cleared
                setIsLoading(false); // Stop loading
                return; // Exit the function early on error
            }
            // *** END OF UPDATED ERROR HANDLING ***

            // If response IS ok (status 200-299)
            const data = await response.json();
            setResults(data); // Set the results (will be [] if no counters found)
            // Update searchTerm state if the search was triggered by inputValue directly
            // This ensures the title and avatar above results match what was searched
            if (!searchTerm || searchTerm.toLowerCase() !== termToSearch.toLowerCase()) {
                setSearchTerm(termToSearch);
            }
        } catch (err) { // Catch network errors or errors during fetch/JSON parsing
            console.error("Fetch error (outside response check):", err);
            setError(err.message || 'An unexpected network error occurred.'); // Set user-facing error
            setResults(null);
        } finally {
            // Ensure loading is always stopped
            setIsLoading(false); // Stop loading indicator
        }
    };

    // Sort results by win rate (descending) whenever results change
    const sortedResults = results
        ? [...results].sort((a, b) => convertRateToFloat(b.win_rate) - convertRateToFloat(a.win_rate))
        : null;

    // Find the info for the currently searched hero (for the top avatar)
    const searchedHeroInfo = searchTerm
        ? allHeroInfo.find(h => h.name.toLowerCase() === searchTerm.toLowerCase())
        : null;

    return (
        <> {/* React Fragment */}
            <Head>
                <title>Hero Counter Finder</title> {/* Simplified Title */}
                <meta name="description" content="Find Rov hero counters" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Main content card with glass effect */}
            <Sheet
                variant="outlined"
                 sx={{
                    width: '100%', maxWidth: { xs: '95%', sm: '600px', md: '700px' }, mx: 'auto',
                    my: 4, py: { xs: 5, sm: 6, lg: 10 }, px: { xs: 2, sm: 3, md: 4 }, // Adjusted py slightly
                    display: 'flex', flexDirection: 'column', gap: { xs: 3, sm: 4 }, // Adjusted gap
                    borderRadius: 'xl', boxShadow: 'lg',
                    bgcolor: (theme) => `rgba(${theme.vars.palette.background.surfaceChannel} / 0.85)`, // Adjusted alpha
                    backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', // Adjusted blur
                    border: '0px solid', borderColor: (theme) => `rgba(${theme.vars.palette.neutral.plainChannel} / 0.2)`,
                }}
            >
                {/* Title */}
                <Typography
                    level="h2"
                    component="h1" // Correct semantic heading
                    textAlign="center"
                    sx={{
                        color: 'text.primary', fontWeight: 'md', // Adjusted weight
                        mb: { xs: 1, sm: 1 }, // Adjusted margin
                        fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' }, // Adjusted font size
                        lineHeight: 1.2,
                    }}
                >
                    🗺️ ค้นหาฮีโร่แก้ทางใก้ลฉัน 📍
                </Typography>

                {/* Form Section */}
                <Box component="form" onSubmit={handleSubmit} ref={formRef} sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%', maxWidth: '450px', mx:'auto', position: 'relative' }}>
                     <FormControl sx={{ flexGrow: 1 }}>
                         {/* Joy UI Autocomplete */}
                         <Autocomplete
                            freeSolo
                            autoHighlight
                            options={allHeroInfo}
                            loading={isLoadingNames}
                            loadingText="กำลังโหลดฮีโร่..."
                            value={allHeroInfo.find(h => h.name === searchTerm) || null}
                            inputValue={inputValue}
                            onInputChange={(_event, newValue, reason) => {
                                setInputValue(newValue);
                                // Clear committed term if input is cleared
                                if (reason === 'clear' || newValue === '') {
                                    setSearchTerm('');
                                    setResults(null);
                                    setError(null);
                                }
                                // Clear results/error when user starts typing again after a search
                                if (reason === 'input') {
                                     setResults(null);
                                     setError(null);
                                     // Optionally clear committed search term immediately on typing
                                     // setSearchTerm('');
                                }
                            }}
                            onChange={(_event, newValue) => {
                                const selectedName = typeof newValue === 'string' ? newValue : newValue?.name || '';
                                setSearchTerm(selectedName); // Commit the search term
                                setInputValue(selectedName); // Sync input visually
                                setError(null);
                                setResults(null);
                            }}
                            getOptionLabel={(option) => typeof option === 'string' ? option : option?.name || ''}
                            isOptionEqualToValue={(option, value) => option?.name === value?.name}
                            placeholder={isLoadingNames ? "กำลังโหลด..." : "พิมพ์ชื่อฮีโร่..."}
                            disabled={isLoadingNames}
                            renderOption={(props, option) => {
                                const { key, ...optionProps } = props;
                                return (
                                    <AutocompleteOption key={key} {...optionProps}>
                                        <ListItemDecorator>
                                            <Avatar size="sm" src={option.image ? `${HERO_IMAGE_BASE_PATH}${option.image}` : '/placeholder.png'} alt={option.name}/>
                                        </ListItemDecorator>
                                        <ListItemContent sx={{ fontSize: 'sm' }}>{option.name}</ListItemContent>
                                    </AutocompleteOption>
                                );
                            }}
                            size="sm" // Matched button size
                            slotProps={{
                                input: { autoComplete: 'off' },
                                listbox: { sx: { maxHeight: '240px', overflow: 'auto', bgcolor: 'background.body', boxShadow: 'md', zIndex: 1300 } }
                             }}
                            sx={{ boxShadow: 'sm' }}
                         />
                     </FormControl>
                    <Button
                        type="submit"
                        loading={isLoading}
                        disabled={!(searchTerm || inputValue) || isLoading || isLoadingNames}
                        startDecorator={<SearchIcon />}
                        variant="solid"
                        size="sm" // Matched Autocomplete size
                    >
                        Search
                    </Button>
                </Box>

                {/* Error Alert */}
                {error && (
                     <Alert variant="soft" color="danger" startDecorator={<ReportIcon />} sx={{ mt: 2, width: '100%', maxWidth: '450px', mx:'auto' }}>
                         <Typography level="body-sm" color="danger">{error}</Typography>
                      </Alert>
                )}

                {/* Loading Indicator */}
                 {isLoading && (
                     <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                         <CircularProgress variant="plain" />
                     </Box>
                 )}

                {/* Results Area */}
                {sortedResults !== null && !isLoading && (
                    <Box sx={{ width: '100%', mt: 4, maxWidth: '500px', mx: 'auto' }}>

                        {/* Searched Hero Avatar */}
                        {searchedHeroInfo?.image && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <Avatar size="xl" variant="outlined" src={`${HERO_IMAGE_BASE_PATH}${searchedHeroInfo.image}`} alt={searchTerm} sx={{ boxShadow: 'md' }}/>
                            </Box>
                        )}

                        {/* Results Title - Only show if there was a search term */}
                       {searchTerm && (
                            <Typography level="lg" component="h1" textAlign="center" mb={3}>
                                ตัวแก้ทาง {searchTerm} :
                            </Typography>
                        )}

                        {/* Results List or "No results" message */}
                        {sortedResults.length > 0 ? (
                            <List variant="outlined" sx={{ borderRadius: 'md', bgcolor: 'background.body' }}>
                                {sortedResults.map((hero, index) => (
                                    <ListItem key={hero.name + '-result-' + index} sx={{ ...( index === sortedResults.length - 1 ? {} : { borderBottom: '1px solid', borderColor: 'divider' }), alignItems: 'center', py: 1.5 }}>
                                        <ListItemDecorator sx={{ minWidth: '48px', mr: 1.5 }}>
                                            <Avatar size="lg" src={hero.image ? `${HERO_IMAGE_BASE_PATH}${hero.image}` : '/placeholder.png'} alt={hero.name} sx={{ boxShadow: 'sm', bgcolor: 'background.level1' }}/>
                                        </ListItemDecorator>
                                        <ListItemContent>
                                            <Typography level="title-sm">{hero.name}</Typography>
                                            <Typography level="body-xs" sx={{ color: 'text.secondary' }}>{hero.type}</Typography>
                                        </ListItemContent>
                                        <Chip variant="outlined" color="neutral" size="sm" sx={{ ml: 'auto' }}>
                                            {hero.win_rate}
                                        </Chip>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                             // Show this message only if results array is empty AND there wasn't an error reported
                           !error && <Typography level="body-sm" textAlign="center" sx={{ color: 'text.tertiary', mt: 2 }}>
                                ยังไม่มีข้อมูลตัวแก้ทางสำหรับฮีโร่นี้
                            </Typography>
                        )}
                    </Box>
                )}
            </Sheet>
        </>
    );
}