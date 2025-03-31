document.addEventListener('DOMContentLoaded', () => {
    const movieGrid = document.getElementById('movieGrid');
    const searchBox = document.getElementById('searchBox');
    const searchButton = document.getElementById('searchButton');
    const categoryButtons = document.querySelectorAll('.category-button[data-category]');
    const paginationContainer = document.getElementById('pagination');
    const loadingMessage = document.querySelector('.loading-message');

    let allMovies = [];
    let filteredMovies = [];
    let currentPage = 1;
    const itemsPerPage = 18; // आइटम्स प्रति पेज

    // --- Fetch Movie Data ---
    fetch('movies.json?v=' + Date.now()) // Cache busting
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
             const contentType = response.headers.get("content-type");
             if (!contentType || !contentType.includes("application/json")) {
                console.warn("Received non-JSON response for movies.json");
                return [];
            }
            return response.json();
        })
        .then(data => {
            allMovies = data || [];
            filteredMovies = [...allMovies];
            if (loadingMessage) loadingMessage.style.display = 'none';
            renderPage(currentPage);
        })
        .catch(error => {
            console.error("Could not fetch movies:", error);
            if (loadingMessage) loadingMessage.style.display = 'none';
            movieGrid.innerHTML = '<p class="no-results-message">Error loading movies.</p>';
        });

    // --- Render Movies for the Current Page (Modified) ---
    function renderPage(page) {
        currentPage = page;
        movieGrid.innerHTML = '';
        paginationContainer.innerHTML = '';

        if (filteredMovies.length === 0) {
            movieGrid.innerHTML = '<p class="no-results-message">No movies found.</p>';
            return;
        }

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const moviesToDisplay = filteredMovies.slice(startIndex, endIndex);

        moviesToDisplay.forEach(movie => {
            const movieItem = document.createElement('div'); // अब यह div है, लिंक नहीं
            movieItem.classList.add('movie-item');
            movieItem.dataset.movieId = movie.id; // Store ID for potential future use

            const posterSrc = movie.posterUrl || 'https://via.placeholder.com/200x300/2a2a2a/e0e0e0?text=No+Image';

            // --- Generate Download Buttons HTML ---
            let downloadButtonsHTML = '';
            if (movie.downloads && Object.keys(movie.downloads).length > 0) {
                const qualities = ['480p', '720p', '1080p', '4k']; // ऑर्डर
                const availableQualities = Object.keys(movie.downloads);
                availableQualities.sort((a, b) => qualities.indexOf(a) - qualities.indexOf(b)); // Sort

                availableQualities.forEach(quality => {
                    const link = movie.downloads[quality];
                    if (link) {
                        downloadButtonsHTML += `
                            <a href="${link}" target="_blank" class="card-download-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>
                                ${quality.toUpperCase()}
                            </a>
                            <button class="card-copy-btn" data-link="${link}" data-quality="${quality}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>
                                Copy
                            </button>
                        `;
                    }
                });
            } else {
                downloadButtonsHTML = '<span style="font-size: 0.8em; color: #aaa;">Links N/A</span>';
            }
            // --- End Download Buttons HTML ---


            movieItem.innerHTML = `
                <div class="movie-poster-link">
                    <img src="${posterSrc}" alt="${movie.title} Poster" loading="lazy">
                    ${movie.tag ? `<span class="corner-tag">${movie.tag}</span>` : ''}
                </div>
                <div class="movie-info">
                    <div> <!-- Wrapper for non-button content -->
                        <span class="movie-date">${movie.releaseDate || 'Date N/A'}</span>
                        <h3 class="movie-title">${movie.title}</h3>
                        <p class="movie-short-details">${movie.shortDetails || ''}</p>
                    </div>
                    <div class="download-links-container">
                        ${downloadButtonsHTML}
                    </div>
                </div>
            `;
            movieGrid.appendChild(movieItem);
        });

        // Add event listeners for copy buttons AFTER grid is populated
        addCopyLinkListeners();
        setupPagination(filteredMovies.length, page);
    }

    // --- Copy Link Functionality (Attached to movieGrid for delegation) ---
    function addCopyLinkListeners() {
        movieGrid.addEventListener('click', function(event) {
            // Check if the clicked element is a copy button
            if (event.target.classList.contains('card-copy-btn')) {
                const button = event.target;
                const linkToCopy = button.dataset.link;
                const quality = button.dataset.quality;

                navigator.clipboard.writeText(linkToCopy)
                    .then(() => {
                        const originalHTML = button.innerHTML;
                        // Provide feedback (e.g., change text/style)
                        button.innerHTML = `
                           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022z"/></svg>
                           Copied!`;
                        button.style.backgroundColor = 'var(--accent-color-green)';
                        button.disabled = true;

                        setTimeout(() => {
                            button.innerHTML = originalHTML;
                            button.style.backgroundColor = ''; // Revert style
                            button.disabled = false;
                        }, 1500); // Revert after 1.5 seconds
                    })
                    .catch(err => {
                        console.error('Failed to copy link: ', err);
                        // Optionally provide user feedback for error
                    });
            }
        });
    }


    // --- Setup Pagination Function (remains the same as before) ---
    function setupPagination(totalItems, currentPage) {
        // ... (Pagination logic is unchanged) ...
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationContainer.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous Button
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '« Prev';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) renderPage(currentPage - 1);
        });
        paginationContainer.appendChild(prevButton);

        // Page Number Buttons
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
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
                pageButton.disabled = true;
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
        nextButton.innerHTML = 'Next »';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) renderPage(currentPage + 1);
        });
        paginationContainer.appendChild(nextButton);
    }

    // --- Filtering Logic (Search and Category - remains the same) ---
    function applyFilters() {
        // ... (Filtering logic is unchanged) ...
        const searchTerm = searchBox.value.toLowerCase().trim();
        const activeCategoryButton = document.querySelector('.category-button.active');
        const activeCategory = activeCategoryButton ? activeCategoryButton.dataset.category : 'all';

        filteredMovies = allMovies.filter(movie => {
            const titleMatch = movie.title.toLowerCase().includes(searchTerm);
            const categoryMatch = activeCategory === 'all' || (movie.categories && movie.categories.includes(activeCategory));
            return titleMatch && categoryMatch;
        });
        renderPage(1); // Go back to page 1 after filtering
    }

    // --- Event Listeners (Search and Category - remains the same) ---
    searchBox.addEventListener('input', applyFilters);
    searchButton.addEventListener('click', applyFilters);

    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') { return; } // Skip Telegram link
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            applyFilters();
        });
    });

});
