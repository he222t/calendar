document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('eventForm');
    const eventsList = document.getElementById('eventsList');
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').value = today;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const event = {
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value || null,
            type: document.getElementById('eventType').value,
            priority: document.getElementById('eventPriority').value,
            description: document.getElementById('eventDescription').value || null,
            location: document.getElementById('eventLocation').value || null,
            reminder: document.getElementById('eventReminder').value
        };
        
        addEvent(event);
        form.reset();
        document.getElementById('eventDate').value = today;
        displayEvents();
        
        showMessage('Event added successfully!', 'success');
    });
    
    displayEvents();
});

function displayEvents() {
    const events = loadEvents();
    const eventsList = document.getElementById('eventsList');
    
    if (events.length === 0) {
        eventsList.innerHTML = '<p>No events yet. Add your first event above!</p>';
        return;
    }
    
    events.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() === dateB.getTime()) {
            return (a.time || '').localeCompare(b.time || '');
        }
        return dateA - dateB;
    });
    
    eventsList.innerHTML = '';
    
    events.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${event.type}`;
        
        const eventInfo = document.createElement('div');
        eventInfo.className = 'event-info';
        
        const date = new Date(event.date);
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        let html = `<h4>${event.title}</h4>`;
        html += `<p><strong>Date:</strong> ${dateStr}</p>`;
        
        if (event.time) {
            html += `<p><strong>Time:</strong> ${event.time}</p>`;
        }
        
        html += `<p><strong>Type:</strong> ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>`;
        html += `<p><strong>Priority:</strong> ${event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}</p>`;
        
        if (event.location) {
            html += `<p><strong>Location:</strong> ${event.location}</p>`;
        }
        
        if (event.description) {
            html += `<p>${event.description}</p>`;
        }
        
        eventInfo.innerHTML = html;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-event';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this event?')) {
                deleteEvent(event.id);
                displayEvents();
                showMessage('Event deleted successfully!', 'success');
            }
        });
        
        eventItem.appendChild(eventInfo);
        eventItem.appendChild(deleteBtn);
        eventsList.appendChild(eventItem);
    });
}

function showMessage(message, type) {

    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '10000';
    messageDiv.style.padding = '1rem 2rem';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

