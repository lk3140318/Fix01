document.addEventListener('DOMContentLoaded', () => {
    const movieGrid = document.getElementById('movieGrid');
    const searchBox = document.getElementById('searchBox');
    const categoryButtons = document.querySelectorAll('.category-button[data-category]');
    let allMovies = []; // To store all fetched movies

    // --- Fetch Movie Data ---
    fetch('movies.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allMovies = data; // Store the data
            displayMovies(allMovies); // Display all movies initially
        })
        .catch(error => {
            console.error("Could not fetch movies:", error);
            movieGrid.innerHTML = '<p>Error loading movies. Please try again later.</p>';
        });

    // --- Display Movies Function ---
    function displayMovies(moviesToDisplay) {
        movieGrid.innerHTML = ''; // Clear existing grid

        if (moviesToDisplay.length === 0) {
            movieGrid.innerHTML = '<p>No movies found matching your criteria.</p>';
            return;
        }

        moviesToDisplay.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');

            // Create URL for the details page (passing movie ID as a query parameter)
            const detailPageUrl = `movie-details.html?id=${encodeURIComponent(movie.id)}`;

            movieItem.innerHTML = `
                <img src="${movie.posterUrl}" alt="${movie.title} Poster" loading="lazy">
                <h3>${movie.title}</h3>
                <a href="${detailPageUrl}" class="view-details-btn">View Details</a>
            `;
            movieGrid.appendChild(movieItem);
        });
    }

    // --- Search Functionality ---
    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const activeCategory = document.querySelector('.category-button.active')?.dataset.category || 'all'; // Get current category

        const filteredMovies = allMovies.filter(movie => {
            const titleMatch = movie.title.toLowerCase().includes(searchTerm);
            const categoryMatch = activeCategory === 'all' || movie.categories.includes(activeCategory);
            return titleMatch && categoryMatch; // Match both search term and category
        });
        displayMovies(filteredMovies);
    });

    // --- Category Filtering ---
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Don't process the external Telegram link button
            if (button.tagName === 'A') {
                return;
            }

            const category = button.dataset.category;

            // Update active button style
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Clear search box when changing category
            searchBox.value = '';

            // Filter movies
            let filteredMovies;
            if (category === 'all') {
                filteredMovies = allMovies;
            } else {
                filteredMovies = allMovies.filter(movie => movie.categories.includes(category));
            }
            displayMovies(filteredMovies);
        });
    });
});
