document.addEventListener('DOMContentLoaded', () => {
    // --- !! INSECURE HARDCODED PASSWORD !! ---
    // --- Replace 'YourSecretPassword' ---
    // --- Anyone viewing source can see this ---
    const CORRECT_PASSWORD = 'YourSecretPassword';

    const loginSection = document.getElementById('loginSection');
    const adminContent = document.getElementById('adminContent');
    const loginButton = document.getElementById('loginButton');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');

    const addMovieForm = document.getElementById('addMovieForm');
    const outputJson = document.getElementById('outputJson');
    const movieList = document.getElementById('movieList');
    const editIdField = document.getElementById('editId'); // Hidden field

    let currentMoviesData = []; // To hold the current movie data

    // --- Login Logic ---
    loginButton.addEventListener('click', () => {
        if (passwordInput.value === CORRECT_PASSWORD) {
            loginSection.style.display = 'none';
            adminContent.style.display = 'block';
            loadCurrentData(); // Load data after successful login
        } else {
            loginError.textContent = 'Incorrect password.';
        }
    });

    // --- Load current data from movies.json ---
    function loadCurrentData() {
        fetch('movies.json')
            .then(response => {
                // Handle potential empty file or invalid JSON on first load
                if (!response.ok) {
                     if (response.status === 404) return []; // File not found, start fresh
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                // Check content type in case it's not JSON (e.g., HTML error page)
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    return response.json();
                } else {
                    // If it's not JSON, assume it might be empty or corrupt
                    console.warn("Received non-JSON response when fetching movies.json. Starting with empty data.");
                    return [];
                }
            })
            .then(data => {
                // Ensure data is an array
                currentMoviesData = Array.isArray(data) ? data : [];
                renderMovieList();
                updateOutputJson();
            })
            .catch(error => {
                console.error("Could not load movies.json:", error);
                alert("Error loading existing movie data. Check console. Starting fresh.");
                currentMoviesData = []; // Start with empty array on error
                renderMovieList();
                updateOutputJson();
            });
    }

    // --- Render Movie List for Editing/Deleting ---
    function renderMovieList() {
         movieList.innerHTML = ''; // Clear list
         currentMoviesData.forEach((movie, index) => {
             const li = document.createElement('li');
             li.innerHTML = `
                 <span>${movie.title} (ID: ${movie.id})</span>
                 <div>
                     <button class="edit-btn" data-index="${index}">Edit</button>
                     <button class="delete-btn" data-index="${index}">Delete</button>
                 </div>
             `;
             movieList.appendChild(li);
         });

         // Add event listeners for edit/delete buttons
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

        const editingId = editIdField.value; // Get ID from hidden field

        const movieData = {
            id: editingId || `movie-${Date.now()}-${Math.random().toString(16).slice(2)}`, // Generate new ID or use existing
            title: document.getElementById('title').value.trim(),
            posterUrl: document.getElementById('posterUrl').value.trim(),
            releaseDate: document.getElementById('releaseDate').value,
            language: document.getElementById('language').value.split(',').map(s => s.trim()).filter(Boolean),
            imdbRating: document.getElementById('imdbRating').value,
            description: document.getElementById('description').value.trim(),
            genres: document.getElementById('genres').value.split(',').map(s => s.trim()).filter(Boolean),
            platform: document.getElementById('platform').value.trim(),
            categories: document.getElementById('categories').value.toLowerCase().split(',').map(s => s.trim()).filter(Boolean),
            downloads: {
                '480p': document.getElementById('link480p').value.trim() || undefined,
                '720p': document.getElementById('link720p').value.trim() || undefined,
                '1080p': document.getElementById('link1080p').value.trim() || undefined,
                '4k': document.getElementById('link4k').value.trim() || undefined,
            },
            // downloadCount: 0 // Can initialize if needed, but not dynamically updated
        };

        // Clean up undefined download links
        Object.keys(movieData.downloads).forEach(key => {
            if (movieData.downloads[key] === undefined) {
                delete movieData.downloads[key];
            }
        });
         if (Object.keys(movieData.downloads).length === 0) {
             delete movieData.downloads; // Remove downloads object if empty
         }

        if (editingId) {
            // Update existing movie
            const indexToUpdate = currentMoviesData.findIndex(m => m.id === editingId);
            if (indexToUpdate > -1) {
                // Preserve download count if it exists
                 const existingMovie = currentMoviesData[indexToUpdate];
                 if(existingMovie.downloadCount) {
                     movieData.downloadCount = existingMovie.downloadCount;
                 }
                 currentMoviesData[indexToUpdate] = movieData;
            } else {
                 alert("Error: Could not find movie to update.");
                 return; // Stop if we can't find the movie
            }
        } else {
            // Add new movie
            currentMoviesData.push(movieData);
        }


        renderMovieList(); // Update the edit/delete list
        updateOutputJson(); // Update the JSON output area
        addMovieForm.reset(); // Clear the form
        editIdField.value = ''; // Clear the hidden edit ID field
        document.querySelector('#addMovieForm button[type=submit]').textContent = 'Add Movie'; // Reset button text
        alert(editingId ? 'Movie updated! Now copy the JSON below.' : 'Movie added! Now copy the JSON below.');
    });

    // --- Handle Edit Button Click ---
    function handleEdit(event) {
         const index = parseInt(event.target.dataset.index, 10);
         const movieToEdit = currentMoviesData[index];

         if (!movieToEdit) return;

         // Populate the form with the movie data
         document.getElementById('title').value = movieToEdit.title || '';
         document.getElementById('posterUrl').value = movieToEdit.posterUrl || '';
         document.getElementById('releaseDate').value = movieToEdit.releaseDate || '';
         document.getElementById('language').value = (movieToEdit.language || []).join(', ');
         document.getElementById('imdbRating').value = movieToEdit.imdbRating || '';
         document.getElementById('description').value = movieToEdit.description || '';
         document.getElementById('genres').value = (movieToEdit.genres || []).join(', ');
         document.getElementById('platform').value = movieToEdit.platform || '';
         document.getElementById('categories').value = (movieToEdit.categories || []).join(', ');
         document.getElementById('link480p').value = movieToEdit.downloads?.['480p'] || '';
         document.getElementById('link720p').value = movieToEdit.downloads?.['720p'] || '';
         document.getElementById('link1080p').value = movieToEdit.downloads?.['1080p'] || '';
         document.getElementById('link4k').value = movieToEdit.downloads?.['4k'] || '';

         editIdField.value = movieToEdit.id; // Set the hidden ID field
         document.querySelector('#addMovieForm button[type=submit]').textContent = 'Update Movie'; // Change button text

         // Scroll to the top of the form for better UX
         addMovieForm.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Handle Delete Button Click ---
    function handleDelete(event) {
        const index = parseInt(event.target.dataset.index, 10);
        const movieToDelete = currentMoviesData[index];

         if (!movieToDelete) return;

        if (confirm(`Are you sure you want to delete "${movieToDelete.title}"?`)) {
            currentMoviesData.splice(index, 1); // Remove the movie from the array
            renderMovieList(); // Re-render the list
            updateOutputJson(); // Update the JSON output
            alert('Movie deleted! Now copy the updated JSON below.');
        }
    }


    // --- Update JSON Output Area ---
    function updateOutputJson() {
        // Pretty print the JSON
        outputJson.value = JSON.stringify(currentMoviesData, null, 2);
    }

    // Initial check: If password was stored/remembered, try logging in
    // (This is just basic UX, not security)
    // if (/* some condition to check if already logged in, e.g., sessionStorage */) {
    //     loginSection.style.display = 'none';
    //     adminContent.style.display = 'block';
    //     loadCurrentData();
    // }
});
