document.addEventListener('DOMContentLoaded', () => {
    const detailsContainer = document.getElementById('detailsContainer');
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        detailsContainer.innerHTML = '<p>Error: Movie ID not specified.</p>';
        return;
    }

    // --- Fetch all movies to find the specific one ---
    fetch('movies.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
         })
        .then(allMovies => {
            const movie = allMovies.find(m => m.id === movieId);
            if (movie) {
                displayMovieDetails(movie);
            } else {
                detailsContainer.innerHTML = '<p>Error: Movie not found.</p>';
            }
        })
        .catch(error => {
            console.error("Could not fetch movie details:", error);
            detailsContainer.innerHTML = '<p>Error loading movie details.</p>';
        });

    // --- Display Movie Details Function ---
    function displayMovieDetails(movie) {
        // Set page title and meta description (good for SEO if crawlable)
        document.title = `${movie.title} - Details`;
        const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
        metaDesc.name = "description";
        metaDesc.content = `Details, download links, and information for ${movie.title}. ${movie.description.substring(0, 100)}...`;
        if (!document.querySelector('meta[name="description"]')) {
            document.head.appendChild(metaDesc);
        }


        let downloadButtonsHTML = '';
        if (movie.downloads) {
            const qualities = ['480p', '720p', '1080p', '4k']; // Order of buttons
            qualities.forEach(quality => {
                 if (movie.downloads[quality]) {
                     downloadButtonsHTML += `
                        <a href="${movie.downloads[quality]}" target="_blank" class="download-btn">Download ${quality.toUpperCase()}</a>
                        <button class="copy-link-btn" data-link="${movie.downloads[quality]}">Copy ${quality} Link</button>
                     `;
                 }
            });
        } else {
            downloadButtonsHTML = '<p>No download links available.</p>';
        }

        detailsContainer.innerHTML = `
            <div class="movie-details-container">
                 <img src="${movie.posterUrl}" alt="${movie.title} Poster" class="details-poster">
                 <div class="movie-info">
                    <h2>${movie.title}</h2>
                    <p><strong>Release Date:</strong> ${movie.releaseDate || 'N/A'}</p>
                    <p><strong>Language:</strong> ${movie.language ? movie.language.join(', ') : 'N/A'}</p>
                    <p><strong>IMDb Rating:</strong> ${movie.imdbRating ? movie.imdbRating + '/10' : 'N/A'}</p>
                    <p><strong>Genre:</strong> ${movie.genres ? movie.genres.join(', ') : 'N/A'}</p>
                    <p><strong>Platform:</strong> ${movie.platform || 'N/A'}</p>
                    <p><strong>Description:</strong> ${movie.description || 'No description available.'}</p>
                 </div>
            </div>

            <div class="download-section">
                 <h3>Download Links</h3>
                 <div class="download-buttons">
                    ${downloadButtonsHTML}
                 </div>
                 ${movie.downloadCount ? `<p class="download-counter">Downloads: ${movie.downloadCount.toLocaleString()}</p>` : ''}
                 <!-- Note: Download counter is static from the JSON -->
            </div>
        `;

        // Add event listeners for Copy Link buttons
        addCopyLinkListeners();
    }

    // --- Copy Link Functionality ---
    function addCopyLinkListeners() {
        detailsContainer.querySelectorAll('.copy-link-btn').forEach(button => {
            button.addEventListener('click', () => {
                const linkToCopy = button.dataset.link;
                navigator.clipboard.writeText(linkToCopy)
                    .then(() => {
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        button.style.backgroundColor = '#28a745'; // Green feedback
                        setTimeout(() => {
                            button.textContent = originalText;
                            button.style.backgroundColor = ''; // Revert style
                        }, 1500); // Revert after 1.5 seconds
                    })
                    .catch(err => {
                        console.error('Failed to copy link: ', err);
                        alert('Failed to copy link. Please copy manually.');
                    });
            });
        });
    }

});
