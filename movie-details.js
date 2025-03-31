<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Title and Meta Description will be set by JS -->
    <title>Movie Details</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="dark-theme">

    <header class="main-header">
         <div class="container header-content">
             <div class="logo">VEGAMOVIES30 CLONE</div> <!-- Or your site name -->
             <a href="index.html" style="color: var(--link-color);">← Back to Home</a>
        </div>
    </header>

    <main class="container">
        <div id="detailsContainer" class="movie-details-container">
            <!-- Content will be loaded here by JavaScript -->
            <p class="loading-message">Loading details...</p>
        </div>
    </main>

    <footer>
         <div class="container">
             <p>© 2023 Your Site Name. Disclaimer: This site does not store any files on its server...</p>
             <a href="admin.html" style="font-size: 0.8em; color: #555; margin-top: 5px; display: inline-block;">Admin Access</a>
        </div>
    </footer>

    <script src="movie-details.js"></script>
</body>
</html>
