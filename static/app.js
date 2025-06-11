const urlInput = document.getElementById('urlInput');
const checkButton = document.getElementById('checkButton');
const loadingState = document.getElementById('loadingState');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');

checkButton.addEventListener('click', checkRedirects);
urlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkRedirects();
    }
});

async function checkRedirects() {
    const url = urlInput.value.trim();
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    // Add protocol if missing
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url;
    }

    // Show loading state
    loadingState.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    checkButton.disabled = true;

    try {
        const response = await fetch('/api/check-redirects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: fullUrl })
        });

        const data = await response.json();

        if (response.ok) {
            displayResults(data);
        } else {
            displayError(data.error || 'Unknown error occurred');
        }
    } catch (error) {
        displayError('Network error: ' + error.message);
    } finally {
        loadingState.classList.add('hidden');
        checkButton.disabled = false;
    }
}

function displayResults(data) {
    // Update summary
    document.getElementById('totalSteps').textContent = data.total_steps;
    document.getElementById('finalStatus').textContent = data.success ? 'Success' : 'Failed';
    document.getElementById('totalDuration').textContent = data.total_duration;
    document.getElementById('redirectCount').textContent = data.steps.filter(step => step.status_code >= 300 && step.status_code < 400).length;

    // Update URLs
    document.getElementById('originalUrl').textContent = data.original_url;
    document.getElementById('finalUrl').textContent = data.final_url;

    // Update steps
    const stepsContainer = document.getElementById('redirectSteps');
    stepsContainer.innerHTML = '';

    data.steps.forEach((step, index) => {
        const stepElement = createStepElement(step, index + 1);
        stepsContainer.appendChild(stepElement);
    });

    resultsSection.classList.remove('hidden');
    
    if (data.error) {
        displayError(data.error);
    }
}

function createStepElement(step, stepNumber) {
    const div = document.createElement('div');
    div.className = 'step-card bg-gray-50 rounded-lg p-4 border-l-4 ' + getStatusBorderClass(step.status_code);

    const statusClass = getStatusClass(step.status_code);
    const statusIcon = getStatusIcon(step.status_code);

    // Create step header
    const stepHeader = document.createElement('div');
    stepHeader.className = 'flex items-start justify-between mb-2';
    
    const leftDiv = document.createElement('div');
    leftDiv.className = 'flex items-center';
    
    const stepBadge = document.createElement('span');
    stepBadge.className = 'bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full mr-3';
    stepBadge.textContent = 'Step ' + stepNumber;
    
    const statusSpan = document.createElement('span');
    statusSpan.className = statusClass + ' font-medium';
    statusSpan.innerHTML = '<i class="' + statusIcon + ' mr-1"></i>' + step.status_code + ' ' + getStatusText(step.status_code);
    
    leftDiv.appendChild(stepBadge);
    leftDiv.appendChild(statusSpan);
    
    const timestamp = document.createElement('span');
    timestamp.className = 'text-sm text-gray-500';
    timestamp.textContent = step.timestamp;
    
    stepHeader.appendChild(leftDiv);
    stepHeader.appendChild(timestamp);
    div.appendChild(stepHeader);

    // Create URL section
    const urlDiv = document.createElement('div');
    urlDiv.className = 'mb-2';
    
    const urlLabel = document.createElement('span');
    urlLabel.className = 'text-sm font-medium text-gray-700';
    urlLabel.textContent = 'URL:';
    
    const urlLink = document.createElement('a');
    urlLink.href = step.url;
    urlLink.target = '_blank';
    urlLink.className = 'text-blue-600 hover:underline break-all ml-2';
    urlLink.textContent = step.url;
    
    urlDiv.appendChild(urlLabel);
    urlDiv.appendChild(urlLink);
    div.appendChild(urlDiv);

    // Create headers section if headers exist
    if (step.headers && Object.keys(step.headers).length > 0) {
        const headersDiv = document.createElement('div');
        headersDiv.className = 'mt-3';
        
        const headersLabel = document.createElement('span');
        headersLabel.className = 'text-sm font-medium text-gray-700';
        headersLabel.textContent = 'Headers:';
        headersDiv.appendChild(headersLabel);
        
        const headersContainer = document.createElement('div');
        headersContainer.className = 'mt-1 space-y-1';
        
        Object.entries(step.headers).forEach(([key, value]) => {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'text-sm';
            
            const keySpan = document.createElement('span');
            keySpan.className = 'font-medium text-gray-600';
            keySpan.textContent = key + ':';
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'text-gray-800 ml-1 break-all';
            valueSpan.textContent = value;
            
            headerDiv.appendChild(keySpan);
            headerDiv.appendChild(valueSpan);
            headersContainer.appendChild(headerDiv);
        });
        
        headersDiv.appendChild(headersContainer);
        div.appendChild(headersDiv);
    }

    return div;
}

function getStatusClass(statusCode) {
    if (statusCode >= 200 && statusCode < 300) return 'status-success';
    if (statusCode >= 300 && statusCode < 400) return 'status-redirect';
    if (statusCode >= 400) return 'status-error';
    return 'status-info';
}

function getStatusIcon(statusCode) {
    if (statusCode >= 200 && statusCode < 300) return 'fas fa-check-circle';
    if (statusCode >= 300 && statusCode < 400) return 'fas fa-arrow-right';
    if (statusCode >= 400) return 'fas fa-exclamation-circle';
    return 'fas fa-info-circle';
}

function getStatusBorderClass(statusCode) {
    if (statusCode >= 200 && statusCode < 300) return 'border-green-400';
    if (statusCode >= 300 && statusCode < 400) return 'border-yellow-400';
    if (statusCode >= 400) return 'border-red-400';
    return 'border-blue-400';
}

function getStatusText(statusCode) {
    const statusTexts = {
        200: 'OK',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        307: 'Temporary Redirect',
        308: 'Permanent Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
    };
    return statusTexts[statusCode] || 'Unknown';
}

function displayError(message) {
    document.getElementById('errorMessage').textContent = message;
    errorSection.classList.remove('hidden');
} 