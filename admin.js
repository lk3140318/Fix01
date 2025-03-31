document.addEventListener('DOMContentLoaded', () => {
    // --- !! INSECURE HARDCODED PASSWORD !! ---
    // --- Replace 'YourSecretPassword123' ---
    const CORRECT_PASSWORD = 'miss'; // CHANGE THIS!

    const loginSection = document.getElementById('loginSection');
    const adminContent = document.getElementById('adminContent');
    const loginButton = document.getElementById('loginButton');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');

    const addMovieForm = document.getElementById('addMovieForm');
    const outputJson = document.getElementById('outputJson');
    const movieList = document.getElementById('movieList');
    const editIdField = document.getElementById('editId');
    const submitBtn = document.getElementById('submitBtn');

    let currentMoviesData = []; // To hold the current movie data

    // --- Login Logic ---
    loginButton.addEventListener('click', () => {
        if (passwordInput.value === CORRECT_PASSWORD) {
            loginSection.style.display = 'none';
            adminContent.style.display = 'block';
            passwordInput.value = ''; // Clear password field
            loadCurrentData();
        } else {
            loginError.textContent = 'Incorrect password.';
        }
    });
     // Allow login with Enter key
     passwordInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission if inside a form
            loginButton.click();
        }
    });


    // --- Load current data from movies.json ---
    function loadCurrentData() {
        // Add timestamp to prevent browser caching of movies.json
        const nocache = '?t=' + Date.now();
        fetch('movies.json' + nocache)
            .then(response => {
                if (!response.ok) {
                     if (response.status === 404) return []; // File not found, start fresh
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const contentType = response.headers.get("content-type");
                 if (!contentType || !contentType.includes("application/json")) {
                     console.warn("Received non-JSON response for movies.json. Check file.");
                    return []; // Treat as empty if not JSON
                 }
                return response.json();
            })
            .then(data => {
                currentMoviesData = Array.isArray(data) ? data : [];
                 // Sort data by title or date if desired before rendering
                 // currentMoviesData.sort((a, b) => a.title.localeCompare(b.title));
                renderMovieList();
                updateOutputJson();
            })
            .catch(error => {
                console.error("Could not load movies.json:", error);
                alert("Error loading existing movie data. Check console. Starting with empty data.");
                currentMoviesData = [];
                renderMovieList();
                updateOutputJson();
            });
    }

    // --- Render Movie List for Editing/Deleting ---
    function renderMovieList() {
         movieList.innerHTML = ''; // Clear list
         if (currentMoviesData.length === 0) {
             movieList.innerHTML = '<p>No entries found in movies.json yet.</p>';
             return;
         }

         // Reverse for newest first appearance (optional)
         const reversedData = [...currentMoviesData].reverse();

         reversedData.forEach((movie) => {
             // Find original index needed for editing/deleting
             const originalIndex = currentMoviesData.findIndex(item => item.id === movie.id);

             const li = document.createElement('li');
             li.innerHTML = `
                 <span>${movie.title} (ID: ${movie.id})</span>
                 <div>
                     <button class="edit-btn" data-index="${originalIndex}">Edit</button>
                     <button class="delete-btn" data-index="${originalIndex}">Delete</button>
                 </div>
             `;
             movieList.appendChild(li);
         });

         // Add event listeners AFTER creating all items
         movieList.querySelectorAll('.edit-btn').forEach(button => {
             button.addEventListener('click', handleEdit);
         });
         movieList.querySelectorAll('.delete-btn').forEach(button => {
             button.addEventListener('click', handleDelete);
         });
    }

    // --- Handle Form Submission (Add/Update) ---
    addMovieForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const editingId = editIdField.value;

        // Helper function to get form value or null/undefined
        const getValue = (id) => document.getElementById(id)?.value.trim() || undefined;
        const getNumberValue = (id) => {
            const val = document.getElementById(id)?.value.trim();
            return val ? parseInt(val, 10) : undefined; // Parse as integer
        }
        const getArrayValue = (id) => getValue(id)?.split(',').map(s => s.trim()).filter(Boolean) || [];


        const movieData = {
            id: editingId || `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            title: getValue('title'),
            posterUrl: getValue('posterUrl'),
            tag: getValue('tag'),
            releaseDate: getValue('releaseDate'),
            shortDetails: getValue('shortDetails'),
            fullDescription: getValue('fullDescription') || getValue('shortDetails') || 'No description provided.', // Use shortDetails as fallback
            language: getArrayValue('language'),
            imdbRating: getValue('imdbRating'), // Keep as string for "N/A"
            genres: getArrayValue('genres'),
            platform: getValue('platform'),
            categories: getArrayValue('categories').map(cat => cat.toLowerCase()), // Ensure lowercase
            downloads: {
                '480p': getValue('link480p'),
                '720p': getValue('link720p'),
                '1080p': getValue('link1080p'),
                '4k': getValue('link4k'),
            },
            downloadCount: getNumberValue('downloadCount'),
        };

         // --- Data Validation (Basic) ---
        if (!movieData.title || !movieData.posterUrl || movieData.categories.length === 0) {
            alert('Please fill in required fields: Title, Poster URL, and Categories.');
            return;
        }


        // Clean up empty download links/count
        Object.keys(movieData.downloads).forEach(key => {
            if (!movieData.downloads[key]) { // Check for undefined or empty string
                delete movieData.downloads[key];
            }
        });
         if (Object.keys(movieData.downloads).length === 0) {
             delete movieData.downloads;
         }
         if (movieData.downloadCount === undefined || isNaN(movieData.downloadCount)) {
            delete movieData.downloadCount;
        }


        if (editingId) {
            // Update existing movie
            const indexToUpdate = currentMoviesData.findIndex(m => m.id === editingId);
            if (indexToUpdate > -1) {
                // Preserve original download count if not provided in update, unless explicitly set to 0
                 const existingMovie = currentMoviesData[indexToUpdate];
                 if(movieData.downloadCount === undefined && existingMovie.downloadCount !== undefined) {
                     movieData.downloadCount = existingMovie.downloadCount;
                 }
                 currentMoviesData[indexToUpdate] = movieData;
                 alert('Entry updated! Copy the JSON below and update movies.json.');
            } else {
                 alert("Error: Could not find entry to update.");
                 return;
            }
        } else {
            // Add new movie (add to the beginning of the array for LIFO display)
            currentMoviesData.unshift(movieData);
            alert('Entry added! Copy the JSON below and update movies.json.');
        }

        renderMovieList(); // Update the edit/delete list
        updateOutputJson(); // Update the JSON output area
        addMovieForm.reset(); // Clear the form
        editIdField.value = ''; // Clear the hidden edit ID field
        submitBtn.textContent = 'Add / Update Entry'; // Reset button text
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); // Scroll to bottom
    });

    // --- Handle Edit Button Click ---
    function handleEdit(event) {
         const index = parseInt(event.target.dataset.index, 10);
         const movieToEdit = currentMoviesData[index];

         if (!movieToEdit) return;

         // Helper to set form value or empty string
         const setValue = (id, value) => {
             const element = document.getElementById(id);
             if(element) element.value = value || '';
         };
        const setArrayValue = (id, value) => {
             const element = document.getElementById(id);
             if(element) element.value = (value || []).join(', ');
        }


         // Populate the form
         setValue('editId', movieToEdit.id); // Set the hidden ID field
         setValue('title', movieToEdit.title);
         setValue('posterUrl', movieToEdit.posterUrl);
         setValue('tag', movieToEdit.tag);
         setValue('releaseDate', movieToEdit.releaseDate);
         setValue('shortDetails', movieToEdit.shortDetails);
         setValue('fullDescription', movieToEdit.fullDescription);
         setArrayValue('language', movieToEdit.language);
         setValue('imdbRating', movieToEdit.imdbRating);
         setArrayValue('genres', movieToEdit.genres);
         setValue('platform', movieToEdit.platform);
         setArrayValue('categories', movieToEdit.categories);
         setValue('link480p', movieToEdit.downloads?.['480p']);
         setValue('link720p', movieToEdit.downloads?.['720p']);
         setValue('link1080p', movieToEdit.downloads?.['1080p']);
         setValue('link4k', movieToEdit.downloads?.['4k']);
         setValue('downloadCount', movieToEdit.downloadCount);


         submitBtn.textContent = 'Update This Entry'; // Change button text
         addMovieForm.scrollIntoView({ behavior: 'smooth' }); // Scroll to form
    }

    // --- Handle Delete Button Click ---
    function handleDelete(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const movieToDelete = currentMoviesData[index];

         if (!movieToDelete) return;

        if (confirm(`Are you sure you want to delete "${movieToDelete.title}"? This cannot be undone.`)) {
            currentMoviesData.splice(index, 1); // Remove the movie from the array
            renderMovieList(); // Re-render the list
            updateOutputJson(); // Update the JSON output
            alert('Entry deleted! Copy the updated JSON below and update movies.json.');
        }
    }


    // --- Update JSON Output Area ---
    function updateOutputJson() {
        // Pretty print the JSON
        outputJson.value = JSON.stringify(currentMoviesData, null, 2); // Use 2 spaces for indentation
        outputJson.scrollTop = 0; // Scroll textarea to top
    }

});
