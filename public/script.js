const API_URL = '/api/movies';
        let currentMovieId = null;

        $(document).ready(function() {
            loadMovies();
            
            $("#moviesContainer").sortable({
                items: ".col",
                cursor: "move",
                opacity: 0.8
            });
        });

        function saveMovie() {
            const movieData = {
                title: $('#title').val(),
                genre: $('#genre').val(),
                releaseYear: parseInt($('#releaseYear').val()),
                rating: parseFloat($('#rating').val()) || 0,
                watched: $('#watched').is(':checked'),
                notes: $('#notes').val()
            };

            const method = currentMovieId ? 'PUT' : 'POST';
            const url = currentMovieId ? `${API_URL}/${currentMovieId}` : API_URL;

            $.ajax({
                url: url,
                method: method,
                contentType: 'application/json',
                data: JSON.stringify(movieData),
                success: function(response) {
                    $('#movieModal').modal('hide');
                    $('#movieForm')[0].reset();
                    currentMovieId = null;
                    loadMovies();
                    showNotification(method === 'POST' ? 'Movie added successfully!' : 'Movie updated successfully!', 'success');
                },
                error: function(error) {
                    showNotification('Error saving movie: ' + (error.responseJSON?.message || 'Unknown error'), 'danger');
                }
            });
        }

        // Load all movies
        function loadMovies() {
            $('#loadingSpinner').show();
            $('#moviesContainer').empty();

            $.ajax({
                url: API_URL,
                method: 'GET',
                success: function(movies) {
                    $('#loadingSpinner').hide();
                    
                    if (movies.length === 0) {
                        $('#moviesContainer').html(`
                            <div class="col-12 text-center text-white">
                                <h4>No movies in your watchlist yet!</h4>
                                <p>Click "Add New Movie" to get started.</p>
                            </div>
                        `);
                        return;
                    }

                    movies.forEach(movie => {
                        const movieCard = createMovieCard(movie);
                        $('#moviesContainer').append(movieCard);
                    });
                },
                error: function(error) {
                    $('#loadingSpinner').hide();
                    showNotification('Error loading movies', 'danger');
                }
            });
        }

        // Create movie card
        function createMovieCard(movie) {
            const stars = '⭐'.repeat(Math.round(movie.rating / 2));
            return `
                <div class="col-md-6 col-lg-4">
                    <div class="card movie-card h-100 shadow">
                        ${movie.watched ? '<span class="badge bg-success watched-badge">✓ Watched</span>' : '<span class="badge bg-warning watched-badge">To Watch</span>'}
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <p class="card-text">
                                <strong>Genre:</strong> ${movie.genre}<br>
                                <strong>Year:</strong> ${movie.releaseYear}<br>
                                <strong>Rating:</strong> ${movie.rating}/10 <span class="rating-stars">${stars}</span>
                            </p>
                            ${movie.notes ? `<p class="card-text"><small class="text-muted">${movie.notes}</small></p>` : ''}
                        </div>
                        <div class="card-footer bg-transparent">
                            <button class="btn btn-sm btn-primary" onclick="editMovie('${movie._id}')">✏️ Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteMovie('${movie._id}', '${movie.title}')">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }

        //adding new movie
        function openAddModal() {
            currentMovieId = null;
            $('#modalTitle').text('Add New Movie');
            $('#movieForm')[0].reset();
        }

        //editing movie
        function editMovie(id) {
            currentMovieId = id;
            $('#modalTitle').text('Edit Movie');

            $.ajax({
                url: `${API_URL}/${id}`,
                method: 'GET',
                success: function(movie) {
                    $('#title').val(movie.title);
                    $('#genre').val(movie.genre);
                    $('#releaseYear').val(movie.releaseYear);
                    $('#rating').val(movie.rating);
                    $('#watched').prop('checked', movie.watched);
                    $('#notes').val(movie.notes);
                    $('#movieModal').modal('show');
                },
                error: function(error) {
                    showNotification('Error loading movie details', 'danger');
                }
            });
        }

        //Delete movie with confirmation
        function deleteMovie(id, title) {
            if (!confirm(`Are you sure you want to delete "${title}"?`)) {
                return;
            }

            $.ajax({
                url: `${API_URL}/${id}`,
                method: 'DELETE',
                success: function(response) {
                    loadMovies();
                    showNotification('Movie deleted successfully!', 'info');
                },
                error: function(error) {
                    showNotification('Error deleting movie', 'danger');
                }
            });
        }

        // Show notification
        function showNotification(message, type) {
            const notification = $(`
                <div class="alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3" style="z-index: 9999;">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `);
            
            $('body').append(notification);
            
            setTimeout(() => {
                notification.alert('close');
            }, 3000);
        }