document.getElementById('cardSearch').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.searchable-card');
    const sections = document.querySelectorAll('.category-section');

    cards.forEach(card => {
        const name = card.getAttribute('data-name');
        if (name.includes(searchTerm)) {
            card.classList.remove('d-none');
        } else {
            card.classList.add('d-none');
        }
    });

    sections.forEach(section => {
        const visibleCards = section.querySelectorAll('.searchable-card:not(.d-none)');
        const collapseElement = section.querySelector('.collapse');
        
        if (visibleCards.length === 0) {
            section.classList.add('d-none');
        } else {
            section.classList.remove('d-none');
            // Auto-expand if the user is searching
            if (searchTerm.length > 0) {
                $(collapseElement).collapse('show');
            }
        }
    });
});