document.addEventListener('DOMContentLoaded', () => {
    const movieGrid = document.getElementById('movieGrid');
    const searchBox = document.getElementById('searchBox');
    const searchButton = document.getElementById('searchButton');
    const categoryButtons = document.querySelectorAll('.category-button[data-category]');
    const paginationContainer = document.getElementById('pagination');
    const loadingMessage = document.querySelector('.loading-message');

    let allMovies = []; // Store all fetched movies
    let filteredMovies = []; // Store movies after filtering
    let currentPage = 1;
    const itemsPerPage = 18; // Adjust how many items per page (like the screenshot)

    // --- Fetch Movie Data ---
    fetch('movies.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Add check for empty or non-JSON response
             const contentType = response.headers.get("content-type");
             if (!contentType || !contentType.includes("application/json")) {
                // Handle case where file is empty or not JSON (e.g., during initial setup)
                console.warn("Received non-JSON response or empty file for movies.json");
                return []; // Return empty array to avoid breaking JSON.parse
            }
            return response.json();
        })
        .then(data => {
            allMovies = data || []; // Ensure it's an array even if null/undefined
            filteredMovies = [...allMovies]; // Initially, all movies are shown
            if (loadingMessage) loadingMessage.style.display = 'none';
            renderPage(currentPage);
        })
        .catch(error => {
            console.error("Could not fetch movies:", error);
            if (loadingMessage) loadingMessage.style.display = 'none';
            movieGrid.innerHTML = '<p class="no-results-message">Error loading movies. Please try again later.</p>';
        });

    // --- Render Movies for the Current Page ---
    function renderPage(page) {
        currentPage = page;
        movieGrid.innerHTML = ''; // Clear existing grid
        paginationContainer.innerHTML = ''; // Clear existing pagination

        if (filteredMovies.length === 0) {
            movieGrid.innerHTML = '<p class="no-results-message">No movies found matching your criteria.</p>';
            return; // No need to render pagination if no movies
        }

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const moviesToDisplay = filteredMovies.slice(startIndex, endIndex);

        moviesToDisplay.forEach(movie => {
            const movieItem = document.createElement('a'); // Make the whole item a link
            movieItem.classList.add('movie-item');
            movieItem.href = `movie-details.html?id=${encodeURIComponent(movie.id)}`;

            // Use placeholder image if posterUrl is missing
            const posterSrc = movie.posterUrl || 'https://via.placeholder.com/200x300/2a2a2a/e0e0e0?text=No+Image';

            movieItem.innerHTML = `
                <div class="movie-poster-link">
                    <img src="${posterSrc}" alt="${movie.title} Poster" loading="lazy">
                    ${movie.tag ? `<span class="corner-tag">${movie.tag}</span>` : ''}
                </div>
                <div class="movie-info">
                    <span class="movie-date">${movie.releaseDate || 'Date N/A'}</span>
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-short-details">${movie.shortDetails || ''}</p>
                </div>
            `;
            movieGrid.appendChild(movieItem);
        });

        setupPagination(filteredMovies.length, page);
    }

    // --- Setup Pagination ---
    function setupPagination(totalItems, currentPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationContainer.innerHTML = ''; // Clear previous buttons

        if (totalPages <= 1) return; // No pagination needed for one page or less

        // Previous Button
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '« Prev'; // «
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) renderPage(currentPage - 1);
        });
        paginationContainer.appendChild(prevButton);

        // Page Number Buttons (simplified version)
        // Show first page, last page, current page, and pages around current page
        const maxPagesToShow = 5; // Adjust how many page numbers visible
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Adjust if we are near the beginning
         if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
         }


        if (startPage > 1) {
            const firstPageButton = document.createElement('button');
            firstPageButton.textContent = '1';
            firstPageButton.addEventListener('click', () => renderPage(1));
            paginationContainer.appendChild(firstPageButton);
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
        }


        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
                pageButton.disabled = true; // Cannot click the current page
            } else {
                pageButton.addEventListener('click', () => renderPage(i));
            }
            paginationContainer.appendChild(pageButton);
        }

         if (endPage < totalPages) {
            if (endPage < totalPages -1) {
                 const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
             const lastPageButton = document.createElement('button');
            lastPageButton.textContent = totalPages;
            lastPageButton.addEventListener('click', () => renderPage(totalPages));
            paginationContainer.appendChild(lastPageButton);
        }


        // Next Button
        const nextButton = document.createElement('button');
        nextButton.innerHTML = 'Next »'; // »
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) renderPage(currentPage + 1);
        });
        paginationContainer.appendChild(nextButton);
    }

    // --- Filtering Logic (Search and Category) ---
    function applyFilters() {
        const searchTerm = searchBox.value.toLowerCase().trim();
        const activeCategoryButton = document.querySelector('.category-button.active');
        const activeCategory = activeCategoryButton ? activeCategoryButton.dataset.category : 'all';

        filteredMovies = allMovies.filter(movie => {
            const titleMatch = movie.title.toLowerCase().includes(searchTerm);
            // Also check description or other fields if needed:
            // const descriptionMatch = movie.description.toLowerCase().includes(searchTerm);
            const categoryMatch = activeCategory === 'all' || (movie.categories && movie.categories.includes(activeCategory));

            return (titleMatch /* || descriptionMatch */) && categoryMatch;
        });

        renderPage(1); // Go back to page 1 after filtering
    }

    // --- Event Listeners ---
    searchBox.addEventListener('input', applyFilters); // Filter as user types
    searchButton.addEventListener('click', applyFilters); // Also filter on button click

    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Don't process clicks on the external Telegram link
            if (e.target.tagName === 'A') {
                return;
            }

            // Update active button style
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // Apply filters
            applyFilters();
        });
    });

});
