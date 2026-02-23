const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let gapiLoaded = false;
let gisLoaded = false;
let tokenClient = null;

document.addEventListener('DOMContentLoaded', function() {

    const savedClientId = localStorage.getItem('googleClientId');
    if (savedClientId) {
        document.getElementById('clientId').value = savedClientId;
        initializeGoogleAPI();
    }
    
    document.getElementById('clientId').addEventListener('input', (e) => {
        const clientId = e.target.value.trim();
        if (clientId) {
            localStorage.setItem('googleClientId', clientId);
            initializeGoogleAPI();
        } else {
            document.getElementById('authorizeButton').disabled = true;
        }
    });
    
    document.getElementById('authorizeButton').addEventListener('click', () => {
        handleAuthClick();
    });
    
    document.getElementById('signoutButton').addEventListener('click', () => {
        handleSignout();
    });
    
    document.getElementById('syncNow').addEventListener('click', () => {
        syncGoogleEvents();
    });
    
    checkAuthStatus();
});

function initializeGoogleAPI() {
    const clientId = document.getElementById('clientId').value.trim();
    if (!clientId) {
        return;
    }
    
    gapi.load('client', () => {
        gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
        }).then(() => {
            gapiLoaded = true;
            updateUI();
        });
    });
    
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: '',
    });
    
    gisLoaded = true;
    updateUI();
}

function updateUI() {
    const clientId = document.getElementById('clientId').value.trim();
    const isAuthorized = gapi.client && gapi.client.getToken() !== null;
    
    document.getElementById('authorizeButton').disabled = !clientId || !gapiLoaded || !gisLoaded;
    document.getElementById('syncNow').disabled = !isAuthorized;
    document.getElementById('signoutButton').style.display = isAuthorized ? 'block' : 'none';
    document.getElementById('authorizeButton').style.display = isAuthorized ? 'none' : 'block';
}

function checkAuthStatus() {
    if (gapi.client && gapi.client.getToken() !== null) {
        updateUI();
    }
}

function handleAuthClick() {
    if (!tokenClient) {
        showStatus('Please enter your Google Client ID first.', 'error');
        return;
    }
    
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw resp;
        }
        updateUI();
        showStatus('Successfully authorized!', 'success');
        await syncGoogleEvents();
    };
    
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

function handleSignout() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        updateUI();
        showStatus('Signed out successfully.', 'success');
    }
}

async function syncGoogleEvents() {
    const statusDiv = document.getElementById('syncStatus');
    statusDiv.className = 'sync-status active';
    statusDiv.textContent = 'Syncing events...';
    
    try {
        const now = new Date();
        const timeMin = document.getElementById('syncPastEvents').checked 
            ? new Date(now.getFullYear(), 0, 1).toISOString()
            : now.toISOString();
        const timeMax = document.getElementById('syncFutureEvents').checked
            ? new Date(now.getFullYear() + 1, 11, 31).toISOString()
            : new Date(now.getFullYear(), 11, 31).toISOString();
        
        const response = await gapi.client.calendar.events.list({
            calendarId: 'primary',
            timeMin: timeMin,
            timeMax: timeMax,
            showDeleted: false,
            singleEvents: true,
            maxResults: 2500,
            orderBy: 'startTime',
        });
        
        const events = response.result.items || [];
        const localEvents = loadEvents();
        
        let addedCount = 0;
        events.forEach(event => {
            const start = event.start.dateTime || event.start.date;
            const end = event.end.dateTime || event.end.date;
            
            if (start) {
                const eventDate = start.split('T')[0];
                const eventTime = start.includes('T') ? start.split('T')[1].substring(0, 5) : null;
                

                const exists = localEvents.some(e => 
                    e.googleId === event.id || 
                    (e.title === event.summary && e.date === eventDate)
                );
                
                if (!exists) {
                    const newEvent = {
                        title: event.summary || 'Untitled Event',
                        date: eventDate,
                        time: eventTime,
                        type: 'other',
                        priority: 'medium',
                        description: event.description || null,
                        location: event.location || null,
                        reminder: 'none',
                        googleId: event.id,
                        source: 'google'
                    };
                    localEvents.push(newEvent);
                    addedCount++;
                }
            }
        });
        
        saveEvents(localEvents);
        
        statusDiv.textContent = `Sync complete! Added ${addedCount} new events from Google Calendar.`;
        statusDiv.style.background = '#d4edda';
        statusDiv.style.color = '#155724';
        
        if (document.getElementById('autoSync').checked) {
            setTimeout(syncGoogleEvents, 3600000); 
        }
    } catch (error) {
        console.error('Error syncing events:', error);
        statusDiv.textContent = `Error syncing events: ${error.message}`;
        statusDiv.style.background = '#f8d7da';
        statusDiv.style.color = '#721c24';
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    
    setTimeout(() => {
        statusDiv.className = 'status-message';
    }, 5000);
}

